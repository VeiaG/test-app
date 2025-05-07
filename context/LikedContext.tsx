import { PAYLOAD_API_URL } from '@/config/api';
import { useAuth } from '@/hooks/useAuth';
import { Liked, Product } from '@/types';
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
interface LikedContextType {
  likedProducts: Product[];
  likedId: string | null;
  isLoading: boolean;
  error: string | null;
  addToLiked: (product: Product) => Promise<void>;
  removeFromLiked: (productId: string) => Promise<void>;
  clearLiked: () => Promise<void>;
  isProductLiked: (productId: string) => boolean;
  totalLikedProducts: number;
  refetchLiked: () => Promise<void>;
}
const LOCAL_LIKED_STORAGE_KEY = 'local_liked_products';
const LOCAL_LIKED_ID_KEY = 'local_liked_id';
const LikedContext = createContext<LikedContextType | undefined>(undefined);
interface LikedProviderProps {
  children: ReactNode;
}
export const LikedProvider: React.FC<LikedProviderProps> = ({ children }) => {
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [likedId, setLikedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [localLikedLoaded, setLocalLikedLoaded] = useState<boolean>(false);
  const initializationCompleted = useRef<boolean>(false);
  const loadLocalLiked = useCallback(async (): Promise<{ products: Product[], savedLikedId: string | null }> => {
    try {
      const [storedLiked, storedLikedId] = await Promise.all([
        AsyncStorage.getItem(LOCAL_LIKED_STORAGE_KEY),
        AsyncStorage.getItem(LOCAL_LIKED_ID_KEY)
      ]);
      const products = storedLiked ? JSON.parse(storedLiked) : [];
      const savedLikedId = storedLikedId || null;
      console.log('Loaded liked products from AsyncStorage', { productsCount: products.length, likedId: savedLikedId });
      return { products, savedLikedId };
    } catch (err) {
      console.error('Error loading liked products from AsyncStorage:', err);
      return { products: [], savedLikedId: null };
    }
  }, []);
  const saveLocalLiked = useCallback(async (products: Product[], savedLikedId: string | null): Promise<void> => {
    try {
      const saveOperations = [
        AsyncStorage.setItem(LOCAL_LIKED_STORAGE_KEY, JSON.stringify(products))
      ];
      if (savedLikedId) {
        saveOperations.push(AsyncStorage.setItem(LOCAL_LIKED_ID_KEY, savedLikedId));
      } else {
        saveOperations.push(AsyncStorage.removeItem(LOCAL_LIKED_ID_KEY));
      }
      await Promise.all(saveOperations);
      console.log('Liked products saved to AsyncStorage', { productsCount: products.length, likedId: savedLikedId });
    } catch (err) {
      console.error('Error saving liked products to AsyncStorage:', err);
    }
  }, []);
  const loadLikedFromAPI = useCallback(async (): Promise<Liked | null> => {
    if (!user?.id || !token) {
      console.log('No user logged in or no token available, not fetching from API');
      return null;
    }
    console.log('Loading liked products from Payload for user:', user.id);
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
      const response = await fetch(`${PAYLOAD_API_URL}/liked${query}`, {
        method: 'GET',
        headers: {
          Authorization: `JWT ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        if (response.status === 404) {
          console.log('No liked collection found for user (404).');
          return null;
        } else if (response.status === 403 || response.status === 401) {
          console.error('Authorization error loading liked products:', response.statusText);
          setError('Authorization error when loading liked products.');
          return null;
        } else {
          console.error('Failed to load liked products:', response.status, response.statusText);
          throw new Error(`Failed to load liked products (status: ${response.status})`);
        }
      }
      const data = await response.json();
      if (data.docs && data.docs.length > 0) {
        const fetchedLiked = data.docs[0] as Liked;
        console.log('Liked collection loaded:', fetchedLiked.id);
        return fetchedLiked;
      }
      return null;
    } catch (err: any) {
      console.error('Error fetching liked products:', err);
      setError(err.message || 'Error loading liked products.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, token]);
  const updateLikedInAPI = useCallback(async (newLikedProducts: Product[], existingLikedId: string | null): Promise<string | null> => {
    if (!user?.id || !token) {
      console.log('No user logged in or no token, not updating API');
      return null;
    }
    setIsLoading(true);
    setError(null);
    const productIds: string[] = newLikedProducts.map(product => product.id);
    console.log('Product IDs to send:', productIds);
    try {
      let updatedLikedId = existingLikedId;
      if (existingLikedId) {
        console.log(`Updating liked collection ${existingLikedId} in Payload...`);
        const response = await fetch(`${PAYLOAD_API_URL}/liked/${existingLikedId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `JWT ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ products: productIds }),
        });
        if (!response.ok) {
          if (response.status === 404) {
            console.log('Liked collection not found (404), creating a new one');
            return await createNewLikedInAPI(newLikedProducts);
          }
          throw new Error(`Failed to update liked collection (status: ${response.status})`);
        }
      } else {
        return await createNewLikedInAPI(newLikedProducts);
      }
      return updatedLikedId;
    } catch (err: any) {
      console.error('Error updating/creating liked collection:', err);
      setError(err.message || 'Error updating liked collection.');
      return existingLikedId;
    } finally {
      setIsLoading(false);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token]);
  const createNewLikedInAPI = useCallback(async (products: Product[]): Promise<string | null> => {
    if (!user?.id || !token) return null;
    console.log('Creating new liked collection in Payload...');
    const productIds: string[] = products.map(product => product.id);
    try {
      const response = await fetch(`${PAYLOAD_API_URL}/liked`, {
        method: 'POST',
        headers: {
          Authorization: `JWT ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: user.id,
          products: productIds
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating liked collection:', errorData);
        console.log('Attempted payload:', {
          user: user.id,
          products: productIds
        });
        throw new Error(`Failed to create liked collection (status: ${response.status})`);
      }
      const newLikedData = await response.json();
      if (newLikedData && newLikedData.doc && newLikedData.doc.id) {
        console.log('New liked collection created with ID:', newLikedData.doc.id);
        return newLikedData.doc.id;
      } else {
        console.error("Failed to get new liked collection ID from response", newLikedData);
        throw new Error("Failed to get new liked collection ID after creation.");
      }
    } catch (err) {
      console.error('Error creating new liked collection:', err);
      return null;
    }
  }, [user?.id, token]);
  const safeProcessServerProducts = (likedData: Liked | null): Product[] => {
    if (!likedData || !likedData.products) return [];
    return likedData.products
      .filter(product => product && typeof product === 'object')
      .map((product) => product as Product);
  };
  useEffect(() => {
    const initializeLiked = async () => {
      if (initializationCompleted.current) {
        console.log('Liked products initialization already completed, skipping');
        return;
      }
      const { products: localProducts, savedLikedId } = await loadLocalLiked();
      console.log('Initial load state:', { 
        localProducts: localProducts.length, 
        savedLikedId, 
        userLoggedIn: !!user?.id,
        token: !!token 
      });
      setLikedProducts(localProducts);
      setLikedId(savedLikedId);
      setLocalLikedLoaded(true);
      if (!user?.id || !token) {
        console.log('No authenticated user, using only local liked products');
        initializationCompleted.current = true;
        return;
      }
      console.log('User logged in, checking for server liked collection');
      const serverLiked = await loadLikedFromAPI();
      if (serverLiked) {
        console.log(`Found server liked collection: ${serverLiked.id}`);
        const serverProducts: Product[] = safeProcessServerProducts(serverLiked);
        if (savedLikedId && savedLikedId === serverLiked.id) {
          console.log('Using server liked collection as source of truth (IDs match)');
          setLikedId(serverLiked.id);
          setLikedProducts(serverProducts);
          await saveLocalLiked(serverProducts, serverLiked.id);
        }
        else if (savedLikedId && savedLikedId !== serverLiked.id) {
          console.log('Liked ID mismatch - merging and keeping server liked collection');
          const mergedProducts = [...localProducts];
          serverProducts.forEach(serverProduct => {
            const exists = mergedProducts.some(product => product.id === serverProduct.id);
            if (!exists) {
              mergedProducts.push(serverProduct);
            }
          });
          await updateLikedInAPI(mergedProducts, serverLiked.id);
          setLikedId(serverLiked.id);
          setLikedProducts(mergedProducts);
          await saveLocalLiked(mergedProducts, serverLiked.id);
        }
        else if (localProducts.length > 0) {
          console.log('Merging local products into server liked collection');
          const mergedProducts = [...localProducts];
          serverProducts.forEach(serverProduct => {
            const exists = mergedProducts.some(product => product.id === serverProduct.id);
            if (!exists) {
              mergedProducts.push(serverProduct);
            }
          });
          await updateLikedInAPI(mergedProducts, serverLiked.id);
          setLikedId(serverLiked.id);
          setLikedProducts(mergedProducts);
          await saveLocalLiked(mergedProducts, serverLiked.id);
        }
        else {
          console.log('Using server liked collection (no local products)');
          setLikedId(serverLiked.id);
          setLikedProducts(serverProducts);
          await saveLocalLiked(serverProducts, serverLiked.id);
        }
      }
      else if (localProducts.length > 0) {
        console.log('Creating server liked collection with local products');
        const newLikedId = await createNewLikedInAPI(localProducts);
        if (newLikedId) {
          setLikedId(newLikedId);
          await saveLocalLiked(localProducts, newLikedId);
        }
      } else {
        console.log('Creating empty server liked collection for user');
        const newLikedId = await createNewLikedInAPI([]);
        if (newLikedId) {
          setLikedId(newLikedId);
          setLikedProducts([]);
          await saveLocalLiked([], newLikedId);
        }
      }
      initializationCompleted.current = true;
    };
    if (user !== undefined) {
      initializeLiked();
    }
  }, [user, token, loadLocalLiked, loadLikedFromAPI, saveLocalLiked, updateLikedInAPI, createNewLikedInAPI]);
  const addToLiked = useCallback(async (product: Product) => {
    const exists = likedProducts.some(p => p.id === product.id);
    if (exists) {
      console.log(`Product ${product.id} already in liked collection`);
      return;
    }
    const updatedProducts = [...likedProducts, product];
    setLikedProducts(updatedProducts);
    await saveLocalLiked(updatedProducts, likedId);
    if (user?.id && token) {
      const updatedId = await updateLikedInAPI(updatedProducts, likedId);
      if (updatedId !== likedId) {
        setLikedId(updatedId);
        await saveLocalLiked(updatedProducts, updatedId);
      }
    }
  }, [likedProducts, likedId, updateLikedInAPI, saveLocalLiked, user, token]);
  const removeFromLiked = useCallback(async (productId: string) => {
    const updatedProducts = likedProducts.filter((product) => product.id !== productId);
    setLikedProducts(updatedProducts);
    await saveLocalLiked(updatedProducts, likedId);
    if (user?.id && token && likedId) {
      await updateLikedInAPI(updatedProducts, likedId);
    }
  }, [likedProducts, likedId, updateLikedInAPI, saveLocalLiked, user, token]);
  const clearLiked = useCallback(async () => {
    setLikedProducts([]);
    await saveLocalLiked([], likedId);
    if (user?.id && token && likedId) {
      await updateLikedInAPI([], likedId);
    }
  }, [likedId, saveLocalLiked, user, token, updateLikedInAPI]);
  const isProductLiked = useCallback((productId: string): boolean => {
    return likedProducts.some((product) => product.id === productId);
  }, [likedProducts]);
  const totalLikedProducts = useMemo(() => {
    return likedProducts.length;
  }, [likedProducts]);
  const refetchLiked = useCallback(async () => {
    if (!user?.id || !token) {
      const { products, savedLikedId } = await loadLocalLiked();
      setLikedProducts(products);
      setLikedId(savedLikedId);
      return;
    }
    const serverLiked = await loadLikedFromAPI();
    if (serverLiked) {
      setLikedId(serverLiked.id);
      const serverProducts = safeProcessServerProducts(serverLiked);
      setLikedProducts(serverProducts);
      await saveLocalLiked(serverProducts, serverLiked.id);
    } else {
      const { products: localProducts } = await loadLocalLiked();
      const newLikedId = await createNewLikedInAPI(localProducts);
      if (newLikedId) {
        setLikedId(newLikedId);
        setLikedProducts(localProducts);
        await saveLocalLiked(localProducts, newLikedId);
      }
    }
  }, [loadLikedFromAPI, loadLocalLiked, saveLocalLiked, user, token, createNewLikedInAPI]);
  const value = useMemo(() => ({
    likedProducts,
    likedId,
    isLoading,
    error,
    addToLiked,
    removeFromLiked,
    clearLiked,
    isProductLiked,
    totalLikedProducts,
    refetchLiked,
  }), [
    likedProducts,
    likedId,
    isLoading,
    error,
    addToLiked,
    removeFromLiked,
    clearLiked,
    isProductLiked,
    totalLikedProducts,
    refetchLiked,
  ]);
  return <LikedContext.Provider value={value}>{children}</LikedContext.Provider>;
};
export const useLiked = (): LikedContextType => {
  const context = useContext(LikedContext);
  if (context === undefined) {
    throw new Error('useLiked must be used within a LikedProvider');
  }
  return context;
};