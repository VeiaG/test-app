import { PAYLOAD_API_URL } from '@/config/api';
import { useAuth } from '@/hooks/useAuth';
import { Cart, Product } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stringify } from 'qs-esm';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
interface PayloadCartItemContent {
  product: string | Product;
  quantity: number;
  id?: string | null;
}
export interface CartItem extends Product {
  quantity: number;
}
interface CartContextType {
  cartItems: CartItem[];
  cartId: string | null;
  isLoading: boolean;
  error: string | null;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemQuantity: (productId: string) => number;
  totalCartItems: number;
  totalCartPrice: number;
  refetchCart: () => Promise<void>;
}
const LOCAL_CART_STORAGE_KEY = 'local_shopping_cart';
const LOCAL_CART_ID_KEY = 'local_cart_id';
const CartContext = createContext<CartContextType | undefined>(undefined);
interface CartProviderProps {
  children: ReactNode;
}
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [localCartLoaded, setLocalCartLoaded] = useState<boolean>(false);
  const initializationCompleted = useRef<boolean>(false);
  const loadLocalCart = useCallback(async (): Promise<{ items: CartItem[], savedCartId: string | null }> => {
    try {
      const [storedCart, storedCartId] = await Promise.all([
        AsyncStorage.getItem(LOCAL_CART_STORAGE_KEY),
        AsyncStorage.getItem(LOCAL_CART_ID_KEY)
      ]);
      const items = storedCart ? JSON.parse(storedCart) : [];
      const savedCartId = storedCartId || null;
      console.log('Loaded cart from AsyncStorage', { itemsCount: items.length, cartId: savedCartId });
      return { items, savedCartId };
    } catch (err) {
      console.error('Error loading cart from AsyncStorage:', err);
      return { items: [], savedCartId: null };
    }
  }, []);
  const saveLocalCart = useCallback(async (items: CartItem[], savedCartId: string | null): Promise<void> => {
    try {
      const saveOperations = [
        AsyncStorage.setItem(LOCAL_CART_STORAGE_KEY, JSON.stringify(items))
      ];
      if (savedCartId) {
        saveOperations.push(AsyncStorage.setItem(LOCAL_CART_ID_KEY, savedCartId));
      } else {
        saveOperations.push(AsyncStorage.removeItem(LOCAL_CART_ID_KEY));
      }
      await Promise.all(saveOperations);
      console.log('Cart saved to AsyncStorage', { itemsCount: items.length, cartId: savedCartId });
    } catch (err) {
      console.error('Error saving cart to AsyncStorage:', err);
    }
  }, []);
  const loadCartFromAPI = useCallback(async (): Promise<Cart | null> => {
    if (!user?.id || !token) {
      console.log('No user logged in or no token available, not fetching from API');
      return null;
    }
    console.log('Loading cart from Payload for user:', user.id);
    setIsLoading(true);
    setError(null);
    const query = stringify({
      where: {
        'user.equals': user.id,
      },
      depth: 2,
      limit: 1,
    }, { addQueryPrefix: true });
    try {
      const response = await fetch(`${PAYLOAD_API_URL}/cart${query}`, {
        method: 'GET',
        headers: {
          Authorization: `JWT ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        if (response.status === 404) {
          console.log('No cart found for user (404).');
          return null;
        } else if (response.status === 403 || response.status === 401) {
          console.error('Authorization error loading cart:', response.statusText);
          setError('Authorization error when loading cart.');
          return null;
        } else {
          console.error('Failed to load cart:', response.status, response.statusText);
          throw new Error(`Failed to load cart (status: ${response.status})`);
        }
      }
      const data = await response.json();
      if (data.docs && data.docs.length > 0) {
        const fetchedCart = data.docs[0] as Cart;
        console.log('Cart loaded:', fetchedCart.id);
        return fetchedCart;
      }
      return null;
    } catch (err: any) {
      console.error('Error fetching cart:', err);
      setError(err.message || 'Error loading cart.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, token]);
  const deleteCartFromAPI = useCallback(async (cartIdToDelete: string): Promise<boolean> => {
    if (!token || !cartIdToDelete) {
      return false;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Deleting cart ${cartIdToDelete}...`);
      const response = await fetch(`${PAYLOAD_API_URL}/cart/${cartIdToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `JWT ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to delete cart (status: ${response.status})`);
      }
      console.log(`Cart ${cartIdToDelete} deleted successfully.`);
      return true;
    } catch (err: any) {
      console.error("Failed to delete cart:", err);
      setError(err.message || "Failed to delete cart.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token]);
  const updateCartInAPI = useCallback(async (newCartItems: CartItem[], existingCartId: string | null): Promise<string | null> => {
    if (!user?.id || !token) {
      console.log('No user logged in or no token, not updating API');
      return null;
    }
    if (newCartItems.length === 0 && existingCartId) {
      const deleted = await deleteCartFromAPI(existingCartId);
      if (deleted) {
        return null;
      }
      return existingCartId;
    }
    setIsLoading(true);
    setError(null);
    const payloadContent: PayloadCartItemContent[] = newCartItems.map(item => ({
      product: item.id,
      quantity: item.quantity,
    }));
    console.log('Payload content to send:', payloadContent);
    try {
      let updatedCartId = existingCartId;
      if (existingCartId) {
        console.log(`Updating cart ${existingCartId} in Payload...`);
        const response = await fetch(`${PAYLOAD_API_URL}/cart/${existingCartId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `JWT ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: payloadContent }),
        });
        if (!response.ok) {
          if (response.status === 404) {
            console.log('Cart not found (404), creating a new one');
            return await createNewCartInAPI(newCartItems);
          }
          throw new Error(`Failed to update cart (status: ${response.status})`);
        }
      } else {
        return await createNewCartInAPI(newCartItems);
      }
      return updatedCartId;
    } catch (err: any) {
      console.error('Error updating/creating cart:', err);
      setError(err.message || 'Error updating cart.');
      return null;
    } finally {
      setIsLoading(false);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token, deleteCartFromAPI]);
  const createNewCartInAPI = useCallback(async (items: CartItem[]): Promise<string | null> => {
    if (!user?.id || !token) return null;
    console.log('Creating new cart in Payload...');
    const payloadContent: PayloadCartItemContent[] = items.map(item => ({
      product: item.id,
      quantity: item.quantity,
    }));
    try {
      const response = await fetch(`${PAYLOAD_API_URL}/cart`, {
        method: 'POST',
        headers: {
          Authorization: `JWT ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: user.id,
          content: payloadContent,
          totalPrice: 0
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating cart:', errorData);
        console.log('Attempted payload:', {
          user: user.id,
          content: payloadContent,
          totalPrice: 0
        });
        throw new Error(`Failed to create cart (status: ${response.status})`);
      }
      const newCartData = await response.json();
      if (newCartData && newCartData.doc && newCartData.doc.id) {
        console.log('New cart created with ID:', newCartData.doc.id);
        return newCartData.doc.id;
      } else {
        console.error("Failed to get new cart ID from response", newCartData);
        throw new Error("Failed to get new cart ID after creation.");
      }
    } catch (err) {
      console.error('Error creating new cart:', err);
      return null;
    }
  }, [user?.id, token]);
  useEffect(() => {
    const initializeCart = async () => {
      if (initializationCompleted.current) {
        console.log('Cart initialization already completed, skipping');
        return;
      }
      const { items: localItems, savedCartId } = await loadLocalCart();
      console.log('Initial load state:', { 
        localItems: localItems.length, 
        savedCartId, 
        userLoggedIn: !!user?.id,
        token: !!token 
      });
      setCartItems(localItems);
      setCartId(savedCartId);
      setLocalCartLoaded(true);
      if (!user?.id || !token) {
        console.log('No authenticated user, using only local cart');
        initializationCompleted.current = true;
        return;
      }
      console.log('User logged in, checking for server cart');
      const serverCart = await loadCartFromAPI();
      if (serverCart) {
        console.log(`Found server cart: ${serverCart.id}`);
        const serverItems: CartItem[] = serverCart.content
          .filter(item => item.product && typeof item.product === 'object')
          .map((item): CartItem => ({
            ...(item.product as Product),
            quantity: item.quantity,
          }));
        if (savedCartId && savedCartId === serverCart.id) {
          console.log('Using server cart as source of truth (IDs match)');
          setCartId(serverCart.id);
          setCartItems(serverItems);
          await saveLocalCart(serverItems, serverCart.id);
        }
        else if (savedCartId && savedCartId !== serverCart.id) {
          console.log('Cart ID mismatch - merging and keeping server cart');
          const mergedItems = [...localItems];
          serverItems.forEach(serverItem => {
            const existingItemIndex = mergedItems.findIndex(item => item.id === serverItem.id);
            if (existingItemIndex === -1) {
              mergedItems.push(serverItem);
            }
          });
          await updateCartInAPI(mergedItems, serverCart.id);
          setCartId(serverCart.id);
          setCartItems(mergedItems);
          await saveLocalCart(mergedItems, serverCart.id);
        }
        else if (localItems.length > 0) {
          console.log('Merging local items into server cart');
          const mergedItems = [...localItems];
          serverItems.forEach(serverItem => {
            const existingItemIndex = mergedItems.findIndex(item => item.id === serverItem.id);
            if (existingItemIndex === -1) {
              mergedItems.push(serverItem);
            }
          });
          await updateCartInAPI(mergedItems, serverCart.id);
          setCartId(serverCart.id);
          setCartItems(mergedItems);
          await saveLocalCart(mergedItems, serverCart.id);
        }
        else {
          console.log('Using server cart (no local items)');
          setCartId(serverCart.id);
          setCartItems(serverItems);
          await saveLocalCart(serverItems, serverCart.id);
        }
      }
      else if (localItems.length > 0) {
        console.log('Creating server cart with local items');
        const newCartId = await createNewCartInAPI(localItems);
        if (newCartId) {
          setCartId(newCartId);
          await saveLocalCart(localItems, newCartId);
        }
      }
      initializationCompleted.current = true;
    };
    if (user !== undefined) {
      initializeCart();
    }
  }, [user, token, loadLocalCart, loadCartFromAPI, saveLocalCart, updateCartInAPI, createNewCartInAPI]);
  const addToCart = useCallback(async (product: Product, quantity: number = 1) => {
    const currentItems = [...cartItems];
    const existingItemIndex = currentItems.findIndex((item) => item.id === product.id);
    let updatedItems: CartItem[];
    if (existingItemIndex > -1) {
      const updatedExistingItem = {
        ...currentItems[existingItemIndex],
        quantity: currentItems[existingItemIndex].quantity + quantity,
      };
      currentItems[existingItemIndex] = updatedExistingItem;
      updatedItems = currentItems;
    } else {
      const newItem: CartItem = {
        ...product,
        quantity: quantity,
      };
      updatedItems = [...currentItems, newItem];
    }
    setCartItems(updatedItems);
    await saveLocalCart(updatedItems, cartId);
    if (user?.id && token) {
      const updatedId = await updateCartInAPI(updatedItems, cartId);
      if (updatedId !== cartId) {
        setCartId(updatedId);
        await saveLocalCart(updatedItems, updatedId);
      }
    }
  }, [cartItems, cartId, updateCartInAPI, saveLocalCart, user, token]);
  const removeFromCart = useCallback(async (productId: string) => {
    const updatedItems = cartItems.filter((item) => item.id !== productId);
    setCartItems(updatedItems);
    const updatedCartId = updatedItems.length === 0 ? null : cartId;
    await saveLocalCart(updatedItems, updatedCartId);
    if (user?.id && token) {
      if (updatedItems.length === 0 && cartId) {
        await deleteCartFromAPI(cartId);
        setCartId(null);
      } else if (cartId) {
        await updateCartInAPI(updatedItems, cartId);
      }
    } else {
      setCartId(updatedCartId);
    }
  }, [cartItems, cartId, updateCartInAPI, saveLocalCart, user, token, deleteCartFromAPI]);
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    const updatedItems = cartItems.map((item) =>
      item.id === productId ? { ...item, quantity: quantity } : item
    );
    setCartItems(updatedItems);
    await saveLocalCart(updatedItems, cartId);
    if (user?.id && token && cartId) {
      await updateCartInAPI(updatedItems, cartId);
    }
  }, [cartItems, cartId, updateCartInAPI, saveLocalCart, removeFromCart, user, token]);
  const clearCart = useCallback(async () => {
    setCartItems([]);
    setCartId(null);
    await saveLocalCart([], null);
    if (user?.id && token && cartId) {
      await deleteCartFromAPI(cartId);
    }
  }, [cartId, saveLocalCart, user, token, deleteCartFromAPI]);
  const getItemQuantity = useCallback((productId: string): number => {
    const item = cartItems.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  }, [cartItems]);
  const totalCartItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);
  const totalCartPrice = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    );
  }, [cartItems]);
  const refetchCart = useCallback(async () => {
    if (!user?.id || !token) {
      const { items, savedCartId } = await loadLocalCart();
      setCartItems(items);
      setCartId(savedCartId);
      return;
    }
    const serverCart = await loadCartFromAPI();
    if (serverCart) {
      setCartId(serverCart.id);
      const serverItems = serverCart.content
        .filter(item => item.product && typeof item.product === 'object')
        .map((item): CartItem => ({
          ...(item.product as Product),
          quantity: item.quantity,
        }));
      setCartItems(serverItems);
      await saveLocalCart(serverItems, serverCart.id);
    } else {
      const { items: localItems } = await loadLocalCart();
      if (localItems.length > 0) {
        const newCartId = await createNewCartInAPI(localItems);
        if (newCartId) {
          setCartId(newCartId);
          setCartItems(localItems);
          await saveLocalCart(localItems, newCartId);
        }
      } else {
        setCartItems([]);
        setCartId(null);
        await saveLocalCart([], null);
      }
    }
  }, [loadCartFromAPI, loadLocalCart, saveLocalCart, user, token, createNewCartInAPI]);
  const value = useMemo(() => ({
    cartItems,
    cartId,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    totalCartItems,
    totalCartPrice,
    refetchCart,
  }), [
    cartItems,
    cartId,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    totalCartItems,
    totalCartPrice,
    refetchCart,
  ]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};