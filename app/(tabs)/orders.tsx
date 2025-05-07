import OrderCard from '@/components/OrderCard';
import Button from '@/components/ui/Button';
import { PAYLOAD_API_URL } from '@/config/api';
import { defaultGray, primaryColor } from '@/config/Colors';
import { useAuth } from '@/hooks/useAuth';
import { Order } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { stringify } from 'qs-esm';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const OrdersScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const query = stringify({
          depth: '2',
          limit:0,
          sort: '-createdAt',
          where: {
            user: {
              equals: user.id
            }
          }
        })
        const response = await fetch(`${PAYLOAD_API_URL}/order?${query}`, {
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error('Не вдалося завантажити замовлення');
        }
        const data = await response.json();
        setOrders(data.docs);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Не вдалося завантажити замовлення. Спробуйте пізніше.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);
  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text>Увійдіть, щоб переглянути замовлення</Text>
        <Button
          style={{marginTop: 16}}
          onPress={() => router.push('/account')}
        >
          <Text style={styles.authButtonText}>Увійти</Text>
        </Button>
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Замовлення </Text>
        </View>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>Спробувати ще раз</Text>
          </TouchableOpacity>
        </View>
      ) : orders && orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <OrderCard item={item}/>
          )}
        />
      ) : (
        <View style={styles.centerContainer}>
          <MaterialIcons name="shopping-bag" size={60} color={
            defaultGray
          } />
          <Text style={styles.emptyTitle}>Немає замовлень</Text>
          <Text style={styles.emptySubtitle}>Ви ще не зробили жодного замовлення</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/search')}
          >
            <Text style={styles.shopButtonText}>Перейти до покупок</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};
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
export default OrdersScreen;