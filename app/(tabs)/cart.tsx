import RegularPicker from "@/components/RegularPicker";
import Button from "@/components/ui/Button";
import {
    Card,
    CardSummary,
    CardSummaryLabel,
    CardSummaryValue,
    CardTitle,
    Separator,
} from "@/components/ui/Card";
import { accentColor, defaultGray } from "@/config/Colors";
import { CartItem, useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { getImageURL } from "@/services/api";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
type DeliveryOption = "nova_poshta" | "ukr_poshta" | "self_pickup";
type PaymentOption = "card" | "cash";
const deliveryOptions: { value: DeliveryOption; label: string }[] = [
    { value: "nova_poshta", label: "Нова Пошта" },
    { value: "ukr_poshta", label: "Укрпошта" },
    { value: "self_pickup", label: "Самовивіз" },
];
const paymentOptions: { value: PaymentOption; label: string }[] = [
    { value: "card", label: "Оплата карткою" },
    { value: "cash", label: "Готівкою при отриманні" },
];
const formatPrice = (price: number): string => {
    return `${new Intl.NumberFormat("uk-UA").format(price)} грн`;
};
export default function CartScreen() {
    const router = useRouter();
    const {
        cartItems,
        isLoading: isCartLoading,
        error: cartError,
        updateQuantity,
        removeFromCart,
        totalCartPrice,
    } = useCart();
    const { user } = useAuth();
    const [selectedDelivery, setSelectedDelivery] =
        useState<DeliveryOption>("nova_poshta");
    const [selectedPayment, setSelectedPayment] =
        useState<PaymentOption>("card");
    const handleCheckout = () => {
        if (isCartLoading) return;
        console.log("Proceeding to checkout with:", {
            items: cartItems,
            delivery: selectedDelivery,
            payment: selectedPayment,
            total: totalCartPrice,
        });
        if (!user) {
            alert("Вам потрібно увійти в систему, щоб оформити замовлення.");
            router.push("/account");
            return;
        }
        router.push({
            pathname: "/checkout",
            params: {
                checkoutParams: JSON.stringify({
                    deliveryOption: selectedDelivery,
                    paymentOption: selectedPayment,
                    totalPrice: totalCartPrice,
                }),
            },
        });
    };
    const renderCartItem = ({ item }: { item: CartItem }) => (
        <Card>
            <View style={styles.itemRow}>
                {typeof item.image !== "string" &&
                item.image &&
                item.image.url ? (
                    <Image
                        source={{ uri: getImageURL(item.image.url) }}
                        style={styles.itemImage}
                    />
                ) : null}
                <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>
                        {item.name}
                    </Text>
                    {item.discount && item.discount > 0 ? (
                        <Text
                            style={{
                                textDecorationLine: "line-through",
                                color: "#6b7280",
                            }}
                        >
                            {formatPrice(item?.oldPrice || 0)}
                        </Text>
                    ) : null}
                    <Text
                        style={[
                            styles.itemPrice,
                            item.discount && item.discount > 0
                                ? { color: accentColor }
                                : { color: defaultGray },
                        ]}
                    >
                        {formatPrice(item.price)}
                    </Text>
                </View>
            </View>
            <View style={styles.itemControls}>
                <View style={styles.quantityControl}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() =>
                            updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1 || isCartLoading}
                    >
                        <Feather
                            name="minus"
                            size={16}
                            color={
                                item.quantity <= 1 || isCartLoading
                                    ? "#ccc"
                                    : "#000"
                            }
                        />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() =>
                            updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={isCartLoading}
                    >
                        <Feather
                            name="plus"
                            size={16}
                            color={isCartLoading ? "#ccc" : "#000"}
                        />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromCart(item.id)}
                    disabled={isCartLoading}
                >
                    <Feather
                        name="trash-2"
                        size={18}
                        color={isCartLoading ? "#ccc" : "#e53e3e"}
                    />
                </TouchableOpacity>
            </View>
        </Card>
    );
    const renderDeliveryOptions = () => (
        <Card>
            <CardTitle>Доставка</CardTitle>
            <RegularPicker
                options={deliveryOptions}
                value={selectedDelivery}
                setValue={(value) =>
                    setSelectedDelivery(value as DeliveryOption)
                }
                buttonText={getDeliveryOptionText(selectedDelivery)}
            />
        </Card>
    );
    const getDeliveryOptionText = (option: DeliveryOption): string => {
        switch (option) {
            case "nova_poshta":
                return "Нова Пошта";
            case "ukr_poshta":
                return "Укрпошта";
            case "self_pickup":
                return "Самовивіз";
            default:
                return "Оберіть спосіб доставки";
        }
    };
    const renderPaymentOptions = () => (
        <Card>
            <CardTitle>Оплата</CardTitle>
            <RegularPicker
                options={paymentOptions}
                value={selectedPayment}
                setValue={(value) => setSelectedPayment(value as PaymentOption)}
                buttonText={getPaymentOptionText(selectedPayment)}
            />
        </Card>
    );
    const getPaymentOptionText = (option: PaymentOption): string => {
        switch (option) {
            case "card":
                return "Оплата карткою";
            case "cash":
                return "Готівкою при отриманні";
            default:
                return "Оберіть спосіб оплати";
        }
    };
    const renderOrderSummary = () => (
        <Card>
            <CardTitle>Підсумок замовлення</CardTitle>
            {cartItems.map((item) => (
                <CardSummary key={item.id}>
                    <CardSummaryLabel>
                        {item.name} x {item.quantity}
                    </CardSummaryLabel>
                    <CardSummaryValue>
                        {formatPrice(item.price * item.quantity)}
                    </CardSummaryValue>
                </CardSummary>
            ))}
            <Separator />
            <CardSummary>
                <CardSummaryLabel>Разом</CardSummaryLabel>
                <CardSummaryValue>
                    {formatPrice(totalCartPrice)}
                </CardSummaryValue>
            </CardSummary>
        </Card>
    );
    const renderEmptyCart = () => (
        <View style={styles.emptyContainer}>
            <Ionicons
                name="cart-outline"
                size={80}
                color={defaultGray}
                style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>Ваш кошик порожній</Text>
            <Text style={styles.emptySubtitle}>
                Перегляньте наші товари та додайте щось до кошика
            </Text>
            <Button onPress={() => router.push("/search")}>
                Перейти до покупок
            </Button>
        </View>
    );
    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            {cartError ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{cartError}</Text>
                </View>
            ) : null}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Кошик</Text>
            </View>
            {isCartLoading && cartItems.length === 0 ? ( 
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0070f3" />
                </View>
            ) : cartItems.length > 0 ? (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                >
                    <FlatList
                        data={cartItems}
                        renderItem={renderCartItem}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={false} 
                        ItemSeparatorComponent={() => (
                            <View style={{ height: 10 }} />
                        )}
                    />
                    {renderDeliveryOptions()}
                    {renderPaymentOptions()}
                    {renderOrderSummary()}
                    <Button
                        onPress={handleCheckout}
                        disabled={isCartLoading}
                        style={[, isCartLoading && styles.disabledButton]}
                    >
                        {isCartLoading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            "Оформити замовлення"
                        )}
                    </Button>
                </ScrollView>
            ) : 
            !isCartLoading ? (
                renderEmptyCart()
            ) : null}
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        padding: 15,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 15,
        backgroundColor: "#e5e7eb",
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 5,
        color: "#1f2937",
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: "600",
    },
    itemControls: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
        paddingTop: 15,
    },
    quantityControl: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 6,
    },
    quantityButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    quantityText: {
        fontSize: 14,
        fontWeight: "500",
        minWidth: 30,
        textAlign: "center",
        paddingHorizontal: 5,
        color: "#1f2937",
    },
    removeButton: {
        padding: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 10,
        color: "#1f2937",
    },
    selectTrigger: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: "#fff",
    },
    selectValue: {
        fontSize: 14,
        color: "#374151",
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1f2937",
    },
    summaryTotalValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1f2937",
    },
    checkoutButton: {
        backgroundColor: "#059669",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    checkoutButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    disabledButton: {
        backgroundColor: "#9ca3af",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyIcon: {
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 10,
        color: "#1f2937",
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
        marginBottom: 25,
    },
    primaryButton: {
        backgroundColor: "orange",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: "center",
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
    },
    errorContainer: {
        backgroundColor: "#fee2e2",
        padding: 10,
        marginHorizontal: 15,
        marginTop: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#fca5a5",
    },
    errorText: {
        color: "#b91c1c",
        fontSize: 14,
        textAlign: "center",
    },
});
