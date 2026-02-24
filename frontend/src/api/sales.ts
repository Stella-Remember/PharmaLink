// src/api/sales.ts
import api from './client';

export interface Sale {
  id: string;
  invoiceNumber: string;
  total: number;
  paymentMethod: string;
  items: any[];
  createdAt: string;
}

export const salesAPI = {
  getAll: (params?: any) => api.get('/sales', { params }),
  create: (data: any) => api.post('/sales', data),
  getToday: () => api.get('/sales/today'),
};