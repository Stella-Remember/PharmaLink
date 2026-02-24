// src/types/index.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PHARMACY_OWNER' | 'PHARMACIST' | 'HELPER' | 'MANAGER';
  isActive: boolean;
  pharmacyId?: string;
  pharmacyName?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  location: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: string;
  userId: string;
  pharmacyId: string;
  role: string;
  user?: User;
  pharmacy?: Pharmacy;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  pharmacyName?: string;
  licenseNumber?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
  pharmacyId?: string;
  pharmacyName?: string;
}