// screens/ProductScreen.js
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { colors } from '../constants/config';

// Import components
import CustomerPagination from '../components/Customer/CustomerPagination';
import ProductCard from '../components/Product/ProductCard';
import ProductHeader from '../components/Product/ProductHeader';
import ProductKPIs from '../components/Product/ProductKPIs';

// Import hooks
import {
  useProductMutations,
  useProducts
} from '../hooks/useProducts';

export default function ProductScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    productType: '',
    isActive: null,
  });

  const [searchParams, setSearchParams] = useState({});

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = {};
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      if (filters.productType) {
        params.productType = filters.productType;
      }
      
      if (filters.isActive !== null) {
        params.isActive = filters.isActive;
      }

      setSearchParams(params);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  // API hooks - use nested for complete data
  const {
    products,
    loading,
    error,
    pagination,
    refresh,
    goToPage,
  } = useProducts(searchParams, 20, true); // useNested = true

  const {
    updateProduct,
    deleteProduct
  } = useProductMutations();

  const handleProductAction = async (product, action) => {
    console.log('🎯 Product Action:', { action, product: product.label });

    switch (action) {
      case "Deactivate":
      case "Activate":
        const newStatus = action === "Activate";
        Alert.alert(
          `Confirm ${action}`,
          `Are you sure you want to ${action.toLowerCase()} ${product.label}?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: action,
              style: action === "Deactivate" ? "destructive" : "default",
              onPress: async () => {
                try {
                  await updateProduct(product.id, { isActive: newStatus }, true, true);
                  refresh();
                  Alert.alert("Success", `Product ${action.toLowerCase()}d successfully`);
                } catch (error) {
                  Alert.alert("Error", `Failed to ${action.toLowerCase()} product`);
                }
              },
            },
          ]
        );
        break;

      case "Delete":
        Alert.alert(
          "Confirm Delete",
          `Delete ${product.label}? This cannot be undone.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                try {
                  await deleteProduct(product.id, true);
                  refresh();
                  Alert.alert("Success", "Product deleted successfully");
                } catch (error) {
                  Alert.alert("Error", "Failed to delete product");
                }
              },
            },
          ]
        );
        break;

      default:
        Alert.alert("Action", `${action} clicked for ${product.label}`);
    }
  };

  // Loading state
  if (loading && products.length === 0) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <ProductHeader onAddPress={() => Alert.alert("Add Product")} />

        {/* KPIs - Pass current page products and total count */}
        <ProductKPIs
          products={products}
          totalCount={pagination.totalCount}
        />

        {/* Product Cards */}
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAction={handleProductAction}
          />
        ))}

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No products found
            </Text>
          </View>
        )}

        {/* Pagination */}
        {(products.length > 0 || pagination.totalCount > 0) && (
          <CustomerPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
            onPageChange={goToPage}
            hasNext={pagination.hasNext}
            hasPrevious={pagination.hasPrevious}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 12
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: colors.subtext,
    fontSize: 16,
  },
});
