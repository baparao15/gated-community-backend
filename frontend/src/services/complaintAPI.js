import api from './api';

export const complaintAPI = {
  create: (payload) => api.post('/complaints', payload),
  my: (params) => api.get('/complaints/my', { params }),
  assignedToMe: (params) => api.get('/complaints/assigned/me', { params }),
  list: (params) => api.get('/complaints', { params }),
  updateStatus: (id, payload) => api.patch(`/complaints/${id}/status`, payload),
  feedback: (id, payload) => api.post(`/complaints/${id}/feedback`, payload),
};
