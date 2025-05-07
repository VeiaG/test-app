
import { CartProvider } from '@/context/CartContext';
import { LikedProvider } from '@/context/LikedContext';
import { AuthProvider } from '@/hooks/useAuth';
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <AuthProvider>
    <CartProvider>
    <LikedProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="search-modal" options={{ headerShown: false, }} />
        <Stack.Screen name="orders/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
        <Stack.Screen name="liked" options={{ headerShown: false }} />
      </Stack>
    </LikedProvider>
    </CartProvider>
    </AuthProvider>
  );
}