import React from 'react';

interface Sale {
  id?: string | number;
  date: string;
  amount: number;
  customer?: string;
  items?: number;
}

interface RecentSalesProps {
  sales: Sale[];
  onViewAll?: () => void;
}

const RecentSales: React.FC<RecentSalesProps> = ({ sales, onViewAll }) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} RWF`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (sales.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Sales</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">No sales today</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Sales will appear here when processed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Sales</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            View All
          </button>
        )}
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {sales.map((sale, index) => (
          <div key={sale.id || index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(sale.amount)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(sale.date)}
              </span>
            </div>
            {sale.customer && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Customer: {sale.customer}
              </p>
            )}
            {sale.items && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {sale.items} item{sale.items !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentSales;