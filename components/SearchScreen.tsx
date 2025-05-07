import Pagination from '@/components/Pagination';
import ProductGrid from '@/components/ProductGrid';
import SortPickerModal from '@/components/SortPickerModal';
import { PAYLOAD_API_URL } from '@/config/api';
import { primaryColor } from '@/config/Colors';
import { ProductCategory } from '@/types';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { stringify } from 'qs-esm';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from './ui/Button';
interface PaginationInfo {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  nextPage: number | null;
  page: number;
  pagingCounter: number;
  prevPage: number | null;
  totalDocs: number;
  totalPages: number;
}
interface SearchScreenProps {
  initialQuery?: string;
  initialCategory?: string | null;
  initialFilters?: Record<string, any>;
  isModal?: boolean;
}
const limitPerPage = 16;
const SearchScreen = ({
  initialQuery = '',
  initialCategory = null,
  initialFilters = {},
  isModal = false
}: SearchScreenProps) => {
  const router = useRouter();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  useEffect(() => {
    const fetchCategories = async () => {
      const query = stringify({
        limit: 0,
      })
      const res = await fetch(`${PAYLOAD_API_URL}/productCategories?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data?.docs);
      }
    };
    fetchCategories();
  }, []);
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10,
    nextPage: null,
    page: 1,
    pagingCounter: 1,
    prevPage: null,
    totalDocs: 0,
    totalPages: 1
  });
  const [filters, setFilters] = useState({
    ...initialFilters,
    category: initialCategory,
    priceMin: '',
    priceMax: '',
    brands: [],
    inStock: false,
    hasDiscount: false
  });
  const searchInputRef = useRef(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const fetchSearchResults = async (page = currentPage) => {
    setLoading(true);
    try {
      const queryParams = {
        limit: limitPerPage,
        page: page,
        sort: getSortParam(),
        where: buildWhereClause()
      };
      const queryString = stringify(queryParams);
      const response = await fetch(`${PAYLOAD_API_URL}/products?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.docs || []);
        setPaginationInfo({
          hasNextPage: data.hasNextPage,
          hasPrevPage: data.hasPrevPage,
          limit: data.limit,
          nextPage: data.nextPage,
          page: data.page,
          pagingCounter: data.pagingCounter,
          prevPage: data.prevPage,
          totalDocs: data.totalDocs,
          totalPages: data.totalPages
        });
        setCurrentPage(data.page);
      } else {
        console.error('Error fetching search results');
      }
    } catch (error) {
      console.error('Search fetch error:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSearchResults(1);
  }, []);
  const buildWhereClause = () => {
    const whereClause: Record<string, any> = {};
    if (query.trim()) {
      whereClause.name = {
        contains: query.trim(),
      };
    }
    if (filters.category) {
      whereClause['category.slug'] = {
        equals: filters.category,
      };
    }
    if (filters.priceMin && !isNaN(Number(filters.priceMin))) {
      whereClause.price = {
        ...(whereClause.price || {}),
        greater_than_equal: Number(filters.priceMin),
      };
    }
    if (filters.priceMax && !isNaN(Number(filters.priceMax))) {
      whereClause.price = {
        ...(whereClause.price || {}),
        less_than_equal: Number(filters.priceMax),
      };
    }
    if (filters.hasDiscount) {
      whereClause.discount = {
        not_equals: 0,
      };
    }
    return whereClause;
  };
  const getSortParam = () => {
    switch (sortBy) {
      case 'price_asc':
        return 'price';
      case 'price_desc':
        return '-price';
      case 'newest':
        return '-createdAt';
      case 'relevance':
        return '-createdAt'; 
      default:
        return '-createdAt'; 
    }
  };
  useEffect(() => {
    fetchSearchResults(currentPage);
  }, [sortBy]);
  const handlePageChange = (page: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
    fetchSearchResults(page);
  };
  const handleSearch = () => {
    setCurrentPage(1);
    fetchSearchResults(1);
  };
  const applyFilters = () => {
    setIsDrawerOpen(false);
    setCurrentPage(1);
    fetchSearchResults(1);
  };
  const resetFilters = () => {
    setFilters({
      category: null,
      priceMin: '',
      priceMax: '',
      brands: [],
      inStock: false,
      hasDiscount: false
    });
  };
  const handleBackPress = () => {
    if (isModal) {
      router.back();
    }
  };
  const renderFilterDrawer = () => (
    <SafeAreaView edges={['top']} style={{flex: 1, paddingTop: 40}}>
      <ScrollView style={styles.drawerContent}>
        <Text style={styles.drawerTitle}>Фільтри</Text>
        {}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Ціна</Text>
          <View style={styles.priceInputContainer}>
            <TextInput
              style={styles.priceInput}
              placeholder="Від"
              keyboardType="numeric"
              value={filters.priceMin}
              onChangeText={(text) => setFilters({...filters, priceMin: text})}
            />
            <Text style={{marginHorizontal: 10}}>-</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="До"
              keyboardType="numeric"
              value={filters.priceMax}
              onChangeText={(text) => setFilters({...filters, priceMax: text})}
            />
          </View>
        </View>
        {}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Категорії</Text>
          <View style={styles.brandsList}>
          {categories.map((item) => (
              <TouchableOpacity
                key={item.id?.toString() || Math.random().toString()}
                style={[
                  styles.brandItem,
                  filters.category === item.slug && styles.brandItemSelected
                ]}
                onPress={() => setFilters({ ...filters, category: item.slug || '' })}
              >
                <Text
                  style={[
                    styles.brandItemText,
                    filters.category === item.slug && styles.brandItemTextSelected
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
          ))}
          </View>
        </View>
        {}
        <View style={styles.filterSection}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setFilters({...filters, inStock: !filters.inStock})}
          >
            <View style={[styles.checkbox, filters.inStock && styles.checkboxChecked]}>
              {filters.inStock && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>В наявності</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setFilters({...filters, hasDiscount: !filters.hasDiscount})}
          >
            <View style={[styles.checkbox, filters.hasDiscount && styles.checkboxChecked]}>
              {filters.hasDiscount && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Зі знижкою</Text>
          </TouchableOpacity>
        </View>
        {}
        <View style={styles.filterActions}>
        <Button 
            variant="secondary"
            onPress={resetFilters}
            style={{flex: 1}}
          >
            Скинути
          </Button>
          <Button 
            variant="primary"
            onPress={applyFilters}
            style={{flex: 1}}
          >
            Застосувати
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
  return (
    <Drawer
      open={isDrawerOpen}
      onOpen={() => setIsDrawerOpen(true)}
      onClose={() => setIsDrawerOpen(false)}
      renderDrawerContent={renderFilterDrawer}
      drawerPosition="left"
      drawerType="front"
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {}
        {isModal && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
        )}
        {}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={24} color="#000"  style={
              {marginLeft:10}
            }/>
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Пошук товарів..."
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setIsDrawerOpen(true)}
          >
            <Feather name="filter" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.mainContent}
          contentContainerStyle={styles.scrollContent}
        >
          {}
          <View style={styles.resultsContainer}>
            {}
            <View style={styles.resultsHeader}>
              <View style={styles.resultsTitleContainer}>
                <Text style={styles.resultsTitle}>Результати пошуку</Text>
                {paginationInfo.totalDocs > 0 && (
                  <Text style={styles.resultsCount}>({paginationInfo.totalDocs})</Text>
                )}
              </View>
              <View style={styles.resultsActions}>
                {}
                <SortPickerModal sortBy={sortBy} setSortBy={setSortBy} />
              </View>
            </View>
            {}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
              </View>
            )}
            {}
            {!loading && searchResults.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>Немає результатів для &quot;{query}&quot;</Text>
              </View>
            ) : (
              <>
                <ProductGrid products={searchResults} />
                {}
                {paginationInfo.totalPages > 0 && (
                  <Pagination 
                    currentPage={currentPage} 
                    totalPages={paginationInfo.totalPages} 
                    onPageChange={handlePageChange} 
                  />
                )}
                {}
                {paginationInfo.totalDocs > 0 && (
                  <Text style={styles.paginationInfo}>
                    Показано {((currentPage - 1) * limitPerPage) + 1}-
                    {Math.min(currentPage * limitPerPage, paginationInfo.totalDocs)} з {paginationInfo.totalDocs} товарів
                  </Text>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Drawer>
  );
};
export default SearchScreen;
const screenWidth = Dimensions.get('window').width;
const gridItemWidth = (screenWidth - 40) / 2;
const styles = StyleSheet.create({
    container: {
        flex: 1,
      },
      backButton: {
        padding: 10,
        marginLeft: 10,
        marginTop: 5,
      },
      backButtonText: {
        fontSize: 16,
        color: '#000'
      },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 8,
  },
  filterButton: {
    padding: 8,
    marginLeft: 8,
  },
  recentSearchesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  recentSearchesTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  recentSearchesList: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  recentSearchItem: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  recentSearchText: {
    fontSize: 12,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  resultsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  resultsActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    marginRight: 12,
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
  },
  viewToggleButton: {
    padding: 4,
    width: 28,
    alignItems: 'center',
  },
  viewToggleButtonActive: {
    backgroundColor: '#ddd',
  },
  gridContainer: {
    paddingVertical: 8,
  },
  listContainer: {
    paddingVertical: 8,
  },
  gridItem: {
    width: gridItemWidth,
    marginBottom: 16,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  gridItemImageContainer: {
    width: '100%',
    height: gridItemWidth,
  },
  gridItemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridItemContent: {
    padding: 8,
  },
  gridItemName: {
    fontSize: 12,
    height: 36,
  },
  gridItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#0066cc',
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  listItemImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  listItemContent: {
    flex: 1,
    padding: 8,
  },
  listItemName: {
    fontSize: 14,
  },
  listItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#0066cc',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  paginationInfo: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  drawerContent: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  brandsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  brandItem: {
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  brandItemSelected: {
    backgroundColor: primaryColor,
  },
  brandItemText: {
    fontSize: 12,
  },
  brandItemTextSelected: {
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  checkMark: {
    color: '#fff',
    fontSize: 12,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap:8,
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginRight: 8,
  },
  resetButtonText: {
    color: '#333',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginLeft: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});