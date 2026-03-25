import React from 'react';

interface LowStockItem {
  id?: string | number;
  medicine: string;
  currentStock: number;
  reorderLevel: number;
  status?: string;
}

interface LowStockTableProps {
  items: LowStockItem[];
  onReorder?: (id: string | number) => void;
  onViewAll?: () => void;
}

const LowStockTable: React.FC<LowStockTableProps> = ({ 
  items, 
  onReorder,
  onViewAll 
}) => {
  const getStockStatusColor = (current: number, reorderLevel: number) => {
    if (current === 0) return 'text-red-600 dark:text-red-400';
    if (current < reorderLevel / 2) return 'text-orange-600 dark:text-orange-400';
    return 'text-amber-600 dark:text-amber-400';
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Low Stock Items</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">No low stock items</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">All inventory levels are healthy</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Low Stock Items</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            View All
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Medicine
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Reorder Level
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {items.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {item.medicine}
                </td>
                <td className={`px-4 py-3 text-sm font-medium ${getStockStatusColor(item.currentStock, item.reorderLevel)}`}>
                  {item.currentStock} units
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {item.reorderLevel} units
                </td>
                <td className="px-4 py-3 text-right">
                  {onReorder && (
                    <button
                      onClick={() => onReorder(item.id || index)}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      Reorder
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStockTable;