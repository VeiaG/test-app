import { accentColor, defaultGray } from '@/config/Colors';
import { getImageURL } from '@/services/api';
import { Product } from '@/types';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('uk-UA').format(price);
};
const ProductCard = ({ item,isHorizontal }: { item: Product,isHorizontal?:boolean }) => {
  return (
    <TouchableOpacity
      style={
        [styles.productCard , 
          isHorizontal ? { width: 160, marginRight: 16 } : {}
        ]
      }
      onPress={() => router.push(`/product/${item.slug}`)}
    >
      <View style={styles.productImageContainer}>
        {typeof item.image !== 'string' && item.image && item.image.url ? (
          <Image source={{ uri: getImageURL(item.image.url) }} style={styles.productImage} />
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}
        {item.discount && item.discount !== 0 ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discount}%</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        {item.oldPrice !== 0 && item.oldPrice !== undefined && item.oldPrice !== null ? (
          <Text style={styles.oldPrice}>{formatPrice(item?.oldPrice)} грн</Text>
        ) : null}
        <Text style={[styles.price,
          item.discount && item.discount !== 0 ? { color: accentColor} : {color:defaultGray}
        ]}>{formatPrice(item.price)} грн</Text>
      </View>
    </TouchableOpacity>
  );
};
export default ProductCard;
const styles = StyleSheet.create({
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  noImageText: {
    fontSize: 12,
    color: '#999',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: accentColor,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    height: 40,
  },
  oldPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
