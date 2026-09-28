import api from './api';

export const procurementService = {
  // Dashboard & KPIs
  getDashboard: async () => {
    const res = await api.get('/admin/procurement');
    return res.data?.data;
  },

  // Supplier Directory
  listSuppliers: async (params) => {
    const res = await api.get('/admin/procurement/suppliers', { params });
    return res.data?.data;
  },

  getSupplierById: async (id) => {
    const res = await api.get(`/admin/procurement/suppliers/${id}`);
    return res.data?.data;
  },

  createSupplier: async (data) => {
    const res = await api.post('/admin/procurement/suppliers', data);
    return res.data?.data;
  },

  updateSupplier: async (id, data) => {
    const res = await api.patch(`/admin/procurement/suppliers/${id}`, data);
    return res.data?.data;
  },

  // Catalog & Compatibility
  searchCatalog: async (params) => {
    const res = await api.get('/admin/procurement/catalog', { params });
    return res.data?.data;
  },

  getCatalogItemById: async (id) => {
    const res = await api.get(`/admin/procurement/catalog/${id}`);
    return res.data?.data;
  },

  addCatalogItem: async (data) => {
    const res = await api.post('/admin/procurement/catalog', data);
    return res.data?.data;
  },

  calculateBulkPricing: async (catalogItemId, quantity) => {
    const res = await api.post('/admin/procurement/pricing/calculate', {
      catalogItemId,
      quantity,
    });
    return res.data?.data;
  },

  // Procurement Cart
  getCart: async () => {
    const res = await api.get('/admin/procurement/cart');
    return res.data?.data;
  },

  addToCart: async (catalogItemId, quantity) => {
    const res = await api.post('/admin/procurement/cart', {
      catalogItemId,
      quantity,
    });
    return res.data?.data;
  },

  updateCartItemQuantity: async (itemId, quantity) => {
    const res = await api.patch(`/admin/procurement/cart/items/${itemId}`, { quantity });
    return res.data?.data;
  },

  removeFromCart: async (itemId) => {
    const res = await api.delete(`/admin/procurement/cart/items/${itemId}`);
    return res.data?.data;
  },

  clearCart: async () => {
    const res = await api.delete('/admin/procurement/cart');
    return res.data?.data;
  },

  // Purchase Orders & Inbound Goods Receiving
  createPurchaseOrder: async (data) => {
    const res = await api.post('/admin/procurement/purchase-orders', data);
    return res.data?.data;
  },

  listPurchaseOrders: async (params) => {
    const res = await api.get('/admin/procurement/purchase-orders', { params });
    return res.data?.data;
  },

  getPurchaseOrderById: async (id) => {
    const res = await api.get(`/admin/procurement/purchase-orders/${id}`);
    return res.data?.data;
  },

  updatePurchaseOrderStatus: async (id, status, notes) => {
    const res = await api.patch(`/admin/procurement/purchase-orders/${id}/status`, { status, notes });
    return res.data?.data;
  },

  recordPayment: async (id, paymentData) => {
    const res = await api.post(`/admin/procurement/purchase-orders/${id}/payment`, paymentData);
    return res.data?.data;
  },

  receiveStock: async (id, receiveData) => {
    const res = await api.post(`/admin/procurement/purchase-orders/${id}/receive`, receiveData);
    return res.data?.data;
  },

  // History & Master Data
  getHistory: async (params) => {
    const res = await api.get('/admin/procurement/history', { params });
    return res.data?.data;
  },

  getVehicles: async () => {
    const res = await api.get('/admin/procurement/meta/vehicles');
    return res.data?.data;
  },

  getCategories: async () => {
    const res = await api.get('/admin/procurement/meta/categories');
    return res.data?.data;
  },
};

export default procurementService;
