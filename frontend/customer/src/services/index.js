import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getMe: () => api.get('/auth/me'),
};

export const catalogService = {
  getCategories: () => api.get('/catalog/categories'),
  getCategoryBySlug: (slug) => api.get(`/catalog/categories/${slug}`),
  getBrands: () => api.get('/catalog/brands'),
  listProducts: (params) => api.get('/catalog/products', { params }),
  getProduct: (slug, variantId) =>
    api.get(`/catalog/products/${slug}`, { params: variantId ? { variantId } : {} }),
};

export const vehiclesService = {
  getMakes: (type) => api.get('/vehicles/makes', { params: type ? { type } : {} }),
  getModels: (makeId) => api.get(`/vehicles/makes/${makeId}/models`),
  getVariants: (modelId) => api.get(`/vehicles/models/${modelId}/variants`),
  getGarage: () => api.get('/vehicles/garage'),
  addVehicle: (data) => api.post('/vehicles/garage', data),
  updateVehicle: (id, data) => api.put(`/vehicles/garage/${id}`, data),
  setPrimaryVehicle: (id) => api.patch(`/vehicles/garage/${id}/primary`),
  removeVehicle: (id) => api.delete(`/vehicles/garage/${id}`),
};

export const usersService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.post('/users/change-password', data),
  getAddresses: () => api.get('/users/addresses'),
  createAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  setDefaultAddress: (id) => api.patch(`/users/addresses/${id}/default`),
};

export const cartService = {
  getCart: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  updateItem: (id, quantity) => api.patch(`/cart/items/${id}`, { quantity }),
  removeItem: (id) => api.delete(`/cart/items/${id}`),
  clearCart: () => api.delete('/cart/clear'),
  revalidate: () => api.post('/cart/revalidate'),
};

export const ordersService = {
  listOrders: () => api.get('/orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  getCheckoutQuote: (data) => api.post('/orders/checkout-quote', data),
};

export const paymentsService = {
  createPaymentOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  recordFailure: (data) => api.post('/payments/fail', data),
  retryPayment: (orderId) => api.post(`/payments/retry/${orderId}`),
  getPaymentStatus: (orderId) => api.get(`/payments/status/${orderId}`),
  switchPaymentMethod: (orderId, data) => api.patch(`/payments/switch-method/${orderId}`, data),
};

export const subscriptionsService = {
  getPlans: (params) => api.get('/subscriptions/plans', { params }),
  getPlan: (idOrSlug, params) => api.get(`/subscriptions/plans/${idOrSlug}`, { params }),
  getMySubscriptions: () => api.get('/subscriptions/my'),
  getMySubscription: () => api.get('/subscriptions/my/active'),
  subscribe: (data) => api.post('/subscriptions/subscribe', data),
  verifyPayment: (data) => api.post('/subscriptions/verify-payment', data),
  cancelSubscription: (id, data) => api.patch(`/subscriptions/${id}/cancel`, data),
  toggleAutoRenew: (id, autoRenew) => api.patch(`/subscriptions/${id}/auto-renew`, { autoRenew }),
  renewSubscription: (id) => api.post(`/subscriptions/${id}/renew`),
  expireSubscription: (id) => api.post(`/subscriptions/${id}/expire`),
  useEntitlement: (id, data) => api.post(`/subscriptions/${id}/use-entitlement`, data),
};

export const servicesService = {
  getShops: (city) => api.get('/shops', { params: city ? { city } : {} }),
  getShop: (slug) => api.get(`/shops/${slug}`),
};

export const usedPartsService = {
  listUsedParts: (params) => api.get('/usedparts', { params }),
  getPublicListing: (id) => api.get(`/usedparts/${id}`),
  createListing: (data) => api.post('/usedparts', data),
  getMyListings: (params) => api.get('/usedparts/my', { params }),
  getMyListing: (id) => api.get(`/usedparts/my/${id}`),
  cancelListing: (id, data) => api.patch(`/usedparts/my/${id}/cancel`, data),
  uploadPhotos: (formData) =>
    api.post('/usedparts/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const supportService = {
  getTickets: () => api.get('/support/tickets'),
  createTicket: (data) => api.post('/support/tickets', data),
};
