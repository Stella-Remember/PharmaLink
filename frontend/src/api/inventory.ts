// src/api/inventory.ts
import api from './client';

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  category: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  reorderLevel: number;
  unitPrice: number;
  sellingPrice: number;
  supplier?: string;
  manufacturer?: string;
  requiresPrescription: boolean;
  storeId: string;
  createdAt: string;
}

export const inventoryAPI = {
  getAll: (params?: any) => api.get('/inventory', { params }),
  getById: (id: string) => api.get(`/inventory/${id}`),
  create: (data: Partial<Medicine>) => api.post('/inventory', data),
  update: (id: string, data: Partial<Medicine>) => api.put(`/inventory/${id}`, data),
  delete: (id: string) => api.delete(`/inventory/${id}`),
  adjustStock: (id: string, adjustment: number, reason: string) => 
    api.patch(`/inventory/${id}/stock`, { adjustment, reason })
};