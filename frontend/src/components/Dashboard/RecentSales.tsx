import React from 'react';

interface RecentSale {
  id: string;
  invoiceNumber: string;
  total: number;
  createdAt: string;
  customerName?: string;
}

interface RecentSalesProps {
  sales: RecentSale[];
}

const RecentSales: React.FC<RecentSalesProps> = ({ sales }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Recent Sales</h3>
        <p className="text-sm text-gray-500">Latest transactions</p>
      </div>
      <div className="p-4">
        {sales.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-gray-500 text-sm">No transactions today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div>
                  <div className="text-sm font-medium text-gray-900">{sale.invoiceNumber}</div>
                  <div className="text-xs text-gray-500">{sale.customerName || 'Walk-in Customer'}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">${sale.total.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(sale.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">v1.0.0</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-500">2026 Pharmalink</span>
        </div>
      </div>
    </div>
  );
};

export default RecentSales;