import Button from '@/components/ui/Button';
import { accentColor, defaultGray } from '@/config/Colors';
import { useCart } from '@/context/CartContext';
import { useLiked } from '@/context/LikedContext';
import { getImageURL } from '@/services/api';
import { Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const formatPrice = (price: number): string => {
  return `${new Intl.NumberFormat('uk-UA').format(price)} грн`;
};
const LikedProductsScreen = () => {
  const router = useRouter();
  const {
    likedProducts,
    isLoading,
    error,
    removeFromLiked,
    clearLiked,
    refetchLiked,
    totalLikedProducts,
  } = useLiked();
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchLiked();
    setRefreshing(false);
  }, [refetchLiked]);
  const {addToCart,cartItems} = useCart();
  const handleRemoveItem = useCallback((product: Product) => {
    Alert.alert(
      'Видалити товар',
      `Ви впевнені, що хочете видалити ${product.name} з обраного?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        { 
          text: 'Видалити', 
          style: 'destructive',
          onPress: () => removeFromLiked(product.id)
        }
      ]
    );
  }, [removeFromLiked]);
  const handleClearAll = useCallback(() => {
    if (likedProducts.length === 0) return;
    Alert.alert(
      'Очистити обране',
      'Ви впевнені, що хочете видалити всі товари з обраного?',
      [
        { text: 'Скасувати', style: 'cancel' },
        { 
          text: 'Очистити все', 
          style: 'destructive',
          onPress: clearLiked
        }
      ]
    );
  }, [clearLiked, likedProducts.length]);
  const navigateToProduct = useCallback((productId: string) => {
    router.push(`/product/${productId}`);
  }, [router]);
  const renderItem = useCallback(({ item }: { item: Product }) => {
    const isInCart = cartItems.some(cartItem => cartItem.id === item.id);
    const countInCart = cartItems.filter(cartItem => cartItem.id === item.id).length;
    return (
      <TouchableOpacity 
        style={styles.productCard} 
        onPress={() => navigateToProduct(item?.slug || '')}
      >
        <View style={styles.productContent}>
          {}
          {item.image && typeof item.image !== 'string' && item.image.url ? (
            <Image
              source={{ uri: getImageURL(item.image.url) }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImage, styles.noImage]}>
              <Ionicons name="image-outline" size={30} color="#a0aec0" />
            </View>
          )}
          {}
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            {
              item.discount && item.discount > 0 ? (
                <Text style={{ textDecorationLine: 'line-through', color: '#9ca3af' }}>
                {formatPrice(item.price)}
              </Text> 
              ) : null
            }
            {item.price ? (
              <Text style={[styles.productPrice,
                item.discount && item.discount > 0 ? { color:accentColor } : {color:defaultGray}
              ]}>{formatPrice(item.price)}</Text>
            ) : null}
            {}
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleRemoveItem(item)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="heart" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
        <Button
            style={{ marginHorizontal:16, marginBottom: 10 }}
          variant={isInCart ? 'outline' : 'primary'}
            onPress={()=>{
              if (isInCart) {
                router.push('/cart');
              } else {
                addToCart(item);
              }
            }}
          >
          {
            !isInCart ? 'Додати в кошик' : `В кошику ${countInCart} шт.`
          }
          </Button>
      </TouchableOpacity>
    );
  }, [handleRemoveItem, navigateToProduct,cartItems,addToCart,router]);
  const renderEmptyList = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={80} color="#d1d5db" />
        <Text style={styles.emptyTitle}>Список порожній</Text>
        <Text style={styles.emptyText}>
          Ви ще не додали жодного товару до обраного
        </Text>
        <TouchableOpacity 
          style={styles.browseButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.browseButtonText}>Перейти до каталогу</Text>
        </TouchableOpacity>
      </View>
    );
  }, [isLoading, router]);
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Обране</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#ef4444" />
          <Text style={styles.errorTitle}>Помилка</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={refetchLiked}
          >
            <Text style={styles.retryButtonText}>Спробувати знову</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Обране {totalLikedProducts > 0 ? `(${totalLikedProducts})` : ''}
        </Text>
        {likedProducts.length > 0 ? (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Очистити</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
      {}
      {isLoading && likedProducts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      ) : (
        <FlatList
          data={likedProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0066CC']}
              tintColor="#0066CC"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    padding: 5,
  },
  clearButton: {
    paddingHorizontal: 10,
  },
  clearButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  itemSeparator: {
    height: 10,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  productContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 100,
    height: 100,
    backgroundColor: '#f3f4f6',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
    padding: 12,
    position: 'relative',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    paddingRight: 25,
    color: '#1f2937',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
    color: '#1f2937',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: '80%',
  },
  browseButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
    color: '#ef4444',
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  }
});
export default LikedProductsScreen;