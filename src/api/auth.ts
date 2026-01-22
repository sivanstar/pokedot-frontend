import { apiClient } from './client';

export const authApi = {
  login: (email: string, password: string) => 
    apiClient.post('/auth/login', { email, password }),
  
  register: (username: string, email: string, password: string) => 
    apiClient.post('/auth/register', { username, email, password }),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
