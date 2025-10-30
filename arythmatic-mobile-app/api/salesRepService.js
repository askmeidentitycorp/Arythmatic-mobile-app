// api/salesRepService.js
import { get, post, put, patch, del } from './client';
import { keysToSnake } from '../utils/formatters';

export const getSalesReps = async (params = {}) => {
  return await get('/sales-reps/', { params });
};

export const getSalesRepById = async (id) => {
  return await get(`/sales-reps/${id}/`);
};

export const createSalesRep = async (salesRepData) => {
  const payload = keysToSnake(salesRepData);
  return await post('/sales-reps/', payload);
};

export const updateSalesRep = async (id, salesRepData) => {
  const payload = keysToSnake(salesRepData);
  return await put(`/sales-reps/${id}/`, payload);
};

export const patchSalesRep = async (id, updates) => {
  const payload = keysToSnake(updates);
  return await patch(`/sales-reps/${id}/`, payload);
};

export const deleteSalesRep = async (id) => {
  return await del(`/sales-reps/${id}/`);
};

// Analytics endpoints
export const getSalesPerformance = async (params = {}) => {
  return await get('/analytics/sales-performance/', { params });
};

export const getTeamPerformance = async (params = {}) => {
  return await get('/analytics/team-performance/', { params });
};

export const getSalesRepPerformance = async (id, params = {}) => {
  return await get(`/sales-reps/${id}/performance/`, { params });
};

export default {
  getSalesReps,
  getSalesRepById,
  createSalesRep,
  updateSalesRep,
  patchSalesRep,
  deleteSalesRep,
  getSalesPerformance,
  getTeamPerformance,
  getSalesRepPerformance,
};
