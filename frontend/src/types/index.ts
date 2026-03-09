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


export interface InventoryItem {
  id: string;
  medicineName?: string;
  name?: string;
  unitPrice?: number;
  sellingPrice?: number;
  quantity: number;
  category?: string;
  batchNumber?: string;
  expiryDate?: string;
}

interface CartItem {
  id: string;
  medicineName: string;
  unitPrice: number;
  quantity: number;
  total: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface SaleReceipt {
  invoiceNumber: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  timestamp: string;
  pharmacist: string;
  insuranceDetails?: InsuranceDetails;
}

interface InsuranceDetails {
  patientName: string;
  patientId: string;
  insuranceProvider: string;
  policyNumber: string;
  diagnosis: string;
}