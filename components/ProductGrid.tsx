import { Product } from '@/types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ProductCard from './ProductCard';
type Props = {
  products: Product[];
};
const ProductGrid: React.FC<Props> = ({ products }) => {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} item={product} />
        ))}
      </View>
    </View>
  );
};
export default ProductGrid;
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
