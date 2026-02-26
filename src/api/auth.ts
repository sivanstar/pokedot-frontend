import api from './index';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  referralCode?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  avatar?: string;
  bio?: string;
}

export const authApi = {
  // Register new user
  register: async (data: RegisterData) => {
    try {
      const response = await api.post('/auth/register', data);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Login user
  login: async (data: LoginData) => {
    try {
      const response = await api.post('/auth/login', data);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      
      if (response.data.success && response.data.user) {
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Update profile
  updateProfile: async (data: UpdateProfileData) => {
    try {
      const response = await api.put('/users/profile', data);
      
      if (response.data.success && response.data.user) {
        // Update localStorage with new data
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userAvatar'); // Clear avatar
      window.location.href = '/login';
    }
  },

  // Check authentication status
  checkAuth: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }
};
