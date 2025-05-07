import LogoITBox from "@/components/LogoITBox";
import ProductGrid from "@/components/ProductGrid";
import { PAYLOAD_API_URL } from "@/config/api";
import { primaryColor } from "@/config/Colors";
import { getImageURL } from "@/services/api";
import { Product, ProductCategory, Promo } from "@/types";
import { openSearchModal } from "@/utils/searchParams";
import { router } from "expo-router";
import { stringify } from "qs-esm";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const Header = () => {
    return (
        <View style={styles.header}>
            <LogoITBox width={100} height={38} />
        </View>
    );
};
const categoriesToShow = ["noutbuky", "pk", "komplektuyuchi-dlya-pk"];
export default function HomeScreen() {
    const [products, setProducts] = useState<{
        [key: string]: Product[];
    }>({});
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [promo, setPromo] = useState<Promo[]>([]);
    useEffect(() => {
        const fetchPromotions = async () => {
            const query = stringify({
                limit: 0,
            });
            const res = await fetch(`${PAYLOAD_API_URL}/promo?${query}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (res.ok) {
                const data = await res.json();
                setPromo(data?.docs);
            }
        };
        fetchPromotions();
    }, []);
    useEffect(() => {
        const fetchCategories = async () => {
            const query = stringify({
                limit: 0,
            });
            const res = await fetch(
                `${PAYLOAD_API_URL}/productCategories?${query}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (res.ok) {
                const data = await res.json();
                setCategories(data?.docs);
            }
        };
        fetchCategories();
    }, []);
    useEffect(() => {
        const fetchProducts = async () => {
            const productsByCategory: { [key: string]: Product[] } = {};
            for (const category of categoriesToShow) {
                const query = stringify({
                    limit: 4,
                    page: 1,
                    where: {
                        "category.slug": {
                            equals: category,
                        },
                    },
                });
                const res = await fetch(
                    `${PAYLOAD_API_URL}/products?${query}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (res.ok) {
                    const data = await res.json();
                    productsByCategory[category] = data?.docs;
                }
            }
            setProducts(productsByCategory);
        };
        fetchProducts();
    }, []);
    const CategoryItem = ({ item }: { item: ProductCategory }) => (
        <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => openSearchModal({ category: item.slug })}
        >
            <View style={styles.categoryImageContainer}>
                {typeof item.image !== "string" && item.image.url ? (
                    <Image
                        source={{ uri: getImageURL(item.image.url) }}
                        style={styles.categoryImage}
                    />
                ) : null}
            </View>
            <Text style={styles.categoryName}>{item.name}</Text>
        </TouchableOpacity>
    );
    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <Header />
            <ScrollView style={styles.scrollView}>
                {promo.length > 0 && (
                    <View style={styles.heroBanner}>
                        <Image
                            source={{
                                uri: getImageURL(
                                    typeof promo[0]?.image === "string"
                                        ? promo[0]?.image
                                        : promo[0]?.image?.url || ""
                                ),
                            }}
                            style={styles.bannerImage}
                        />
                        <View style={styles.bannerOverlay}>
                            <Text style={styles.bannerTitle}>
                                {promo[0]?.title}
                            </Text>
                            <Text style={styles.bannerSubtitle}>
                                {promo[0]?.description}
                            </Text>
                        </View>
                    </View>
                )}
                {}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Категорії</Text>
                    </View>
                    <FlatList
                        data={categories}
                        renderItem={({ item }) => <CategoryItem item={item} />}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.name}
                        contentContainerStyle={styles.categoriesList}
                    />
                </View>
                {}
                {Object.keys(products).map((category) => (
                    <View key={category} style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                {categories.find((cat) => cat.slug === category)
                                    ?.name || category}
                            </Text>
                            <TouchableOpacity
                                style={styles.seeAllButton}
                                onPress={() =>
                                    openSearchModal({ category: category })
                                }
                            >
                                <Text style={styles.seeAllText}>
                                    Показати всі
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <ProductGrid products={products[category]} />
                    </View>
                ))}
                {}
                {promo.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>
                            Акції та пропозиції
                        </Text>
                        <View style={styles.promotionsContainer}>
                            {promo.map((item, index) => {
                                if (index === 0) return null;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.promotionCard}
                                        onPress={() => router.push("/search")}
                                    >
                                        <Image
                                            source={{
                                                uri: getImageURL(
                                                    typeof item.image ===
                                                        "string"
                                                        ? item.image
                                                        : item.image?.url || ""
                                                ),
                                            }}
                                            style={styles.promotionImage}
                                        />
                                        <View style={styles.promotionOverlay}>
                                            <Text style={styles.promotionTitle}>
                                                {item.title}
                                            </Text>
                                            <Text
                                                style={styles.promotionSubtitle}
                                            >
                                                {item.description}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    headerIcons: {
        flexDirection: "row",
    },
    iconButton: {
        padding: 8,
    },
    heroBanner: {
        height: 150,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        overflow: "hidden",
    },
    bannerImage: {
        width: "100%",
        height: "100%",
    },
    bannerOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        padding: 16,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
        alignItems: "flex-start",
    },
    bannerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    bannerSubtitle: {
        fontSize: 14,
        color: "rgba(255,255,255,0.9)",
        marginBottom: 8,
    },
    bannerButton: {
        backgroundColor: "#0070f3",
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignSelf: "flex-start",
    },
    bannerButtonText: {
        color: "#fff",
        fontWeight: "500",
    },
    sectionContainer: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    seeAllButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    seeAllText: {
        fontSize: 14,
        color: primaryColor,
        marginRight: 4,
    },
    categoriesList: {
        paddingRight: 16,
    },
    categoryItem: {
        alignItems: "center",
        marginRight: 16,
        width: 64,
    },
    categoryImageContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#eee",
        overflow: "hidden",
        marginBottom: 4,
    },
    categoryImage: {
        width: "100%",
        height: "100%",
    },
    categoryName: {
        fontSize: 12,
        textAlign: "center",
    },
    tabView: {
        minHeight: 420,
    },
    tabBar: {
        backgroundColor: "#fff",
    },
    tabIndicator: {
        backgroundColor: "#0070f3",
    },
    tabLabel: {
        fontSize: 14,
        fontWeight: "500",
        textTransform: "none",
    },
    tabContent: {
        paddingTop: 16,
    },
    productsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    productCard: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#eee",
    },
    productImageContainer: {
        width: "100%",
        aspectRatio: 1,
        position: "relative",
    },
    productImage: {
        width: "100%",
        height: "100%",
    },
    heartButton: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "rgba(255,255,255,0.8)",
        padding: 6,
        borderRadius: 20,
    },
    discountBadge: {
        position: "absolute",
        top: 8,
        left: 8,
        backgroundColor: "#f44336",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    newBadge: {
        backgroundColor: "#4caf50",
    },
    discountText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: "500",
        height: 40,
    },
    oldPrice: {
        fontSize: 13,
        color: "#999",
        textDecorationLine: "line-through",
        marginTop: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#0070f3",
    },
    showMoreButton: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        alignItems: "center",
        marginTop: 8,
    },
    showMoreText: {
        fontSize: 14,
        fontWeight: "500",
    },
    promotionsContainer: {
        marginTop: 8,
    },
    promotionCard: {
        height: 96,
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 16,
    },
    promotionImage: {
        width: "100%",
        height: "100%",
    },
    promotionOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        paddingHorizontal: 16,
        justifyContent: "center",
    },
    promotionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    promotionSubtitle: {
        fontSize: 12,
        color: "rgba(255,255,255,0.9)",
    },
});
