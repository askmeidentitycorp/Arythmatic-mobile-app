// src/services/customerService.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/customers';
import { handleAxiosError } from '../../utils/errorHandler';

export const useCustomersRQ = (params = {}) =>
  useQuery({
    queryKey: ['customers', params],
    queryFn: () => api.getCustomers(params),
    retry: 1,
    staleTime: 5 * 60 * 1000,
    onError: handleAxiosError,
  });

export const useCreateCustomerRQ = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.createCustomer(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
    onError: handleAxiosError,
  });
};

export default {
  useCustomersRQ,
  useCreateCustomerRQ,
};
