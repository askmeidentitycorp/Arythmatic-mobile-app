// src/api/customers.js
import apiClient from './client';

const unwrap = (p) => p.then((r) => r.data);

export const getCustomers = (params = {}) => unwrap(apiClient.get('/customers-nested/', { params }));
export const getCustomer = (id) => unwrap(apiClient.get(`/customers-nested/${id}/`));
export const createCustomer = (data) => unwrap(apiClient.post('/customers-nested/', data));
export const updateCustomer = (id, data) => unwrap(apiClient.put(`/customers-nested/${id}/`, data));
export const patchCustomer = (id, data) => unwrap(apiClient.patch(`/customers-nested/${id}/`, data));
export const deleteCustomer = (id) => unwrap(apiClient.delete(`/customers-nested/${id}/`));
