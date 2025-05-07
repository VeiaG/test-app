import { Card, CardSummary, CardSummaryLabel, CardSummaryValue } from '@/components/ui/Card';
import { PAYLOAD_API_URL } from '@/config/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
type DeliveryOption = 'nova_poshta' | 'ukr_poshta' | 'self_pickup';
type PaymentOption = 'card' | 'cash' ;
const CheckoutPage = () => {
    const params = useLocalSearchParams();
    const checkoutParams = params.checkoutParams as string || null;
    let checkoutData:{
        deliveryOption: DeliveryOption | null;
        paymentOption: PaymentOption | null;
        totalPrice: number;
    } | null = null;
    if (checkoutParams) {
        try {
            checkoutData = JSON.parse(checkoutParams as string);
        } catch (e) {
            console.error('Error parsing checkoutParams:', e);
        }
    }
    const {cartItems,clearCart} = useCart();
    const {user} = useAuth();
    useEffect(()=>{
        if(user) {
            setFullName(user?.fullName || '');
            setPhone(user?.phone || '');
        }
    },[user])
    const [fullName, setFullName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const validateData = ()=>{
        if(!fullName || !phone || !address) {
            return false;
        }
        const phoneRegex = /^\+380\d{9}$/;
        if(!phoneRegex.test(phone)) {
            return false;
        }
        return true;
    }
    const handleCheckout = async () => {
        const isValid = validateData();
        if (!isValid) {
            alert('Будь ласка, заповніть всі поля коректно.');
            return;
        }
        try{
            console.log('Checkout data:', {
                user: user?.id,
                content: cartItems.map(item => ({
                    product: item.id,
                    quantity: item.quantity,
                })),
                totalPrice:0,
                delivery: checkoutData?.deliveryOption,
                payment: checkoutData?.paymentOption,
                fullName,
                phone,
                address,
            });
            await fetch(`${PAYLOAD_API_URL}/order`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: user?.id,
                    content: cartItems.map(item => ({
                        product: item.id,
                        quantity: item.quantity,
                    })),
                    totalPrice:0,
                    delivery: checkoutData?.deliveryOption,
                    payment: checkoutData?.paymentOption,
                    fullName,
                    phone,
                    address,
                }),
            })
            .then(async (res) => {
                if(!res.ok) {
                    const errorData = await res.json();
                    console.error('Error response:', errorData);
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                if(data?.doc?.id) {
                    alert('Замовлення успішно оформлено!');
                    clearCart();
                    router.push('/');
                } else {
                    alert('Сталася помилка під час оформлення замовлення. Спробуйте ще раз.');
                }
            });
        }
        catch(e) {
            console.error('Checkout error:', e);
            alert('Сталася помилка під час оформлення замовлення. Спробуйте ще раз.');
        }
    }
    if(!checkoutData) {
        router.push('/cart')
        return null; 
    }
    return (
       <SafeAreaView edges={['top']} style={{flex: 1}}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Оформлення замовлення</Text>
            <View style={{ width: 40 }} />
        </View>
         <ScrollView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.label}>Повне ім&apos;я</Text>
                <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Введіть ваше повне ім'я"
                    placeholderTextColor="#666"
                />
                <Text style={styles.label}>Номер телефону</Text>
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+380 XX XXX XX XX"
                    placeholderTextColor="#666"
                    keyboardType="phone-pad"
                />
                {
                    checkoutData.deliveryOption !== 'self_pickup' && (
                        <>
                            <Text style={styles.label}>Адреса доставки</Text>
                            <TextInput
                                style={[styles.input, styles.addressInput]}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Введіть адресу доставки"
                                placeholderTextColor="#666"
                                multiline
                            />
                        </>
                    )
                }
                <Card>
                    <CardSummary>
                        <CardSummaryLabel>Доставка</CardSummaryLabel>
                        <CardSummaryValue>
                            {checkoutData.deliveryOption === 'nova_poshta' ? 'Нова Пошта' : checkoutData.deliveryOption === 'ukr_poshta' ? 'УкрПошта' : 'Самовивіз'}
                        </CardSummaryValue>
                    </CardSummary>
                    <CardSummary>
                        <CardSummaryLabel>Оплата</CardSummaryLabel>
                        <CardSummaryValue>
                            {checkoutData.paymentOption === 'card' ? 'Картка' : 'Готівка'}
                        </CardSummaryValue>
                    </CardSummary>
                    <CardSummary>
                        <CardSummaryLabel>Сума</CardSummaryLabel>
                        <CardSummaryValue>{checkoutData.totalPrice} грн</CardSummaryValue>
                    </CardSummary>
                </Card>
                <TouchableOpacity style={styles.applePayButton}
                    onPress={handleCheckout}
                    disabled={!validateData()}
                >
                    <Text style={styles.applePayText}>Оплатити через Apple Pay</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
       </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#000',
    },
    formContainer: {
        gap: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    addressInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    summaryContainer: {
        backgroundColor: '#f5f5f5',
        padding: 16,
        borderRadius: 8,
        marginTop: 20,
        marginBottom: 20,
    },
    summaryText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    applePayButton: {
        backgroundColor: '#000',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    applePayText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
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
});
export default CheckoutPage