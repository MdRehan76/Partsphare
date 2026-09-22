import api from './api';

export const shopService = {
  // Auth & Onboarding
  register: async (data) => {
    const res = await api.post('/shops/register', data);
    return res.data;
  },

  login: async (credentials) => {
    const res = await api.post('/shops/login', credentials);
    return res.data;
  },

  // Profile
  getProfile: async () => {
    const res = await api.get('/shops/portal/profile');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/shops/portal/profile', data);
    return res.data;
  },

  // Dashboard KPI
  getDashboard: async () => {
    const res = await api.get('/shops/portal/dashboard');
    return res.data;
  },

  // Service Calendar
  getCalendar: async (params = {}) => {
    const res = await api.get('/shops/portal/calendar', { params });
    return res.data;
  },

  updateJobStatus: async (jobId, status, notes = '') => {
    const res = await api.patch(`/shops/portal/jobs/${jobId}/status`, { status, notes });
    return res.data;
  },

  // Commission System & Ledger
  getCommissionLedger: async () => {
    const res = await api.get('/shops/portal/commission');
    return res.data;
  },

  requestPayout: async () => {
    const res = await api.post('/shops/portal/commission/payout');
    return res.data;
  },

  // Deliveries
  getDeliveries: async () => {
    const res = await api.get('/shops/portal/deliveries');
    return res.data;
  },

  receiveDelivery: async (deliveryId, receivedBy) => {
    const res = await api.patch(`/shops/portal/deliveries/${deliveryId}/receive`, { receivedBy });
    return res.data;
  },

  // Used Part Intake
  getUsedParts: async () => {
    const res = await api.get('/shops/portal/used-parts');
    return res.data;
  },

  recordUsedPart: async (data) => {
    const res = await api.post('/shops/portal/used-parts', data);
    return res.data;
  },

  // Support Tickets
  getTickets: async () => {
    const res = await api.get('/shops/portal/tickets');
    return res.data;
  },

  createTicket: async (data) => {
    const res = await api.post('/shops/portal/tickets', data);
    return res.data;
  },

  addTicketMessage: async (ticketId, message, senderName) => {
    const res = await api.post(`/shops/portal/tickets/${ticketId}/messages`, { message, senderName });
    return res.data;
  },
};

export default shopService;
