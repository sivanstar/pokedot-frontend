import api from './index';

export interface SMMService {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  category: string;
  minPoints: number;
  pointsCost: number;
  quantity: number;
  quantityUnit: string;
  isActive: boolean;
  apiServiceId: string;
  apiServiceName: string;
  apiKey: string;
  apiUrl: string;
  orderCount: number;
  createdAt: string;
}

export interface SMMOrder {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  service: {
    _id: string;
    displayName: string;
    category: string;
  };
  serviceName: string;
  username: string;
  link: string;
  quantity: number;
  pointsSpent: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  adminNotes: string;
  createdAt: string;
  completedAt?: string;
}

export const smmApi = {
  // Get available services for users
  getServices: async (): Promise<{ success: boolean; services: SMMService[] }> => {
    const response = await api.get('/social/services');
    return response.data;
  },

  // Place order
  placeOrder: async (data: {
    serviceId: string;
    username: string;
    link: string;
    quantity: number;
  }): Promise<{ success: boolean; message: string; order?: SMMOrder }> => {
    const response = await api.post('/social/order', data);
    return response.data;
  },

  // Get user orders
  getUserOrders: async (): Promise<{ success: boolean; orders: SMMOrder[] }> => {
    const response = await api.get('/social/orders');
    return response.data;
  },

  // Admin: Get all orders
  adminGetOrders: async (): Promise<{ success: boolean; orders: SMMOrder[]; stats: any }> => {
    const response = await api.get('/admin/social/orders');
    return response.data;
  },

  // Admin: Get all services
  adminGetServices: async (): Promise<{ success: boolean; services: SMMService[]; stats: any }> => {
    const response = await api.get('/admin/social/services');
    return response.data;
  },

  // Admin: Create service
  adminCreateService: async (data: Partial<SMMService>): Promise<{ success: boolean; message: string; service?: SMMService }> => {
    const response = await api.post('/admin/social/services', data);
    return response.data;
  },

  // Admin: Update service
  adminUpdateService: async (serviceId: string, data: Partial<SMMService>): Promise<{ success: boolean; message: string; service?: SMMService }> => {
    const response = await api.put(`/admin/social/services/${serviceId}`, data);
    return response.data;
  },

  // Admin: Update order status
  adminUpdateOrder: async (orderId: string, status: string, adminNotes?: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/admin/social/orders/${orderId}`, { status, adminNotes });
    return response.data;
  }
};
