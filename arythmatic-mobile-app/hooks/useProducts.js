// hooks/useProducts.js
import { useCallback, useEffect, useState, useMemo } from 'react';
import { productService } from '../services/productService';

export const useProducts = (params = {}, pageSize = 10, useNested = true) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: pageSize,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });

  const stableParams = useMemo(() => params, [JSON.stringify(params)]);

  const fetchProducts = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const requestParams = {
        page,
        page_size: pageSize,
        ...stableParams,
      };
      
      // DEBUG: Log all request details
      console.log('🐛 DEBUG useProducts:', {
        hook: 'useProducts',
        useNested,
        endpoint: useNested ? 'products-nested' : 'products',
        requestParams,
        paramsStringified: JSON.stringify(params)
      });

      console.log('🔍 Fetching products with params:', requestParams);

      const response = useNested
        ? await productService.getAllNested(requestParams)
        : await productService.getAll(requestParams);

      console.log('📥 Product API Response:', response);

      // Handle response structure
      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        data = response.data;
      }

      console.log('📦 Processed product data:', data);

      const results = data?.results || data || [];
      const count = data?.count || 0;
      const totalPages = data?.total_pages || Math.ceil(count / pageSize) || 0;

      console.log('📊 Products extracted:', {
        resultsLength: results.length,
        count,
        totalPages,
        hasNext: !!data?.next
      });

      setProducts(results);

      setPagination({
        currentPage: data?.current_page || page,
        pageSize: pageSize,
        totalCount: count,
        totalPages: totalPages,
        hasNext: !!data?.next,
        hasPrevious: !!data?.previous,
      });

      console.log('✅ Successfully loaded', results.length, 'products');

    } catch (err) {
      console.error('❌ Error fetching products:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [stableParams, pageSize, useNested]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const refresh = useCallback(() => {
    fetchProducts(pagination.currentPage);
  }, [fetchProducts, pagination.currentPage]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages && !loading) {
      fetchProducts(page);
    }
  }, [pagination.totalPages, loading, fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    refresh,
    goToPage,
    hasMore: pagination.hasNext,
  };
};

export const useProductMetrics = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [digitalCount, setDigitalCount] = useState(0);
  const [physicalCount, setPhysicalCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [totalRes, activeRes, digitalRes, physicalRes, serviceRes] = await Promise.all([
        productService.getAll({ page: 1, page_size: 1 }),
        productService.getAll({ page: 1, page_size: 1, isActive: true }),
        productService.getAll({ page: 1, page_size: 1, productType: 'digital' }),
        productService.getAll({ page: 1, page_size: 1, productType: 'physical' }),
        productService.getAll({ page: 1, page_size: 1, productType: 'service' }),
      ]);
      setTotalCount(totalRes?.count || 0);
      setActiveCount(activeRes?.count || 0);
      setDigitalCount(digitalRes?.count || 0);
      setPhysicalCount(physicalRes?.count || 0);
      setServiceCount(serviceRes?.count || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch product metrics');
      setTotalCount(0); setActiveCount(0); setDigitalCount(0); setPhysicalCount(0); setServiceCount(0);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);
  const refresh = useCallback(() => fetchMetrics(), [fetchMetrics]);

  return { totalCount, activeCount, digitalCount, physicalCount, serviceCount, loading, error, refresh };
};

export const useProduct = (id, useNested = true) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const data = useNested
        ? await productService.getByIdNested(id)
        : await productService.getById(id);
      
      setProduct(data);
      console.log('✅ Loaded product:', data?.label);

    } catch (err) {
      console.error('❌ Error fetching product:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id, useNested]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const refresh = useCallback(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refresh };
};

export const useProductMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProduct = async (data, useNested = true) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📤 Creating product:', data);

      const response = useNested
        ? await productService.createNested(data)
        : await productService.create(data);
      
      console.log('✅ Product created:', response);
      return response;
    } catch (err) {
      console.error('❌ Error creating product:', err);
      setError(err.message || 'Failed to create product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id, data, useNested = true, partial = false) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📤 Updating product:', id, data);

      let response;
      if (useNested) {
        response = partial
          ? await productService.updateNestedPartial(id, data)
          : await productService.updateNested(id, data);
      } else {
        response = partial
          ? await productService.updatePartial(id, data)
          : await productService.update(id, data);
      }

      console.log('✅ Product updated:', response);
      return response;
    } catch (err) {
      console.error('❌ Error updating product:', err);
      setError(err.message || 'Failed to update product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id, useNested = true) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ Deleting product:', id);

      useNested
        ? await productService.deleteNested(id)
        : await productService.delete(id);
      
      console.log('✅ Product deleted');
    } catch (err) {
      console.error('❌ Error deleting product:', err);
      setError(err.message || 'Failed to delete product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    loading,
    error,
  };
};
