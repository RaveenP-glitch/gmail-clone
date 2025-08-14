import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Debounce mechanism to prevent notification flooding
let lastErrorTime = 0;
let lastErrorMessage = '';
const ERROR_DEBOUNCE_TIME = 5000; // 5 seconds

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.error || error.message || 'An error occurred';
        
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Don't show toast for certain endpoints or rate limit errors
        const silentEndpoints = ['/auth/profile'];
        const isRateLimit = error.response?.status === 429;
        
        // Debounce error messages to prevent flooding
        const now = Date.now();
        const shouldDebounce = (now - lastErrorTime < ERROR_DEBOUNCE_TIME) && (lastErrorMessage === message);
        
        const shouldShowToast = !silentEndpoints.some(endpoint => 
          error.config?.url?.includes(endpoint)
        ) && !isRateLimit && !shouldDebounce;

        if (shouldShowToast) {
          toast.error(message);
          lastErrorTime = now;
          lastErrorMessage = message;
        } else if (isRateLimit) {
          // Log rate limit but don't spam user with notifications
          console.warn('Rate limit exceeded, request will retry automatically');
        } else if (shouldDebounce) {
          console.warn('Duplicate error message suppressed:', message);
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async getAuthUrl() {
    const response = await this.api.get('/auth/url');
    return response.data;
  }

  async getUserProfile() {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  async logout() {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }

  // Email endpoints
  async getEmails(params = {}) {
    const response = await this.api.get('/emails', { params });
    return response.data;
  }

  async getEmailById(id) {
    const response = await this.api.get(`/emails/${id}`);
    return response.data;
  }

  async searchEmails(query, params = {}) {
    const response = await this.api.get('/emails/search', {
      params: { q: query, ...params }
    });
    return response.data;
  }

  async syncEmails() {
    const response = await this.api.post('/emails/sync');
    return response.data;
  }

  async getEmailStats() {
    const response = await this.api.get('/emails/stats');
    return response.data;
  }

  // Utility methods
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getAuthToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    const token = this.getAuthToken();
    return !!token;
  }
}

export default new ApiService(); 