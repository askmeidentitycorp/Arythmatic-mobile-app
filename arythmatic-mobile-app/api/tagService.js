// api/tagService.js
import { get, post, put, patch, del } from './client';
import { keysToSnake } from '../utils/formatters';

// Tags CRUD
export const getTags = async (params = {}) => {
  return await get('/tags/', { params });
};

export const getTagById = async (id) => {
  return await get(`/tags/${id}/`);
};

export const createTag = async (tagData) => {
  const payload = keysToSnake(tagData);
  return await post('/tags/', payload);
};

export const updateTag = async (id, tagData) => {
  const payload = keysToSnake(tagData);
  return await put(`/tags/${id}/`, payload);
};

export const patchTag = async (id, updates) => {
  const payload = keysToSnake(updates);
  return await patch(`/tags/${id}/`, payload);
};

export const deleteTag = async (id) => {
  return await del(`/tags/${id}/`);
};

// Entity Tags (tag assignments to entities like customers, products)
export const getEntityTags = async (params = {}) => {
  return await get('/entity-tags/', { params });
};

export const createEntityTag = async (entityTagData) => {
  const payload = keysToSnake(entityTagData);
  return await post('/entity-tags/', payload);
};

export const deleteEntityTag = async (id) => {
  return await del(`/entity-tags/${id}/`);
};

// Bulk operations
export const bulkCreateEntityTags = async (entityTagsData) => {
  const payload = keysToSnake(entityTagsData);
  return await post('/entity-tags/bulk-create/', payload);
};

export default {
  getTags,
  getTagById,
  createTag,
  updateTag,
  patchTag,
  deleteTag,
  getEntityTags,
  createEntityTag,
  deleteEntityTag,
  bulkCreateEntityTags,
};
