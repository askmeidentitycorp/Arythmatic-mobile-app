// screens/ProductScreen.js
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
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
  useProducts,
  useProductMetrics
} from '../hooks/useProducts';
import { productService } from '../services/productService';
import * as FileSystem from 'expo-file-system';

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
        params.product_type = filters.productType;
      }
      
      if (filters.isActive !== null) {
        params.is_active = filters.isActive;
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
} = useProducts(searchParams, 10, true);

  const { totalCount: totals, activeCount, digitalCount, physicalCount, serviceCount } = useProductMetrics();

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

      case "View Details":
        Alert.alert('Product Details', `${product.label}\nType: ${product.productType}\nSKU: ${product.sku || '—'}`);
        break;
      case "Duplicate":
        try {
          const dup = { ...product, id: undefined, label: `${product.label} Copy` };
          await createProduct(dup, true);
          refresh();
          Alert.alert('Success', 'Product duplicated');
        } catch (e) {
          Alert.alert('Error', 'Failed to duplicate');
        }
        break;
      case "Manage Pricing":
        Alert.alert('Manage Pricing', 'Not implemented yet');
        break;
      case "Manage Notes":
        Alert.alert('Manage Notes', 'Not implemented yet');
        break;
      case "Audit History":
        Alert.alert('Audit History', 'Not implemented yet');
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
  
// Export CSV
  const handleExportCSV = async () => {
    try {
      const pageSize = 200;
      let page = 1;
      let rows = [];
      while (true) {
        const res = await productService.getAll({ ...searchParams, page, page_size: pageSize });
        const list = res?.results || res || [];
        rows = rows.concat(list);
        if (!res?.next || list.length === 0) break;
        page += 1;
      }
      const headers = ['id','label','productType','sku','category','price','isActive'];
      const csv = [headers.join(',')].concat(
        rows.map(r => headers.map(h => JSON.stringify((r[h] ?? '').toString())).join(','))
      ).join('\n');

      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.setAttribute('download', 'products.csv');
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (Platform.OS === 'android') {
        const filename = `products_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) throw new Error('Storage permission not granted. Export cancelled.');
        const uri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          filename,
          'text/csv'
        );
        await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
        Alert.alert('Export complete', `Saved as ${filename}`);
      } else {
        const Sharing = await import('expo-sharing');
        const fileUri = FileSystem.cacheDirectory + `products_${Date.now()}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export CSV' });
        } else {
          Alert.alert('Export complete', `Saved to temporary file: ${fileUri}`);
        }
      }
    } catch (e) {
      Alert.alert('Export Failed', e.message || 'Could not export CSV');
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
        console.log('Creating product:', formData);
        await createProduct(formData, true); // useNested = true
        Alert.alert('Success', 'Product created successfully!');
      } else {
        console.log('Updating product:', selectedProduct.id, formData);
        await updateProduct(selectedProduct.id, formData, true, false); // useNested = true, partial = false
        Alert.alert('Success', 'Product updated successfully!');
      }
      refresh();
    } catch (error) {
      console.error('Product form submission error:', error);
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
        <ProductHeader onAddPress={handleAddProduct} onExport={handleExportCSV} totalCount={totals} />

        {/* KPIs - Pass current page products and total count */}
        <ProductKPIs
          products={products}
          totalCount={totals}
          activeCount={activeCount}
          digitalCount={digitalCount}
          physicalCount={physicalCount}
          serviceCount={serviceCount}
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
