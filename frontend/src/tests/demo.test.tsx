import { describe, it, expect } from 'vitest';

describe('PharmaLink Test Suite', () => {
  it('Test 1: Math operations work correctly', () => {
    const add = (a: number, b: number) => a + b;
    expect(add(2, 3)).toBe(5);
    expect(add(10, 20)).toBe(30);
  });

  it('Test 2: String validation works', () => {
    const isValidEmail = (email: string) => {
      return /^\S+@\S+$/.test(email);
    };
    
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('Test 3: Array operations work', () => {
    const medicines = ['Paracetamol', 'Amoxicillin', 'Nexium'];
    expect(medicines).toHaveLength(3);
    expect(medicines).toContain('Nexium');
    expect(medicines.indexOf('Amoxicillin')).toBe(1);
  });

  it('Test 4: Medicine validation works', () => {
    const validateMedicine = (medicine: any) => {
      // Check if name exists and is not empty
      if (!medicine.name || medicine.name.trim() === '') return false;
      // Check if price is a positive number
      if (typeof medicine.price !== 'number' || medicine.price <= 0) return false;
      // Check if quantity is a non-negative number
      if (typeof medicine.quantity !== 'number' || medicine.quantity < 0) return false;
      return true;
    };
    
    const validMedicine = { name: 'Paracetamol', price: 1500, quantity: 100 };
    const invalidMedicine = { name: '', price: 0, quantity: -5 };
    const emptyMedicine = { name: null, price: -10, quantity: -1 };
    
    expect(validateMedicine(validMedicine)).toBe(true);
    expect(validateMedicine(invalidMedicine)).toBe(false);
    expect(validateMedicine(emptyMedicine)).toBe(false);
  });
});