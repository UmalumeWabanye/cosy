import api from './api';

export const getProperties = (params) =>
  api.get('/properties', { params }).then((r) => r.data);

export const getProperty = (id) =>
  api.get(`/properties/${id}`).then((r) => r.data);

export const createProperty = (data) =>
  api.post('/properties', data).then((r) => r.data);

export const updateProperty = (id, data) =>
  api.put(`/properties/${id}`, data).then((r) => r.data);

export const deleteProperty = (id) =>
  api.delete(`/properties/${id}`).then((r) => r.data);
