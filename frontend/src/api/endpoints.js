import client from './client';

const unwrap = (promise) => promise.then((res) => res.data);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (payload) => unwrap(client.post('/auth/register', payload)),
  login: (payload) => unwrap(client.post('/auth/login', payload)),
  logout: () => unwrap(client.post('/auth/logout')),
  me: () => unwrap(client.get('/auth/me')),
  forgotPassword: (payload) => unwrap(client.post('/auth/forgot-password', payload)),
  resetPassword: (payload) => unwrap(client.post('/auth/reset-password', payload)),
  changePassword: (payload) => unwrap(client.patch('/auth/change-password', payload)),
};

// ── Users / Units ────────────────────────────────────────────────────────────
export const userApi = {
  list: (params) => unwrap(client.get('/users', { params })),
  getById: (id) => unwrap(client.get(`/users/${id}`)),
  approve: (id) => unwrap(client.patch(`/users/${id}/approve`)),
  updateStatus: (id, status) => unwrap(client.patch(`/users/${id}/status`, { status })),
  updateRole: (id, role) => unwrap(client.patch(`/users/${id}/role`, { role })),
  remove: (id) => unwrap(client.delete(`/users/${id}`)),
  myProfile: () => unwrap(client.get('/residents/profile')),
  updateMyProfile: (payload) => unwrap(client.patch('/residents/profile', payload)),
  addTenant: (payload) => unwrap(client.post('/residents/tenants', payload)),
  listUnits: (params) => unwrap(client.get('/units', { params })),
  createUnit: (payload) => unwrap(client.post('/units', payload)),
  updateUnit: (id, payload) => unwrap(client.patch(`/units/${id}`, payload)),
};

// ── Visitors ─────────────────────────────────────────────────────────────────
export const visitorApi = {
  preApprove: (payload) => unwrap(client.post('/visitors/preapprove', payload)),
  my: (params) => unwrap(client.get('/visitors/my', { params })),
  listAll: (params) => unwrap(client.get('/visitors', { params })),
  verify: (payload) => unwrap(client.post('/visitors/verify', payload)),
  checkIn: (id) => unwrap(client.post(`/visitors/${id}/checkin`)),
  checkOut: (id) => unwrap(client.post(`/visitors/${id}/checkout`)),
  walkIn: (payload) => unwrap(client.post('/visitors/walkin', payload)),
  approveWalkIn: (id, payload) => unwrap(client.patch(`/visitors/${id}/approve`, payload)),
  getById: (id) => unwrap(client.get(`/visitors/${id}`)),
};

// ── Complaints ───────────────────────────────────────────────────────────────
export const complaintApi = {
  create: (payload) => unwrap(client.post('/complaints', payload)),
  my: (params) => unwrap(client.get('/complaints/my', { params })),
  assignedToMe: (params) => unwrap(client.get('/complaints/assigned/me', { params })),
  list: (params) => unwrap(client.get('/complaints', { params })),
  getById: (id) => unwrap(client.get(`/complaints/${id}`)),
  assign: (id, staffId) => unwrap(client.patch(`/complaints/${id}/assign`, { staffId })),
  updateStatus: (id, payload) => unwrap(client.patch(`/complaints/${id}/status`, payload)),
  updatePriority: (id, priority) => unwrap(client.patch(`/complaints/${id}/priority`, { priority })),
  submitFeedback: (id, payload) => unwrap(client.post(`/complaints/${id}/feedback`, payload)),
};

// ── Announcements / Forum ──────────────────────────────────────────────────
export const announcementApi = {
  create: (payload) => unwrap(client.post('/announcements', payload)),
  list: (params) => unwrap(client.get('/announcements', { params })),
  getById: (id) => unwrap(client.get(`/announcements/${id}`)),
  update: (id, payload) => unwrap(client.patch(`/announcements/${id}`, payload)),
  remove: (id) => unwrap(client.delete(`/announcements/${id}`)),
  triggerEmergency: (payload) => unwrap(client.post('/alerts/emergency', payload)),
  listPosts: (params) => unwrap(client.get('/forum/posts', { params })),
  createPost: (payload) => unwrap(client.post('/forum/posts', payload)),
  addComment: (id, body) => unwrap(client.post(`/forum/posts/${id}/comment`, { body })),
  likePost: (id) => unwrap(client.post(`/forum/posts/${id}/like`)),
};

// ── Facilities / Bookings ────────────────────────────────────────────────────
export const facilityApi = {
  list: (params) => unwrap(client.get('/facilities', { params })),
  create: (payload) => unwrap(client.post('/facilities', payload)),
  update: (id, payload) => unwrap(client.patch(`/facilities/${id}`, payload)),
  availability: (id, date) => unwrap(client.get(`/facilities/${id}/availability`, { params: { date } })),
  requestBooking: (payload) => unwrap(client.post('/bookings', payload)),
  myBookings: (params) => unwrap(client.get('/bookings/my', { params })),
  listBookings: (params) => unwrap(client.get('/bookings', { params })),
  approveBooking: (id, payload) => unwrap(client.patch(`/bookings/${id}/approve`, payload)),
  cancelBooking: (id) => unwrap(client.patch(`/bookings/${id}/cancel`)),
};

// ── Payments / Invoices ──────────────────────────────────────────────────────
export const paymentApi = {
  generateInvoices: (payload) => unwrap(client.post('/invoices/generate', payload)),
  myInvoices: (params) => unwrap(client.get('/invoices/my', { params })),
  listInvoices: (params) => unwrap(client.get('/invoices', { params })),
  getInvoiceById: (id) => unwrap(client.get(`/invoices/${id}`)),
  updateInvoice: (id, payload) => unwrap(client.patch(`/invoices/${id}`, payload)),
  payInvoice: (id, payload) => unwrap(client.post(`/invoices/${id}/pay`, payload)),
  getReceipt: (id) => unwrap(client.get(`/invoices/${id}/receipt`)),
  myPayments: (params) => unwrap(client.get('/payments/my', { params })),
  listPayments: (params) => unwrap(client.get('/payments', { params })),
  updatePayment: (id, payload) => unwrap(client.patch(`/payments/${id}`, payload)),
};

// ── Security ─────────────────────────────────────────────────────────────────
export const securityApi = {
  registerVehicle: (payload) => unwrap(client.post('/vehicles', payload)),
  myVehicles: () => unwrap(client.get('/vehicles/my')),
  searchVehicles: (params) => unwrap(client.get('/vehicles', { params })),
  deleteVehicle: (id) => unwrap(client.delete(`/vehicles/${id}`)),
  dashboard: () => unwrap(client.get('/security/dashboard')),
  emergencyContacts: () => unwrap(client.get('/emergency-contacts')),
  addEmergencyContact: (payload) => unwrap(client.post('/emergency-contacts', payload)),
};

// ── Dashboard / Notifications ─────────────────────────────────────────────────
export const dashboardApi = {
  overview: () => unwrap(client.get('/dashboard/overview')),
  financial: (params) => unwrap(client.get('/dashboard/financial', { params })),
  maintenance: (params) => unwrap(client.get('/dashboard/maintenance', { params })),
  visitors: (params) => unwrap(client.get('/dashboard/visitors', { params })),
  bookings: (params) => unwrap(client.get('/dashboard/bookings', { params })),
  notifications: (params) => unwrap(client.get('/notifications', { params })),
  markNotificationRead: (id) => unwrap(client.patch(`/notifications/${id}/read`)),
  markAllRead: () => unwrap(client.patch('/notifications/read-all')),
};
