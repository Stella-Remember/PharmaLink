// src/components/Sales/PaymentModal.tsx
import React, { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (paymentDetails: any) => void;
  total: number;
}

const INSURANCE_COMPANIES = [
  { id: 'rssb', name: 'RSSB - Rwanda Social Security Board' },
  { id: 'rama', name: 'RAMA - Rwanda Military Insurance' },
  { id: 'mmi', name: 'MMI - Medical Mutual Insurance' },
];

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onComplete, total }) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile' | 'insurance'>('cash');
  const [selectedInsurance, setSelectedInsurance] = useState('');
  const [memberId, setMemberId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cashReceived, setCashReceived] = useState(total);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const paymentDetails = {
        method: paymentMethod,
        total,
        ...(paymentMethod === 'cash' && { cashReceived, change: cashReceived - total }),
        ...(paymentMethod === 'mobile' && { phoneNumber }),
        ...(paymentMethod === 'insurance' && {
          insuranceProvider: selectedInsurance,
          memberId,
          memberName
        })
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      onComplete(paymentDetails);
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Complete Payment</h2>
          <p className="text-xl font-bold text-blue-600 mt-1">{total.toLocaleString()} RWF</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {['cash', 'mobile', 'insurance'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method as any)}
                  className={`p-2 border rounded-lg text-sm ${
                    paymentMethod === method
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {method === 'cash' ? '💵 Cash' : method === 'mobile' ? '📱 Mobile' : '🏥 Insurance'}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'cash' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Received</label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(parseFloat(e.target.value))}
                  min={total}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              {cashReceived > total && (
                <div className="p-2 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-700">Change: {(cashReceived - total).toLocaleString()} RWF</span>
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'mobile' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="078X XXX XXX"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>
          )}

          {paymentMethod === 'insurance' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                <select
                  value={selectedInsurance}
                  onChange={(e) => setSelectedInsurance(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                >
                  <option value="">Select insurance</option>
                  {INSURANCE_COMPANIES.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member ID</label>
                <input
                  type="text"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Name</label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-gray-700">
              Cancel
            </button>
            <button type="submit" disabled={isProcessing} className="px-4 py-2 bg-green-600 text-white rounded-lg">
              {isProcessing ? 'Processing...' : 'Complete Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;