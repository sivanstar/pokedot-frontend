import api from './index';

export const smmApi = {
  // ── User endpoints ──────────────────────────────────────────────────────────

  // Get all active services (grouped by category)
  getServices: async () => {
    const response = await api.get('/smm/services');
    return response.data;
  },

  // Place a boost order
  placeOrder: async (data: {
    serviceId: string;  // MongoDB _id of the service
    link: string;
    quantity: number;
  }) => {
    const response = await api.post('/smm/order', data);
    return response.data;
  },

  // Get user's order history
  getOrders: async (page = 1, limit = 10) => {
    const response = await api.get(`/smm/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Check order status (syncs from SMM API)
  checkOrderStatus: async (orderId: string) => {
    const response = await api.get(`/smm/orders/${orderId}/status`);
    return response.data;
  },

  // ── Admin endpoints ─────────────────────────────────────────────────────────

  // Sync services from resellersmm.com API
  syncServices: async () => {
    const response = await api.post('/admin/smm/sync');
    return response.data;
  },

  // Get all services (admin view, includes hidden)
  adminGetServices: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    if (params?.search) qs.append('search', params.search);
    if (params?.category) qs.append('category', params.category);
    const response = await api.get(`/admin/smm/services?${qs}`);
    return response.data;
  },

  // Update a single service (points, visibility, name, etc.)
  updateService: async (serviceId: string, updates: {
    pointsRequired?: number;
    isActive?: boolean;
    isVisible?: boolean;
    customName?: string;
    customDescription?: string;
    displayOrder?: number;
  }) => {
    const response = await api.put(`/admin/smm/services/${serviceId}`, updates);
    return response.data;
  },

  // Bulk update all services in a category
  bulkUpdateCategory: async (data: {
    category: string;
    pointsRequired?: number;
    isActive?: boolean;
    isVisible?: boolean;
  }) => {
    const response = await api.put('/admin/smm/services/bulk/update', data);
    return response.data;
  },

  // Get all orders (admin)
  adminGetOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    if (params?.status) qs.append('status', params.status);
    if (params?.search) qs.append('search', params.search);
    const response = await api.get(`/admin/smm/orders?${qs}`);
    return response.data;
  },
};