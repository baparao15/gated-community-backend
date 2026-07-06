import api from './api';

export const visitorAPI = {
  preApprove: (payload) => api.post('/visitors/preapprove', payload),
  myVisitors: (params) => api.get('/visitors/my', { params }),
  all: (params) => api.get('/visitors', { params }),
  verify: (payload) => api.post('/visitors/verify', payload),
  checkIn: (id) => api.post(`/visitors/${id}/checkin`),
  checkOut: (id) => api.post(`/visitors/${id}/checkout`),
};
