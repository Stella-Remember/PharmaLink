// src/api/index.ts
import api from './client';
import { User, Pharmacy, AuthResponse, LoginCredentials, RegisterData } from '../types';

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials) => 
    api.post<AuthResponse>('/auth/login', credentials),
  
  register: (data: RegisterData) => 
    api.post<{ message: string; user: User }>('/auth/register', data),
  
  getMe: () => 
    api.get<User>('/auth/me'),
};

// Users API
export const usersAPI = {
  getAll: () => 
    api.get<User[]>('/users'),
  
  getPharmacists: () => 
    api.get<User[]>('/users/pharmacists'),
  
  getById: (id: string) => 
    api.get<User>(`/users/${id}`),
  
  create: (data: Partial<User> & { password: string }) => 
    api.post<User>('/users', data),
  
  createPharmacist: (data: any) => 
    api.post('/users/pharmacist', data),
  
  update: (id: string, data: Partial<User>) => 
    api.put(`/users/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/users/${id}`),
};

// Pharmacy API
export const pharmaciesAPI = {
  getAll: () => 
    api.get<Pharmacy[]>('/pharmacies'),
  
  getById: (id: string) => 
    api.get<Pharmacy>(`/pharmacies/${id}`),
  
  create: (data: Partial<Pharmacy>) => 
    api.post<Pharmacy>('/pharmacies', data),
  
  update: (id: string, data: Partial<Pharmacy>) => 
    api.put(`/pharmacies/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/pharmacies/${id}`),
  
  getStats: (id: string) => 
    api.get(`/pharmacies/${id}/stats`),
};

// Staff API
export const staffAPI = {
  getAll: () => 
    api.get('/staff'),
  
  create: (data: { userId: string; pharmacyId: string; role: string }) => 
    api.post('/staff', data),
  
  getByPharmacy: (pharmacyId: string) => 
    api.get(`/staff/pharmacy/${pharmacyId}`),
  
  remove: (userId: string, pharmacyId: string) => 
    api.delete(`/staff/${userId}/pharmacy/${pharmacyId}`),
};