// src/api/client.ts
import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
console.log('🔌 API Client initialized with URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 50000,
});

api.interceptors.request.use((config) => {
  console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  console.log('📦 Request data:', config.data);
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 Token attached');
  }
  return config;
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ Response success:', response.status, response.data);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request timeout - backend not responding');
    } else if (error.response) {
      // Server responded with error status
      console.error('❌ Server error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response
      console.error('❌ No response from server - is backend running?');
      console.error('   Make sure backend is running on http://localhost:3001');
    } else {
      console.error('❌ Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: LoginCredentials) => api.post<AuthResponse>('/auth/login', credentials),
  register: (data: RegisterData) => api.post<{ message: string; user: User }>('/auth/register', data),
  getMe: () => api.get<User>('/auth/me'),
};

// Users API
export const userAPI = {
  getPharmacists: () => api.get('/users/pharmacists'),
  createPharmacist: (data: any) => api.post('/users/pharmacist', data),
  updatePharmacist: (id: string, data: any) => api.put(`/users/${id}`, data),
  deletePharmacist: (id: string) => api.delete(`/users/${id}`),
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
};

// Pharmacy API
export const pharmacyAPI = {
  getAll: () => api.get('/pharmacies'),
  getById: (id: string) => api.get(`/pharmacies/${id}`),
  create: (data: any) => api.post('/pharmacies', data),
  update: (id: string, data: any) => api.put(`/pharmacies/${id}`, data),
  delete: (id: string) => api.delete(`/pharmacies/${id}`),
  getStats: (id: string) => api.get(`/pharmacies/${id}/stats`),
};


export default api;
