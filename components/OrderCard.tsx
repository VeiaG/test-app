import { defaultGray, primaryColor } from '@/config/Colors';
import { statusMap, succesfulPaymentStatus } from '@/config/contsants';
import { getImageURL } from '@/services/api';
import { Order } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from './ui/Card';
const OrderCard = ({item}:{
    item:Order
}) => {
  return (
    <TouchableOpacity
              onPress={() =>  router.push(`/orders/${item.id}`)}
            >
              <Card>
              <View style={styles.orderHeader}>
                <View>
                  <View style={styles.orderNumberRow}>
                    <Text style={styles.orderNumber}>№ {item.id.slice(5, 10)}</Text>
                    <View style={
                      item.status && succesfulPaymentStatus.includes(item.status) 
                        ? styles.statusDelivered 
                        : styles.statusInTransit
                    }>
                      <Text style={
                        item.status && succesfulPaymentStatus.includes(item.status) 
                          ? styles.statusTextDelivered 
                          : styles.statusTextInTransit
                      }>
                        {item.status && statusMap[item.status] 
                          ? statusMap[item.status] 
                          : 'Статус не вказано'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.orderDate}>
                    Від {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.orderPrice}>{item.totalPrice} грн</Text>
              </View>
              <View style={styles.productImages}>
                {item.content && item.content.map((content, index) => {
                  if (index > 3) return null;
                  if (!content.product) return null;
                  if (typeof content.product === 'string') return null;
                  if (!content.product.image || typeof content.product.image === 'string') return null;
                  if (!content.product.image.url) return null;
                  return (
                    <Image
                      key={content.id || index}
                      source={{ uri: getImageURL(content.product.image.url) }}
                      style={styles.productImage}
                    />
                  );
                })}
                {item.content && item.content.length > 4 && (
                  <View style={styles.moreItemsContainer}>
                    <Text style={styles.moreItemsText}>+{item.content.length - 4}</Text>
                  </View>
                )}
              </View>
              <View style={styles.orderFooter}>
                <TouchableOpacity 
                  style={styles.detailsButton}
                  onPress={() =>  router.push(`/orders/${item.id}`)}
                >
                  <Text style={styles.detailsButtonText}>Деталі замовлення</Text>
                  <Ionicons name="chevron-forward" size={16} color={primaryColor} />
                </TouchableOpacity>
              </View>
              </Card>
            </TouchableOpacity>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  orderDate: {
    fontSize: 14,
    color: '#64748b',
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: defaultGray,
  },
  statusDelivered: {
    backgroundColor: '#dcfce7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusTextDelivered: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  statusInTransit: {
    backgroundColor: '#fef3c7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusTextInTransit: {
    color: '#d97706',
    fontSize: 12,
    fontWeight: '600',
  },
  productImages: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#e5e7eb',
  },
  moreItemsContainer: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreItemsText: {
    fontWeight: '600',
    color: '#64748b',
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 6,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsButtonText: {
    color: primaryColor,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: primaryColor,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  authButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  authButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
export default OrderCard