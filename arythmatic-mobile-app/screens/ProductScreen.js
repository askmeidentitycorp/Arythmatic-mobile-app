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
import CrudModal from '../components/CrudModal';
import ProductCard from '../components/Product/ProductCard';
import ProductHeader from '../components/Product/ProductHeader';
import ProductKPIs from '../components/Product/ProductKPIs';

// Import hooks
import {
  useProductMutations,
  useProducts
} from '../hooks/useProducts';

export default function ProductScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    productType: '',
    isActive: null,
  });

  const [searchParams, setSearchParams] = useState({});
  
  // CRUD Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);

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
  } = useProducts(searchParams, 10, false); // Use simple data for product list - faster loading

  const {
    createProduct,
    updateProduct,
    deleteProduct,
    loading: mutationLoading
  } = useProductMutations();
  
  // Product form field configuration
  const productFields = [
    {
      key: 'label',
      label: 'Product Name',
      type: 'text',
      required: true,
      placeholder: 'Enter product name',
      minLength: 2,
    },
    {
      key: 'description',
      label: 'Description',
      type: 'multiline',
      placeholder: 'Describe the product features and benefits...',
    },
    {
      key: 'productType',
      label: 'Product Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Physical Product', value: 'physical' },
        { label: 'Digital Service', value: 'service' },
        { label: 'Software', value: 'software' },
        { label: 'Subscription', value: 'subscription' },
      ],
      defaultValue: 'physical',
    },
    {
      key: 'price',
      label: 'Price',
      type: 'number',
      placeholder: '0.00',
      help: 'Base price in USD',
    },
    {
      key: 'category',
      label: 'Category',
      type: 'text',
      placeholder: 'e.g., Electronics, Software, Consulting',
    },
    {
      key: 'sku',
      label: 'SKU',
      type: 'text',
      placeholder: 'Product SKU/Code',
      help: 'Stock Keeping Unit identifier',
    },
    {
      key: 'isActive',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { label: 'Active', value: true },
        { label: 'Inactive', value: false },
      ],
      defaultValue: true,
    },
  ];

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

      case "Edit Product":
        setSelectedProduct(product);
        setModalMode('edit');
        setModalVisible(true);
        break;
        
      default:
        Alert.alert("Action", `${action} clicked for ${product.label}`);
    }
  };
  
  // Handle Add Product
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setModalMode('create');
    setModalVisible(true);
  };
  
  // Handle form submission (Create/Update)
  const handleFormSubmit = async (formData) => {
    try {
      // Convert string boolean to actual boolean for isActive
      if (formData.isActive !== undefined) {
        formData.isActive = formData.isActive === 'true' || formData.isActive === true;
      }
      
      // Convert price to number
      if (formData.price) {
        formData.price = parseFloat(formData.price);
      }
      
      if (modalMode === 'create') {
        console.log('🆕 Creating product:', formData);
        await createProduct(formData, true); // useNested = true
        Alert.alert('Success', 'Product created successfully!');
      } else {
        console.log('📝 Updating product:', selectedProduct.id, formData);
        await updateProduct(selectedProduct.id, formData, true, false); // useNested = true, partial = false
        Alert.alert('Success', 'Product updated successfully!');
      }
      refresh();
    } catch (error) {
      console.error('❌ Product form submission error:', error);
      throw error; // Re-throw to let CrudModal handle the error display
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
        {/* Header with Back Button */}
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
        </View>
        {/* Header */}
        <ProductHeader onAddPress={handleAddProduct} />

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
      
      {/* CRUD Modal */}
      <CrudModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleFormSubmit}
        title={modalMode === 'create' ? 'Add Product' : 'Edit Product'}
        fields={productFields}
        initialData={selectedProduct || {}}
        loading={mutationLoading}
        mode={modalMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 12
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 5,
  },
  backButton: {
    backgroundColor: colors.panel,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
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
