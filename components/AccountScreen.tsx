import { PAYLOAD_API_URL } from '@/config/api';
import { primaryColor } from '@/config/Colors';
import { useCart } from '@/context/CartContext';
import { useLiked } from '@/context/LikedContext';
import { useAuth } from '@/hooks/useAuth';
import { Order } from '@/types';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { stringify } from 'qs-esm';
import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import OrderCard from './OrderCard';
import { Card, CardTitle } from './ui/Card';
const Avatar = ({ source, name }: { source?: string; name: string }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
  return (
    <View style={styles.avatar}>
      {source ? (
        <Image source={{ uri: source }} style={styles.avatarImage} />
      ) : (
        <Text style={styles.avatarFallback}>{initials}</Text>
      )}
    </View>
  );
};
const Separator = () => {
  return <View style={styles.separator} />;
};
const AccountScreen = () => {
  const {logout,user} = useAuth();
  const [lastOrders, setLastOrders] = useState<Order[] | null>(null)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const query = stringify({
          depth:2,
          limit: 2,
          where: {
            'user': {
              'equals': user?.id
            }
          },
          sort: '-createdAt',
        })
        const response = await fetch(`${PAYLOAD_API_URL}/order?${query}`, {
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setLastOrders(data.docs);
        console.log('Fetched orders:', data.docs);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    }
    fetchOrders();
  }, [user])
  const {totalLikedProducts} = useLiked();
  const {totalCartItems}= useCart();
  if(!user) {
    return null;
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView}>
        {}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Мій акаунт</Text>
        </View>
        {}
        <Card>
          <View style={styles.profileContainer}>
            <Avatar  name={user.fullName} />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.fullName}</Text>
              <Text style={styles.userEmail}>{user.email} | {user.phone}</Text>
            </View>
          </View>
        </Card>
        {}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Останні замовлення</Text>
            <TouchableOpacity 
              style={styles.seeAllButton} 
              onPress={() => router.push('/orders')}
            >
              <Text style={styles.seeAllText}>Усі замовлення</Text>
              {}
            </TouchableOpacity>
          </View>
          {lastOrders && lastOrders.length > 0 ? (
            lastOrders.map((order) => (
              <OrderCard
                key={order.id} 
                item={order} 
                />
            )) 
          ): (
            <Text style={{ padding: 16, textAlign: 'center' }}>Немає замовлень</Text>
          )}
        </View>
        {}
        <View style={[styles.sectionContainer,{marginBottom:40}]}>
          <CardTitle>Меню</CardTitle>
          <Card
          style={{
            paddingHorizontal:0,
            paddingVertical:4,
          }}
          >
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => router.push('/liked')}
          >
            <View style={styles.menuItemLeft}>
              <Feather name="heart" size={20} color="#666" />
              <Text style={styles.menuItemText}>
                Вподобані товари
              </Text>
            </View>
            <View style={styles.menuItemRight}>
              <View style={styles.menuItemBadge}>
                  <Text style={styles.menuItemBadgeText}>{totalLikedProducts}</Text>
                </View>
              {}
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => router.push('/liked')}
          >
            <View style={styles.menuItemLeft}>
              <Feather name="shopping-cart" size={20} color="#666" />
              <Text style={styles.menuItemText}>
                Мій кошик
              </Text>
            </View>
            <View style={styles.menuItemRight}>
              <View style={styles.menuItemBadge}>
                  <Text style={styles.menuItemBadgeText}>{totalCartItems }</Text>
                </View>
            </View>
          </TouchableOpacity>
            <Separator />
            <TouchableOpacity style={styles.logoutButton}
                onPress={logout}
            >
                <MaterialIcons name="logout" size={24} color="#FF3B30" />
              <Text style={styles.logoutText}>Вийти</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: primaryColor,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    fontSize: 20,
    fontWeight: '700',
    color: '#666',
  },
  profileInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: primaryColor,
    marginRight: 4,
  },
  orderItem: {
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusDelivered: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#E3F3E6',
    borderRadius: 10,
  },
  statusTextDelivered: {
    fontSize: 12,
    color: '#34C759',
  },
  statusInTransit: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#E5F1FF',
    borderRadius: 10,
  },
  statusTextInTransit: {
    fontSize: 12,
    color: '#007AFF',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  productImages: {
    flexDirection: 'row',
    marginTop: 12,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E1E1E1',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginRight: 8,
  },
  menuItemBadgeText: {
    fontSize: 12,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 12,
  }
});
export default AccountScreen;