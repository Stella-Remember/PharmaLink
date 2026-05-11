import { describe, it, expect } from 'vitest';

describe('Inventory Management Tests', () => {
  it('calculates total value of inventory', () => {
    const items = [
      { name: 'Medicine A', quantity: 100, price: 1500 },
      { name: 'Medicine B', quantity: 50, price: 3000 },
      { name: 'Medicine C', quantity: 200, price: 500 }
    ];
    
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    expect(totalValue).toBe(100 * 1500 + 50 * 3000 + 200 * 500);
    expect(totalValue).toBe(150000 + 150000 + 100000);
    expect(totalValue).toBe(400000);
  });

  it('checks low stock items correctly', () => {
    const isLowStock = (quantity: number, reorderLevel: number) => {
      return quantity <= reorderLevel;
    };
    
    expect(isLowStock(30, 50)).toBe(true);
    expect(isLowStock(100, 50)).toBe(false);
    expect(isLowStock(50, 50)).toBe(true);
  });

  it('calculates expiry status', () => {
    const getExpiryStatus = (expiryDate: string) => {
      const today = new Date();
      const expiry = new Date(expiryDate);
      const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      if (daysUntilExpiry < 0) return 'Expired';
      if (daysUntilExpiry <= 90) return 'Expiring Soon';
      return 'Valid';
    };
    
    expect(getExpiryStatus('2025-01-01')).toBe('Expired');
    expect(getExpiryStatus('2026-06-01')).toBe('Expiring Soon');
    expect(getExpiryStatus('2027-12-31')).toBe('Valid');
  });
});