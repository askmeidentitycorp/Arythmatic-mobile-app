// hooks/useProductsQuery.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { handleQueryError } from '../utils/errorHandler';

export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (params) => [...productKeys.lists(), params],
  details: () => [...productKeys.all, 'detail'],
  detail: (id) => [...productKeys.details(), id],
};

export const useProducts = (params = {}, options = {}) => {
  return useQuery({
    queryKey: productKeys.list(params),
queryFn: () => productService.getAll(params),
    onError: handleQueryError,
    ...options,
  });
};

export const useProduct = (id, options = {}) => {
  return useQuery({
    queryKey: productKeys.detail(id),
queryFn: () => productService.getById(id),
    enabled: !!id,
    onError: handleQueryError,
    ...options,
  });
};

export const useCreateProduct = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
mutationFn: (data) => productService.create(data),
    onSuccess: () => queryClient.invalidateQueries(productKeys.lists()),
    onError: handleQueryError,
    ...options,
  });
};

export const useUpdateProduct = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
mutationFn: ({ id, data }) => productService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(productKeys.detail(variables.id), data);
      queryClient.invalidateQueries(productKeys.lists());
    },
    onError: handleQueryError,
    ...options,
  });
};

export const useDeleteProduct = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
mutationFn: (id) => productService.delete(id),
    onSuccess: (data, id) => {
      queryClient.removeQueries(productKeys.detail(id));
      queryClient.invalidateQueries(productKeys.lists());
    },
    onError: handleQueryError,
    ...options,
  });
};
