import api from './api';

export const residentAPI = {
  list: (params) => api.get('/users', { params }),
  getProfile: () => api.get('/residents/profile'),
  updateProfile: (payload) => api.patch('/residents/profile', payload),
  emergencyContacts: () => api.get('/emergency-contacts'),
};
