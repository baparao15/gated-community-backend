import api from './api';

export const paymentAPI = {
  myInvoices: (params) => api.get('/invoices/my', { params }),
  listInvoices: (params) => api.get('/invoices', { params }),
  pay: (invoiceId, payload) => api.post(`/invoices/${invoiceId}/pay`, payload),
  receipt: (invoiceId) => api.get(`/invoices/${invoiceId}/receipt`),
};
