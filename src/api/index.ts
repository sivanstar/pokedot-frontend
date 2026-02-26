import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));
    
    // exp is in seconds, Date.now() is in milliseconds
    // Check if token is expired or will expire in the next 30 seconds
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    
    // Consider token expired if less than 30 seconds remaining
    return timeUntilExpiry < 30000;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't decode, consider it expired
  }
};

// Function to get time remaining on token (for debugging)
export const getTokenTimeRemaining = (token: string): string => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return 'Invalid token';
    
    const payload = JSON.parse(atob(parts[1]));
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const minutesRemaining = Math.floor((expirationTime - currentTime) / 60000);
    const secondsRemaining = Math.floor(((expirationTime - currentTime) % 60000) / 1000);
    
    if (minutesRemaining < 0) return 'Expired';
    return `${minutesRemaining}m ${secondsRemaining}s remaining`;
  } catch {
    return 'Unknown';
  }
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true,
});

// Request interceptor to add auth token and check expiration
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('Token expired, redirecting to login');
        
        // Clear expired token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login with expired message
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?session=expired';
        }
        
        // Cancel the request
        return Promise.reject(new Error('Token expired'));
      }
      
      // Log time remaining for debugging (optional)
      if (import.meta.env.DEV) {
        console.log('Token time remaining:', getTokenTimeRemaining(token));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Received 401 unauthorized, logging out');
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login with session expired message
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session=expired';
      }
    }
    
    if (error.response?.data?.message) {
      console.error('Backend Error:', error.response.data.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
