import api from './api';

export const deliveryService = {
  // Auth
  register: async (data) => {
    const res = await api.post('/delivery/register', data);
    return res.data;
  },

  login: async (data) => {
    const res = await api.post('/delivery/login', data);
    return res.data;
  },

  // Profile & Duty
  getProfile: async () => {
    const res = await api.get('/delivery/profile');
    return res.data?.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/delivery/profile', data);
    return res.data?.data;
  },

  toggleDuty: async (isOnline) => {
    const res = await api.put('/delivery/duty', { isOnline });
    return res.data?.data;
  },

  // KYC
  getKyc: async () => {
    const res = await api.get('/delivery/kyc');
    return res.data?.data;
  },

  uploadKycDoc: async (data) => {
    const res = await api.post('/delivery/kyc/document', data);
    return res.data?.data;
  },

  submitKyc: async () => {
    const res = await api.post('/delivery/kyc/submit');
    return res.data?.data;
  },

  adminVerifyKyc: async (status, rejectionReason, userId) => {
    const res = await api.post('/delivery/kyc/verify', { status, rejectionReason, userId });
    return res.data?.data;
  },

  // Dashboard & Jobs
  getDashboard: async () => {
    const res = await api.get('/delivery/dashboard');
    return res.data?.data;
  },

  getAvailableJobs: async () => {
    const res = await api.get('/delivery/jobs/available');
    return res.data?.data || [];
  },

  getMyJobs: async (filter = {}) => {
    const params = new URLSearchParams();
    if (filter.status) params.append('status', filter.status);
    if (filter.type) params.append('type', filter.type);
    const res = await api.get(`/delivery/jobs/my?${params.toString()}`);
    return res.data?.data || [];
  },

  getJobById: async (id) => {
    const res = await api.get(`/delivery/jobs/${id}`);
    return res.data?.data;
  },

  acceptJob: async (id) => {
    const res = await api.post(`/delivery/jobs/${id}/accept`);
    return res.data?.data;
  },

  updateJobStatus: async (id, status, notes) => {
    const res = await api.put(`/delivery/jobs/${id}/status`, { status, notes });
    return res.data?.data;
  },

  // Cash on Delivery
  recordCod: async (id, amount) => {
    const res = await api.post(`/delivery/jobs/${id}/cod`, { amount });
    return res.data?.data;
  },

  reconcileCod: async (data = {}) => {
    const res = await api.post('/delivery/reconcile', data);
    return res.data?.data;
  },

  getReconciliations: async () => {
    const res = await api.get('/delivery/reconciliations');
    return res.data?.data || [];
  },

  // Used Part Inspection
  verifyUsedPart: async (id, data) => {
    const res = await api.post(`/delivery/jobs/${id}/verify-used-part`, data);
    return res.data?.data;
  },
};

export default deliveryService;
