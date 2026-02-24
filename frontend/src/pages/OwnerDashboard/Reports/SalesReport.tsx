import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface SalesReportProps {
  onBack: () => void;
}

const SalesReport: React.FC<SalesReportProps> = ({ onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Sales Report</h2>
      </div>

      {/* Add your sales report content here */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Sales report content coming soon...</p>
      </div>
    </div>
  );
};

export default SalesReport;