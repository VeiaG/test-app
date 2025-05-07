import Button from '@/components/ui/Button';
import { Card, CardSummary, CardSummaryLabel, CardSummaryValue, CardTitle } from '@/components/ui/Card';
import { PAYLOAD_API_URL } from '@/config/api';
import { defaultGray } from '@/config/Colors';
import { statusMap, succesfulPaymentStatus } from '@/config/contsants';
import { getImageURL } from '@/services/api';
import { Order } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const formatPrice = (price: number): string => {
    return `${new Intl.NumberFormat('uk-UA').format(price)} грн`;
  };
const OrderDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await fetch(`${PAYLOAD_API_URL}/order/${id}?depth=2`, {
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error('Не вдалося завантажити деталі замовлення');
        }
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Не вдалося завантажити деталі замовлення. Спробуйте пізніше.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);
  const getDeliveryMethod = (method?: string): string => {
    switch (method) {
      case 'nova_poshta': return 'Нова Пошта';
      case 'ukr_poshta': return 'Укрпошта';
      case 'self_pickup': return 'Самовивіз';
      default: return 'Не вказано';
    }
  };
  const getPaymentMethod = (method?: string): string => {
    switch (method) {
      case 'card': return 'Оплата карткою';
      case 'cash': return 'Готівкою при отриманні';
      default: return 'Не вказано';
    }
  };
type OrderContentItem = Order['content'] extends (infer U)[] ? U : never;
const renderOrderItem = ({ item }: { item: OrderContentItem }) => {
    if (!item.product || typeof item.product === 'string') return null;
    const productSlug = item.product.slug ;
    return (
      <TouchableOpacity
        onPress={() => router.push(`/product/${productSlug}`)}
      >
        <Card>
            <View style={styles.itemRow}>
                {}
                {item.product.image && typeof item.product.image !== 'string' && item.product.image.url ? (
                    <Image
                        source={{ uri: getImageURL(item.product.image.url) }}
                        style={styles.itemImage}
                    />
                ) : (
                    <View style={[styles.itemImage, styles.noImage]} />
                )}
                {}
                <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>
                        {item.product.name || 'Без назви'}
                    </Text>
                    {}
                    <View style={styles.priceQuantityRow}>
                        <Text style={styles.itemPrice}>
                            {formatPrice(item.product.price)}
                        </Text>
                        <Text style={styles.quantityText}>
                            {item.quantity} шт.
                        </Text>
                    </View>
                </View>
            </View>
        </Card>
        </TouchableOpacity>
    );
};
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Деталі замовлення</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      </SafeAreaView>
    );
  }
  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Деталі замовлення</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Помилка</Text>
          <Text style={styles.errorMessage}>{error || 'Не вдалося завантажити замовлення'}</Text>
          <Button 
          variant='primary'
          onPress={() => {
            router.push('/');
          }}
          >
            На головну
          </Button>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Замовлення #{order.id.slice(5, 10)}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {}
        <Card>
          <View style={styles.orderStatusHeader}>
            <CardTitle>Статус замовлення</CardTitle>
            <View style={
              order.status && succesfulPaymentStatus.includes(order.status)
                ? styles.statusDelivered
                : styles.statusInTransit
            }>
              <Text style={
                order.status && succesfulPaymentStatus.includes(order.status)
                  ? styles.statusTextDelivered
                  : styles.statusTextInTransit
              }>
                {order.status && statusMap[order.status] 
                  ? statusMap[order.status] 
                  : 'Статус не вказано'}
              </Text>
            </View>
          </View>
          <CardSummary>
            <CardSummaryLabel>Дата замовлення:</CardSummaryLabel>
            <CardSummaryValue>
              {new Date(order.createdAt).toLocaleDateString()}
            </CardSummaryValue>
          </CardSummary>
          {order.updatedAt && (
            <CardSummary>
              <CardSummaryLabel>Останнє оновлення:</CardSummaryLabel>
              <CardSummaryValue>
                {new Date(order.updatedAt).toLocaleDateString()}
              </CardSummaryValue>
            </CardSummary>
          )}
          <CardSummary>
          <CardSummaryLabel>Спосіб оплати:</CardSummaryLabel>
            <CardSummaryValue>
              {getPaymentMethod(order.payment as string)}
            </CardSummaryValue>
          </CardSummary>
        </Card>
        {}
        <CardTitle>Товари</CardTitle>
        <FlatList
          data={order.content}
          renderItem={renderOrderItem}
          keyExtractor={(item, index) => `${item.id || index}`}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
        {}
        <Card>
          <Text style={styles.sectionTitle}>Інформація про доставку</Text>
          <CardSummary>
            <CardSummaryLabel>Спосіб доставки:</CardSummaryLabel>
            <CardSummaryValue>
              {getDeliveryMethod(order.delivery as string)}
            </CardSummaryValue>
          </CardSummary>
          {order.address && (
            <CardSummary>
              <CardSummaryLabel>Адреса:</CardSummaryLabel>
              <CardSummaryValue>
                {order.address}
              </CardSummaryValue>
            </CardSummary>
          )}
        </Card>
        {}
        <Card>
          <CardTitle>Підсумок замовлення</CardTitle>
          {order.content?.map((item, idx) => {
            if (!item.product || typeof item.product === 'string') return null;
            return (
              <CardSummary key={item.id || idx}>
                <CardSummaryLabel>
                  {item.product.name} x {item.quantity}
                </CardSummaryLabel>
                <CardSummaryValue>
                  {formatPrice(item.product.price * item.quantity)}
                </CardSummaryValue>
              </CardSummary>
            );
          })}
          {
            order.delivery && order.delivery !=='self_pickup' ? (
                <CardSummary>
                    <CardSummaryLabel>Доставка</CardSummaryLabel>
                    <CardSummaryValue>
                    За тарифами перевізника
                    </CardSummaryValue>
                </CardSummary>
            ) : null
          }
          <View style={styles.separator} />
          <CardSummary>
            <Text style={styles.summaryTotalLabel}>Разом</Text>
            <Text style={styles.summaryTotalValue}>
              {formatPrice(order.totalPrice)}
            </Text>
          </CardSummary>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};
export default OrderDetailsScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 8,
    color: '#ef4444',
  },
  errorMessage: {
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
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 15,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  orderStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1f2937',
  },
  listSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 5,
    color: '#1f2937',
    paddingHorizontal: 5,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  orderInfoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  orderInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    maxWidth: '60%',
    textAlign: 'right',
  },
  paidStatusText: {
    color: '#059669',
    fontWeight: '600',
  },
  unpaidStatusText: {
    color: '#d97706',
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#e5e7eb',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#1f2937',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: defaultGray,
  },
  priceQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#4b5563',
    maxWidth: '70%',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  supportButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});