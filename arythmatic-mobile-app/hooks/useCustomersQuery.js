// hooks/useCustomersQuery.js
/**
 * Customer React Query Hooks
 * Provides reactive, cached access to customer data
 * 
 * USAGE EXAMPLE:
 * const { data: customers, isLoading } = useCustomers();
 * const createMutation = useCreateCustomer();
 * createMutation.mutate(newCustomer);
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services/customerService';
import { handleQueryError } from '../utils/errorHandler';

// Query keys for cache management
export const customerKeys = {
  all: ['customers'],
  lists: () => [...customerKeys.all, 'list'],
  list: (params) => [...customerKeys.lists(), params],
  details: () => [...customerKeys.all, 'detail'],
  detail: (id) => [...customerKeys.details(), id],
  nested: () => [...customerKeys.all, 'nested'],
  nestedList: (params) => [...customerKeys.nested(), 'list', params],
  nestedDetail: (id) => [...customerKeys.nested(), 'detail', id],
};

/**
 * Get all customers
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 */
export const useCustomers = (params = {}, options = {}) => {
  return useQuery({
    queryKey: customerKeys.list(params),
queryFn: () => customerService.getAll(params),
    onError: (error) => handleQueryError(error),
    ...options,
  });
};

/**
 * Get all customers with nested data
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 */
export const useCustomersNested = (params = {}, options = {}) => {
  return useQuery({
    queryKey: customerKeys.nestedList(params),
queryFn: () => customerService.getAllNested(params),
    onError: (error) => handleQueryError(error),
    ...options,
  });
};

/**
 * Get single customer by ID
 * @param {number} id - Customer ID
 * @param {Object} options - React Query options
 */
export const useCustomer = (id, options = {}) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
queryFn: () => customerService.getById(id),
    enabled: !!id, // Only run if ID exists
    onError: (error) => handleQueryError(error),
    ...options,
  });
};

/**
 * Get single customer with nested data
 * @param {number} id - Customer ID
 * @param {Object} options - React Query options
 */
export const useCustomerNested = (id, options = {}) => {
  return useQuery({
    queryKey: customerKeys.nestedDetail(id),
queryFn: () => customerService.getByIdNested(id),
    enabled: !!id,
    onError: (error) => handleQueryError(error),
    ...options,
  });
};

/**
 * Create customer mutation
 * @param {Object} options - Mutation options
 */
export const useCreateCustomer = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
mutationFn: (customerData) => customerService.create(customerData),
    onSuccess: (data) => {
      // Invalidate customer lists to trigger refetch
      queryClient.invalidateQueries(customerKeys.lists());
      
      if (__DEV__) {
        console.log('✅ Customer created:', data);
      }
    },
    onError: (error) => {
      handleQueryError(error);
    },
    ...options,
  });
};

/**
 * Create customer with nested data mutation
 * @param {Object} options - Mutation options
 */
export const useCreateCustomerNested = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
mutationFn: (customerData) => customerService.createNested(customerData),
    onSuccess: (data) => {
      queryClient.invalidateQueries(customerKeys.nested());
      
      if (__DEV__) {
        console.log('✅ Customer created (nested):', data);
      }
    },
    onError: (error) => {
      handleQueryError(error);
    },
    ...options,
  });
};

/**
 * Update customer mutation
 * @param {Object} options - Mutation options
 */
export const useUpdateCustomer = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
mutationFn: ({ id, data }) => customerService.update(id, data),
    onSuccess: (data, variables) => {
      // Update cache for this specific customer
      queryClient.setQueryData(customerKeys.detail(variables.id), data);
      
      // Invalidate lists
      queryClient.invalidateQueries(customerKeys.lists());
      
      if (__DEV__) {
        console.log('✅ Customer updated:', data);
      }
    },
    onError: (error) => {
      handleQueryError(error);
    },
    ...options,
  });
};

/**
 * Partial update customer mutation
 * @param {Object} options - Mutation options
 */
export const usePatchCustomer = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
mutationFn: ({ id, updates }) => customerService.updatePartial(id, updates),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(customerKeys.detail(variables.id), data);
      queryClient.invalidateQueries(customerKeys.lists());
      
      if (__DEV__) {
        console.log('✅ Customer patched:', data);
      }
    },
    onError: (error) => {
      handleQueryError(error);
    },
    ...options,
  });
};

/**
 * Delete customer mutation
 * @param {Object} options - Mutation options
 */
export const useDeleteCustomer = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
mutationFn: (id) => customerService.delete(id),
    onSuccess: (data, id) => {
      // Remove from cache
      queryClient.removeQueries(customerKeys.detail(id));
      
      // Invalidate lists
      queryClient.invalidateQueries(customerKeys.lists());
      
      if (__DEV__) {
        console.log('✅ Customer deleted:', id);
      }
    },
    onError: (error) => {
      handleQueryError(error);
    },
    ...options,
  });
};

export default {
  useCustomers,
  useCustomersNested,
  useCustomer,
  useCustomerNested,
  useCreateCustomer,
  useCreateCustomerNested,
  useUpdateCustomer,
  usePatchCustomer,
  useDeleteCustomer,
};
