// src/components/Inventory/AdjustStock.tsx
import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../../api/inventory';

interface AdjustStockProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  medicineId: string;
}

const AdjustStock: React.FC<AdjustStockProps> = ({ isOpen, onClose, onSuccess, medicineId }) => {
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState('');
  const [currentStock, setCurrentStock] = useState(0);
  const [medicineName, setMedicineName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && medicineId) {
      fetchMedicineDetails();
    }
  }, [isOpen, medicineId]);

  const fetchMedicineDetails = async () => {
    try {
      const response = await inventoryAPI.getById(medicineId);
      setCurrentStock(response.data.quantity);
      setMedicineName(response.data.name);
    } catch (error) {
      console.error('Error fetching medicine:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustment === 0) {
      setError('Adjustment cannot be zero');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await inventoryAPI.adjustStock(medicineId, adjustment, reason);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to adjust stock');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Adjust Stock</h2>
          <p className="text-sm text-gray-600 mt-1">{medicineName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Current Stock */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Current Stock:</span>
              <span className="ml-2 font-semibold text-gray-900">{currentStock} units</span>
            </div>

            {/* Adjustment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adjustment <span className="text-xs text-gray-500">(positive to add, negative to remove)</span>
              </label>
              <input
                type="number"
                value={adjustment}
                onChange={(e) => setAdjustment(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10 or -5"
                required
              />
            </div>

            {/* New Stock Preview */}
            {adjustment !== 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">New Stock will be:</span>
                <span className="ml-2 font-semibold text-blue-700">{currentStock + adjustment} units</span>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., New shipment, damaged goods, sale"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || adjustment === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 text-sm"
              >
                {isLoading ? 'Adjusting...' : 'Confirm Adjustment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustStock;