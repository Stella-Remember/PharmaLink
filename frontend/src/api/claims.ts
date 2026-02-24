// src/api/claims.ts
import api from './client';

export interface Claim {
  id: string;
  claimNumber: string;
  patientName: string;
  patientId: string;
  insuranceProvider: string;
  policyNumber: string;
  amount: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  submittedAt?: string;
}

export const claimsAPI = {
  getAll: (params?: any) => api.get('/claims', { params }),
  getById: (id: string) => api.get(`/claims/${id}`),
  create: (data: Partial<Claim>) => api.post('/claims', data),
  updateStatus: (id: string, status: string) => api.patch(`/claims/${id}/status`, { status }),
};