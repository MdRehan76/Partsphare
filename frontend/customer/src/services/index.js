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

export const subscriptionsService = {
  getPlans: () => api.get('/subscriptions/plans'),
  getMySubscription: () => api.get('/subscriptions/my'),
};

export const servicesService = {
  getShops: (city) => api.get('/shops', { params: city ? { city } : {} }),
  getShop: (slug) => api.get(`/shops/${slug}`),
};

export const usedPartsService = {
  listUsedParts: () => api.get('/usedparts'),
  createListing: (data) => api.post('/usedparts', data),
};

export const supportService = {
  getTickets: () => api.get('/support/tickets'),
  createTicket: (data) => api.post('/support/tickets', data),
};
