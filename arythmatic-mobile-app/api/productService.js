// DEPRECATED: api/productService.js
// Forwarding exports to services/productService to avoid duplication.
export * from '../services/productService';
export { productService as default } from '../services/productService';
import { get, post, put, patch, del } from './client';
import { keysToSnake } from '../utils/formatters';

export const getProducts = async (params = {}) => {
  return await get('/products/', { params });
};

export const getProductsNested = async (params = {}) => {
  return await get('/products-nested/', { params });
};

export const getProductById = async (id) => {
  return await get(`/products/${id}/`);
};

export const createProduct = async (productData) => {
  const payload = keysToSnake(productData);
  return await post('/products/', payload);
};

export const updateProduct = async (id, productData) => {
  const payload = keysToSnake(productData);
  return await put(`/products/${id}/`, payload);
};

export const patchProduct = async (id, updates) => {
  const payload = keysToSnake(updates);
  return await patch(`/products/${id}/`, payload);
};

export const deleteProduct = async (id) => {
  return await del(`/products/${id}/`);
};

export default {
  getProducts,
  getProductsNested,
  getProductById,
  createProduct,
  updateProduct,
  patchProduct,
  deleteProduct,
};
