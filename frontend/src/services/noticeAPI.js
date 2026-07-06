import api from './api';

export const noticeAPI = {
  list: (params) => api.get('/announcements', { params }),
  create: (payload) => api.post('/announcements', payload),
  emergency: (payload) => api.post('/alerts/emergency', payload),
};
