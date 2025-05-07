import { Tabs } from 'expo-router';
// import { Home, Search, Settings, ShoppingCart, User } from 'lucide-react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { primaryColor } from '@/config/Colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShown: false,
      }}
    >
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Головна',
          tabBarIcon: ({ color, size }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Пошук',
          tabBarIcon: ({ color, size }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
        }}
      />
       <Tabs.Screen
        name="cart"
        options={{
          title: 'Кошик',
          tabBarIcon: ({ color, size }) => <IconSymbol size={28} name="cart.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Замовлення',
          tabBarIcon: ({ color, size }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Профіль',
          tabBarIcon: ({ color, size }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}