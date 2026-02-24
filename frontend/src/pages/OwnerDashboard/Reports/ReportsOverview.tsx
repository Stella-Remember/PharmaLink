import React from 'react';
import { 
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface ReportsOverviewProps {
  onSelectReport: (report: 'sales' | 'payments' | 'performance') => void;
}

const ReportsOverview: React.FC<ReportsOverviewProps> = ({ onSelectReport }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Reports Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sales Report Card */}
        <button 
          onClick={() => onSelectReport('sales')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition text-left"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-800">Sales Report</h3>
          </div>
          <p className="text-gray-600 text-sm">View sales analytics, trends, and revenue across all stores</p>
          <div className="mt-4 text-sm text-blue-600">View details →</div>
        </button>

        {/* Payments Report Card */}
        <button 
          onClick={() => onSelectReport('payments')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition text-left"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-800">Payments Report</h3>
          </div>
          <p className="text-gray-600 text-sm">Track payment transactions, methods, and settlements</p>
          <div className="mt-4 text-sm text-green-600">View details →</div>
        </button>

        {/* Performance Report Card */}
        <button 
          onClick={() => onSelectReport('performance')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition text-left"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-800">Performance</h3>
          </div>
          <p className="text-gray-600 text-sm">Store performance metrics and employee analytics</p>
          <div className="mt-4 text-sm text-purple-600">View details →</div>
        </button>
      </div>
    </div>
  );
};

export default ReportsOverview;