import api from './api';

export const adminService = {
  // Auth
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  // Analytics & KPIs
  getKPIs: async () => {
    const res = await api.get('/admin/analytics/kpis');
    return res.data.data;
  },

  getCharts: async () => {
    const res = await api.get('/admin/analytics/charts');
    return res.data.data;
  },

  // Customers
  listCustomers: async (params) => {
    const res = await api.get('/admin/customers', { params });
    return res.data.data;
  },

  updateCustomerStatus: async (id, status) => {
    const res = await api.patch(`/admin/customers/${id}/status`, { status });
    return res.data.data;
  },

  // Shops
  listShops: async (params) => {
    const res = await api.get('/admin/shops', { params });
    return res.data.data;
  },

  verifyShop: async (id, data) => {
    const res = await api.patch(`/admin/shops/${id}/verification`, data);
    return res.data.data;
  },

  updateShopCommission: async (id, commissionRate) => {
    const res = await api.patch(`/admin/shops/${id}/commission`, { commissionRate });
    return res.data.data;
  },

  // Delivery Partners
  listDeliveryPartners: async (params) => {
    const res = await api.get('/admin/delivery-partners', { params });
    return res.data.data;
  },

  verifyDeliveryPartnerKyc: async (id, data) => {
    const res = await api.patch(`/admin/delivery-partners/${id}/kyc`, data);
    return res.data.data;
  },

  togglePartnerActivation: async (id, isActivated) => {
    const res = await api.patch(`/admin/delivery-partners/${id}/activation`, { isActivated });
    return res.data.data;
  },

  // Products & Inventory
  listProducts: async (params) => {
    const res = await api.get('/admin/products', { params });
    return res.data.data;
  },

  createProduct: async (data) => {
    const res = await api.post('/admin/products', data);
    return res.data.data;
  },

  updateProduct: async (id, data) => {
    const res = await api.patch(`/admin/products/${id}`, data);
    return res.data.data;
  },

  deleteProduct: async (id) => {
    const res = await api.delete(`/admin/products/${id}`);
    return res.data.data;
  },

  listInventory: async (params) => {
    const res = await api.get('/admin/inventory', { params });
    return res.data.data;
  },

  updateInventoryStock: async (id, data) => {
    const res = await api.patch(`/admin/inventory/${id}/stock`, data);
    return res.data.data;
  },

  // Platform Config
  getDifmConfig: async () => {
    const res = await api.get('/admin/config/difm');
    return res.data.data;
  },

  updateDifmConfig: async (data) => {
    const res = await api.put('/admin/config/difm', data);
    return res.data.data;
  },

  getCommissionConfig: async () => {
    const res = await api.get('/admin/config/commissions');
    return res.data.data;
  },

  updateCommissionConfig: async (data) => {
    const res = await api.put('/admin/config/commissions', data);
    return res.data.data;
  },

  listSubscriptionPlans: async () => {
    const res = await api.get('/admin/config/subscriptions');
    return res.data.data;
  },

  updateSubscriptionPlan: async (id, data) => {
    const res = await api.patch(`/admin/config/subscriptions/${id}`, data);
    return res.data.data;
  },

  // Used Parts
  listUsedParts: async (params) => {
    const res = await api.get('/admin/used-parts', { params });
    return res.data.data;
  },

  updateUsedPart: async (id, data) => {
    const res = await api.patch(`/admin/used-parts/${id}`, data);
    return res.data.data;
  },

  // Deliveries Fleet
  listDeliveries: async (params) => {
    const res = await api.get('/admin/deliveries', { params });
    return res.data.data;
  },

  reassignDelivery: async (id, deliveryPartnerId) => {
    const res = await api.patch(`/admin/deliveries/${id}/reassign`, { deliveryPartnerId });
    return res.data.data;
  },

  // Customer Care Hub (Tickets)
  listTickets: async (params) => {
    const res = await api.get('/admin/tickets', { params });
    return res.data.data;
  },

  getTicketById: async (id) => {
    const res = await api.get(`/admin/tickets/${id}`);
    return res.data.data;
  },

  assignTicket: async (id) => {
    const res = await api.patch(`/admin/tickets/${id}/assign`);
    return res.data.data;
  },

  addTicketMessage: async (id, message) => {
    const res = await api.post(`/admin/tickets/${id}/messages`, { message });
    return res.data.data;
  },

  resolveTicket: async (id, resolutionNotes) => {
    const res = await api.patch(`/admin/tickets/${id}/resolve`, { resolutionNotes });
    return res.data.data;
  },

  closeTicket: async (id) => {
    const res = await api.patch(`/admin/tickets/${id}/close`);
    return res.data.data;
  },
};

export default adminService;
