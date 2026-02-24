// src/components/Sales/POS.tsx
import React, { useState, useEffect } from 'react';

interface CartItem {
  id: number;
  medicineName: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

interface InventoryItem {
  id: number;
  medicineName: string;
  unitPrice: number;
  quantity: number;
  category: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (paymentMethod: string, insuranceDetails?: any) => void;
  total: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentComplete, total }) => {
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [insuranceDetails, setInsuranceDetails] = useState({
    patientName: '',
    patientId: '',
    insuranceProvider: '',
    policyNumber: '',
    diagnosis: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'INSURANCE') {
      // Validate insurance details
      if (!insuranceDetails.patientName || !insuranceDetails.patientId || 
          !insuranceDetails.insuranceProvider || !insuranceDetails.policyNumber) {
        alert('Please fill in all insurance details');
        return;
      }
      onPaymentComplete(paymentMethod, insuranceDetails);
    } else {
      onPaymentComplete(paymentMethod);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Complete Payment</h2>
        <p className="text-2xl font-bold text-blue-600 mb-4">Total: {total.toLocaleString()} RWF</p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {['CASH', 'MOMO', 'CARD', 'INSURANCE'].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`px-4 py-2 border rounded-lg ${
                      paymentMethod === method 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'INSURANCE' && (
              <div className="space-y-3 border-t pt-4">
                <h3 className="font-medium">Insurance Details</h3>
                <input
                  type="text"
                  placeholder="Patient Name *"
                  value={insuranceDetails.patientName}
                  onChange={(e) => setInsuranceDetails({
                    ...insuranceDetails,
                    patientName: e.target.value
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="National ID *"
                  value={insuranceDetails.patientId}
                  onChange={(e) => setInsuranceDetails({
                    ...insuranceDetails,
                    patientId: e.target.value.replace(/[^0-9]/g, '')
                  })}
                  maxLength={16}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <select
                  value={insuranceDetails.insuranceProvider}
                  onChange={(e) => setInsuranceDetails({
                    ...insuranceDetails,
                    insuranceProvider: e.target.value
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Provider *</option>
                  <option value="RSSB - Rwanda Social Security Board">RSSB</option>
                  <option value="RAMA - Rwanda Military Insurance">RAMA</option>
                  <option value="MMI - Medical Insurance">MMI</option>
                  <option value="CORAR - CORAR Insurance">CORAR</option>
                </select>
                <input
                  type="text"
                  placeholder="Policy Number *"
                  value={insuranceDetails.policyNumber}
                  onChange={(e) => setInsuranceDetails({
                    ...insuranceDetails,
                    policyNumber: e.target.value
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Diagnosis"
                  value={insuranceDetails.diagnosis}
                  onChange={(e) => setInsuranceDetails({
                    ...insuranceDetails,
                    diagnosis: e.target.value
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {paymentMethod === 'INSURANCE' ? 'Confirm & Create Claim' : 'Complete Payment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const POS: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [error, setError] = useState('');

  // Fetch inventory on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      setError('Failed to load inventory');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredInventory = inventory.filter(item =>
    item.medicineName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (item: InventoryItem) => {
    // Check if item already in cart
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      // Check if enough stock
      if (existingItem.quantity + 1 > item.quantity) {
        alert('Not enough stock available');
        return;
      }
      
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1, total: (cartItem.quantity + 1) * cartItem.unitPrice }
          : cartItem
      ));
    } else {
      // Check if enough stock
      if (1 > item.quantity) {
        alert('Not enough stock available');
        return;
      }
      
      setCart([...cart, {
        id: item.id,
        medicineName: item.medicineName,
        unitPrice: item.unitPrice,
        quantity: 1,
        total: item.unitPrice
      }]);
    }
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    const item = cart.find(i => i.id === id);
    const inventoryItem = inventory.find(i => i.id === id);
    
    if (!item || !inventoryItem) return;
    
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    
    if (newQuantity > inventoryItem.quantity) {
      alert(`Only ${inventoryItem.quantity} items in stock`);
      return;
    }
    
    setCart(cart.map(item =>
      item.id === id
        ? { ...item, quantity: newQuantity, total: newQuantity * item.unitPrice }
        : item
    ));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = async (paymentMethod: string, insuranceDetails?: any) => {
    setIsLoading(true);
    setError('');

    try {
      // Prepare sales data
      const salesData = {
        items: cart.map(item => ({
          inventoryId: item.id,  // Use inventoryId (backend expects this)
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        })),
        totalAmount: calculateTotal(),
        paymentMethod,
        ...(paymentMethod === 'INSURANCE' && {
          patientName: insuranceDetails.patientName,
          patientId: insuranceDetails.patientId,
          insuranceProvider: insuranceDetails.insuranceProvider,
          policyNumber: insuranceDetails.policyNumber,
          diagnosis: insuranceDetails.diagnosis
        })
      };

      // Send to backend
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salesData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete sale');
      }

      // Success - clear cart and show message
      setCart([]);
      alert(`Sale completed successfully!${paymentMethod === 'INSURANCE' ? ' Insurance claim created.' : ''}`);
      
      // Refresh inventory
      fetchInventory();

    } catch (err: any) {
      setError(err.message || 'Failed to complete sale');
    } finally {
      setIsLoading(false);
      setIsPaymentModalOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left side - Inventory */}
      <div className="w-2/3 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-lg font-semibold mb-4">Inventory</h2>
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2 border rounded-lg mb-4"
          />
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {filteredInventory.map(item => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
              >
                <h3 className="font-semibold">{item.medicineName}</h3>
                <p className="text-sm text-gray-600">{item.category}</p>
                <p className="text-blue-600 font-medium">{item.unitPrice.toLocaleString()} RWF</p>
                <p className="text-sm text-gray-500">Stock: {item.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Cart */}
      <div className="w-1/3 bg-white shadow-lg p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Current Sale</h2>
        
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Cart is empty</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="border-b py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{item.medicineName}</h3>
                    <p className="text-sm text-gray-600">{item.unitPrice.toLocaleString()} RWF each</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center mt-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2 py-1 border rounded-l"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 border-t border-b">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2 py-1 border rounded-r"
                  >
                    +
                  </button>
                  <span className="ml-auto font-medium">
                    {item.total.toLocaleString()} RWF
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between text-lg font-bold mb-4">
            <span>Total:</span>
            <span>{calculateTotal().toLocaleString()} RWF</span>
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentComplete={handlePaymentComplete}
        total={calculateTotal()}
      />
    </div>
  );
};

export default POS;