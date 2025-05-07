import ProductCard from '@/components/ProductCard';
import ReviewModal from '@/components/ReviewModal';
import Button from '@/components/ui/Button';
import { PAYLOAD_API_URL } from '@/config/api';
import { primaryColor } from '@/config/Colors';
import { useCart } from '@/context/CartContext';
import { useLiked } from '@/context/LikedContext';
import { getImageURL } from "@/services/api";
import { Product } from "@/types";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { stringify } from "qs-esm";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const { width } = Dimensions.get("window")
export default function ProductPage() {
  const { slug } = useLocalSearchParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product|null>(null)
  const [loading, setLoading] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const scrollView = useRef<ScrollView>(null)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const mainImagesRef = useRef<FlatList>(null)
  const thumbnailsRef = useRef<FlatList>(null)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        const query = stringify({
          limit: 5,
          page: 1,
          where: {
            category: {
              equals: typeof product?.category === 'string' ? product?.category : product?.category.id 
            },
            id: {
              not_equals: product?.id
            }
          }
        })
        const res = await fetch(`${PAYLOAD_API_URL}/products?${query}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          setSimilarProducts(data.docs);
        }
      } catch (error) {
        console.error("Error fetching similar products:", error)
      }
    }
    if(product) {
      fetchSimilarProducts()
    }
  }, [product])
  useEffect(() => {
    setLoading(true)
    setProduct(null)
    setScrollY(0)
    setIsDescriptionExpanded(false)
    setActivePhotoIndex(0)
    const fetchProduct = async () => {
      try {
        const query = stringify({
          limit: 1,
          page: 1,
          where: {
            slug: {
              equals: slug
            }
          }
        })
        const res = await fetch(`${PAYLOAD_API_URL}/products?${query}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          if(data && data.docs.length > 0) {
            setProduct(data.docs[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug])
  const { addToCart, isLoading: isCartLoading ,cartItems} = useCart();
  const currentCartItem = cartItems.find(item => item.id === product?.id)
  const handleAddToCart = async () => {
    if (product) {
       try {
          await addToCart(product, 1);
       } catch {
          alert('Помилка додавання до кошика.');
       }
    }
  };
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(event.nativeEvent.contentOffset.y)
  }
  const handleImageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width)
    if (slideIndex !== activePhotoIndex) {
      setActivePhotoIndex(slideIndex)
      if (thumbnailsRef.current) {
        thumbnailsRef.current.scrollToIndex({
          index: slideIndex,
          animated: true,
          viewPosition: 0.5,
        })
      }
    }
  }
  const scrollToImage = (index: number) => {
    if (mainImagesRef.current) {
      mainImagesRef.current.scrollToIndex({
        index,
        animated: true,
      })
    }
  }
  const truncateDescription = (text:string, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  }
  const { isProductLiked, addToLiked, removeFromLiked } = useLiked();
  const liked = isProductLiked(product?.id || '');
  const toggleLike = () => {
    if(!product) return;
    if (liked) {
      removeFromLiked(product?.id);
    } else {
      addToLiked(product);
    }
  };
  if(loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0070f3" />
        <Text style={styles.loadingText}>Завантаження...</Text>
      </View>
    )
  }
  if(!product) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Товар не знайдено</Text>
        <TouchableOpacity 
          style={styles.backToHomeButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.backToHomeText}>Повернутися на головну</Text>
        </TouchableOpacity>
      </View>
    )
  }
  const formatPrice = (price: number) => `${new Intl.NumberFormat("uk-UA").format(price)} грн`
  const galleryImages = product.gallery && product.gallery.length > 0 
    ? product.gallery : []
  return (
      <SafeAreaView
          style={styles.container}
          edges={["right", "bottom", "left", "top"]}
      >
          <View
              style={[
                  styles.fixedHeader,
                  {
                      backgroundColor: scrollY > 10 ? "#fff" : "transparent",
                      borderBottomWidth: scrollY > 10 ? 1 : 0,
                      elevation: scrollY > 10 ? 3 : 0,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0,
                      shadowRadius: 0,
                  },
              ]}
          >
              <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                  }}
              >
                  <Ionicons name="arrow-back" size={20} />
                  <Text
                      style={styles.headerTitle}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                  >
                      {scrollY > 60 ? product.name : "Деталі товару"}
                  </Text>
              </TouchableOpacity>
              <View style={styles.imageIcons}>
                  <TouchableOpacity
                      style={styles.iconButton}
                      onPress={toggleLike}
                  >
                      {liked ? (
                          <FontAwesome name="heart" size={20} color="red" />
                      ) : (
                          <Feather name="heart" size={20} color="#000" />
                      )}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton}>
                      <Feather name="share-2" size={20} />
                  </TouchableOpacity>
              </View>
          </View>
          <ScrollView
              ref={scrollView}
              style={[styles.container, { marginTop: 50 }]}
              onScroll={handleScroll}
              scrollEventThrottle={16}
          >
              {}
              <View style={styles.galleryContainer}>
                  {}
                  <FlatList
                      ref={mainImagesRef}
                      data={galleryImages}
                      keyExtractor={(item, index) =>
                          typeof item === "string"
                              ? item
                              : item.id || `image-${index}`
                      }
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onScroll={handleImageScroll}
                      scrollEventThrottle={16}
                      renderItem={({ item }) => {
                          const imageUrl =
                              typeof item !== "string" && item.url
                                  ? getImageURL(item.url)
                                  : typeof item === "string"
                                  ? item
                                  : "https://picsum.photos/500/500?random=1";
                          return (
                              <View style={styles.mainImageWrapper}>
                                  <Image
                                      source={{ uri: imageUrl }}
                                      style={styles.mainImage}
                                      resizeMode="cover"
                                  />
                              </View>
                          );
                      }}
                  />
                  {}
                  <View style={styles.paginationContainer}>
                      {galleryImages.map((_, index) => (
                          <View
                              key={`dot-${index}`}
                              style={[
                                  styles.paginationDot,
                                  index === activePhotoIndex &&
                                      styles.paginationDotActive,
                              ]}
                          />
                      ))}
                  </View>
              </View>
              {}
              <FlatList
                  ref={thumbnailsRef}
                  data={galleryImages}
                  keyExtractor={(item, index) =>
                      typeof item === "string"
                          ? `thumb-${item}`
                          : `thumb-${item.id}` || `thumb-${index}`
                  }
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbnailList}
                  renderItem={({ item, index }) => {
                      const imageUrl =
                          typeof item !== "string" && item.url
                              ? getImageURL(item.url)
                              : typeof item === "string"
                              ? item
                              : "https://picsum.photos/500/500?random=1";
                      return (
                          <TouchableOpacity
                              onPress={() => scrollToImage(index)}
                              style={[
                                  styles.thumbnailWrapper,
                                  index === activePhotoIndex &&
                                      styles.thumbnailWrapperActive,
                              ]}
                          >
                              <Image
                                  source={{ uri: imageUrl }}
                                  style={styles.thumbnail}
                                  resizeMode="cover"
                              />
                          </TouchableOpacity>
                      );
                  }}
              />
              {}
              <View style={styles.infoContainer}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <View style={styles.ratingRow}>
                      {[...Array(5)].map((_, i) => (
                          <FontAwesome
                              key={i}
                              name="star"
                              size={14}
                              color={i < Math.floor(4.7) ? "#facc15" : "#ccc"}
                          />
                      ))}
                      <Text style={styles.ratingText}>
                          {4.7} ({34})
                      </Text>
                  </View>
                  <View style={styles.priceBlock}>
                      {product?.oldPrice && product.oldPrice > 0 ? (
                          <Text style={styles.oldPrice}>
                              {formatPrice(product?.oldPrice)}
                          </Text>
                      ) : null}
                      <Text style={styles.newPrice}>
                          {formatPrice(product?.price)}
                      </Text>
                      <Text style={styles.stock}>
                          {true ? "В наявності" : "Немає в наявності"}
                      </Text>
                  </View>
                  {}
                  {!currentCartItem ? (
                      <View style={styles.buttonRow}>
                          <Button 
                          variant='primary'
                          onPress={handleAddToCart}
                              disabled={isCartLoading}
                              >
                                Додати в кошик
                              </Button>
                           <Button 
                          variant='outline'
                          onPress={() => {
                            handleAddToCart();
                            router.push("/cart");
                        }}
                              disabled={isCartLoading}
                              >
                                Купити зараз
                              </Button>
                      </View>
                  ) : (
                      <View style={styles.buttonRow}>
                          <Button 
                          variant='outline'
                           onPress={()=> router.push(`/cart`)}
                           style={{
                            width: "100%",
                           }}
                           >
                              <Feather name="shopping-cart" size={18}  />
                              <Text > {"  "}В кошику {currentCartItem.quantity} шт.</Text>
                           </Button>
                      </View>
                  )}
                  {}
                  <View style={styles.deliveryRow}>
                      <InfoBox
                          icon={<Feather name="truck" size={20} />}
                          text="Доставка 1-3 дні"
                      />
                      <InfoBox
                          icon={<Feather name="shield" size={20} />}
                          text="Гарантія 24 міс."
                      />
                      <InfoBox
                          icon={<Feather name="credit-card" size={20} />}
                          text="Оплата частинами"
                      />
                  </View>
                  {}
                  <View style={styles.tabs}>
                      <Text style={styles.tabTitle}>Опис</Text>
                      <View style={styles.tabContentBox}>
                          {product.description ? (
                              <>
                                  <Text style={styles.tabContent}>
                                      {isDescriptionExpanded
                                          ? product.description
                                          : truncateDescription(
                                                product.description
                                            )}
                                  </Text>
                                  {product.description.length > 150 && (
                                      <TouchableOpacity
                                          style={styles.expandButton}
                                          onPress={toggleDescription}
                                      >
                                          <Text style={styles.expandButtonText}>
                                              {isDescriptionExpanded
                                                  ? "Згорнути"
                                                  : "Читати повністю"}
                                          </Text>
                                          <Ionicons
                                              name={
                                                  isDescriptionExpanded
                                                      ? "chevron-up"
                                                      : "chevron-down"
                                              }
                                              size={16}
                                              color={
                                                primaryColor
                                              }
                                          />
                                      </TouchableOpacity>
                                  )}
                              </>
                          ) : (
                              <Text style={styles.tabContent}>
                                  Опис відсутній
                              </Text>
                          )}
                      </View>
                      <Text style={styles.tabTitle}>Характеристики</Text>
                      <View style={styles.tabContentBox}>
                          {product?.features && product.features.length > 0 ? (
                              product.features.map((feature, i) => (
                                  <View key={i} style={styles.specRow}>
                                      <Text style={styles.specName}>
                                          {feature.feature}
                                      </Text>
                                      <Text style={styles.specValue}>
                                          {feature.value}
                                      </Text>
                                  </View>
                              ))
                          ) : (
                              <Text style={styles.tabContent}>
                                  Характеристики не вказані
                              </Text>
                          )}
                      </View>
                      <Text style={styles.tabTitle}>Відгуки</Text>
                      <View style={styles.tabContentBox}>
                          <View style={styles.reviewSummary}>
                              <View style={styles.ratingBig}>
                                  <Text style={styles.ratingNumber}>4.7</Text>
                                  <View style={styles.ratingStars}>
                                      {[...Array(5)].map((_, i) => (
                                          <FontAwesome
                                              key={i}
                                              name="star"
                                              size={16}
                                              color={
                                                  i < Math.floor(4.7)
                                                      ? "#facc15"
                                                      : "#ccc"
                                              }
                                              style={{ marginRight: 2 }}
                                          />
                                      ))}
                                  </View>
                                  <Text style={styles.reviewCount}>
                                      34 відгуки
                                  </Text>
                              </View>
                              <ReviewModal />
                          </View>
                          {}
                      </View>
                  </View>
                  {similarProducts.length > 0 ? (
                      <View style={styles.similarSection}>
                          <View style={styles.sectionHeader}>
                              <Text style={styles.similarTitle}>
                                  Схожі товари
                              </Text>
                          </View>
                          <FlatList
                              data={similarProducts}
                              keyExtractor={(item) => item.id.toString()}
                              horizontal
                              showsHorizontalScrollIndicator={false}
                              contentContainerStyle={styles.similarList}
                              renderItem={({ item }) => {
                                  return (
                                      <ProductCard item={item} isHorizontal />
                                  );
                              }}
                          />
                      </View>
                  ) : null}
              </View>
          </ScrollView>
          {}
          {scrollY > 300 && (
              <TouchableOpacity
                  style={styles.scrollToTopButton}
                  onPress={() => {
                      if (scrollY > 0) {
                          scrollView?.current?.scrollTo({
                              y: 0,
                              animated: true,
                          });
                      }
                  }}
              >
                  <Ionicons name="arrow-up" size={20} color="#fff" />
              </TouchableOpacity>
          )}
      </SafeAreaView>
  );
}
const InfoBox = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <View style={styles.infoBox}>
    {icon}
    <Text style={styles.infoText}>{text}</Text>
  </View>
)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centerContent: { 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    color: "#555",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#555",
    marginBottom: 15
  },
  backToHomeButton: {
    backgroundColor: "#0070f3",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5
  },
  backToHomeText: {
    color: "white",
    fontWeight: "500"
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 12,
    marginTop: 0, 
  },
  fixedHeader: { 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row", 
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    paddingVertical: 10,
    zIndex: 1000,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    marginTop: 50,
  },
  backButton: { 
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(240, 240, 240, 0.9)',
  },
  headerTitle: { 
    fontSize: 16, 
    fontWeight: "bold",
    flex: 1,
    marginHorizontal: 10,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerActionButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(240, 240, 240, 0.9)',
    marginLeft: 8,
  },
  galleryContainer: {
    position: "relative",
    width,
    height: width,
  },
  mainImageWrapper: {
    width,
    height: width,
  },
  mainImage: { 
    width: "100%", 
    height: "100%",
    backgroundColor: "#f5f5f5",
  },
  paginationContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: "#fff",
    width: 12,
    height: 8,
    borderRadius: 4,
  },
  thumbnailList: { 
    paddingHorizontal: 12, 
    paddingVertical: 10,
  },
  thumbnailWrapper: {
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 8,
    marginHorizontal: 4,
    overflow: "hidden",
  },
  thumbnailWrapperActive: {
    borderColor:  primaryColor,
  },
  thumbnail: { 
    width: 60, 
    height: 60, 
    borderRadius: 6,
  },
  discountBadge: { position: "absolute", top: 10, left: 10, backgroundColor: "red", padding: 6, borderRadius: 4 },
  discountText: { color: "white", fontSize: 12 },
  imageIcons: {  flexDirection: "row", gap: 8 },
  iconButton: { backgroundColor: "#fff", padding: 6, borderRadius: 20, marginLeft: 6 },
  infoContainer: { paddingHorizontal: 16 },
  productName: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ratingText: { marginLeft: 8, fontSize: 13, color: "#555" },
  priceBlock: { marginTop: 12 },
  oldPrice: { textDecorationLine: "line-through", color: "#888", fontSize: 13 },
  newPrice: { fontSize: 20, fontWeight: "bold", color: "#000" },
  stock: { color: "green", fontSize: 13 },
  buttonRow: { flexDirection: "row", marginTop: 16, gap: 10, width:"100%",
  justifyContent: "space-between" },
  primaryButton: { flex: 1, backgroundColor: "#000", padding: 12, borderRadius: 6 },
  outlineButton: { flex: 1, borderWidth: 1, borderColor: "#000", padding: 12, borderRadius: 6 },
  ghostButton: {
    flex: 1, padding: 12, borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#0070f3",
    backgroundColor: "#f0f8ff",
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 8,
  },
  buttonText: { color: "#fff", textAlign: "center" },
  outlineText: { color: "#000", textAlign: "center" },
  deliveryRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  infoBox: { alignItems: "center", flex: 1 },
  infoText: { fontSize: 12, marginTop: 4, textAlign: "center" },
  tabs: { marginTop: 24 },
  tabTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 8, 
    marginTop: 20,
    color: "#333"
  },
  tabContentBox: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  tabContent: { 
    fontSize: 14, 
    color: "#444", 
    lineHeight: 20 
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    padding: 6, 
  },
  expandButtonText: {
    color:  primaryColor,
    fontWeight: "500",
    marginRight: 5,
  },
  specRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    borderBottomWidth: 1, 
    borderColor: "#eee", 
    paddingVertical: 10 
  },
  specName: { color: "#555", fontSize: 14, flex: 1 },
  specValue: { fontWeight: "500", fontSize: 14, flex: 1, textAlign: "right" },
  reviewSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  ratingBig: {
    alignItems: "flex-start",
  },
  ratingNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  ratingStars: {
    flexDirection: "row",
    marginVertical: 5,
  },
  reviewCount: {
    fontSize: 13,
    color: "#666",
  },
  similarSection: { 
    marginTop: 24, 
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  similarTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#333"
  },
  viewAllLink: {
    color: "#0070f3",
    fontSize: 14,
  },
  similarList: {
    paddingBottom: 10,
  },
  similarItem: { 
    width: 160, 
    marginRight: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    position: "relative",
  },
  similarImageContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  similarImage: { 
    width: "100%", 
    height: 120, 
    borderRadius: 6 
  },
  similarName: { 
    fontSize: 13, 
    marginTop: 8,
    height: 36,
    lineHeight: 18,
  },
  similarPrice: { 
    fontWeight: "bold", 
    marginTop: 5,
    fontSize: 14,
  },
  addToCartButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#0070f3",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollToTopButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: primaryColor,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
})