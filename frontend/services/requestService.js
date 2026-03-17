import api from './api';

export const createRequest = (data) =>
  api.post('/requests', data).then((r) => r.data);

export const getMyRequests = () =>
  api.get('/requests/my').then((r) => r.data);

export const getAllRequests = () =>
  api.get('/requests').then((r) => r.data);

export const updateRequestStatus = (id, status) =>
  api.patch(`/requests/${id}/status`, { status }).then((r) => r.data);
