import { describe, it, expect } from 'vitest';

describe('Point of Sale Tests', () => {
  it('calculates cart total correctly', () => {
    const cart = [
      { id: 1, name: 'Medicine A', price: 1500, quantity: 2 },
      { id: 2, name: 'Medicine B', price: 3000, quantity: 1 },
      { id: 3, name: 'Medicine C', price: 500, quantity: 3 }
    ];
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    expect(total).toBe(1500*2 + 3000*1 + 500*3);
    expect(total).toBe(3000 + 3000 + 1500);
    expect(total).toBe(7500);
  });

  it('applies discounts correctly', () => {
    const applyDiscount = (total: number, discountPercent: number) => {
      const discount = total * (discountPercent / 100);
      return {
        original: total,
        discount: discount,
        final: total - discount
      };
    };
    
    const result = applyDiscount(10000, 10);
    expect(result.discount).toBe(1000);
    expect(result.final).toBe(9000);
  });

  it('calculates change correctly', () => {
    const calculateChange = (total: number, amountPaid: number) => {
      if (amountPaid < total) return { success: false, change: 0, message: 'Insufficient payment' };
      return { success: true, change: amountPaid - total };
    };
    
    expect(calculateChange(7500, 10000).change).toBe(2500);
    expect(calculateChange(7500, 5000).success).toBe(false);
  });
});