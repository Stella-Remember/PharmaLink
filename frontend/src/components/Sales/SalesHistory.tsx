// src/components/Sales/SalesHistory.tsx
import React, { useState, useEffect } from 'react';
import { salesAPI } from '../../api/sales';

interface SalesHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ isOpen, onClose }) => {
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchSales();
    }
  }, [isOpen]);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const response = await salesAPI.getAll();
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Sales History</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : sales.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No sales yet</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Invoice</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Payment</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale: any) => (
                  <tr key={sale.id} className="border-t border-gray-200">
                    <td className="px-4 py-3 text-sm">{sale.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm">{new Date(sale.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{sale.paymentMethod}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{sale.total.toLocaleString()} RWF</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;