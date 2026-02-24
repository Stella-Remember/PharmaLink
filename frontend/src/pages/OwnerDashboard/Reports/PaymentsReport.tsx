import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface PaymentsReportProps {
  onBack: () => void;
}

const PaymentsReport: React.FC<PaymentsReportProps> = ({ onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Payments Report</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600">Cash Payments</p>
            <p className="text-2xl font-bold text-gray-800">RWF 0</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600">Mobile Money</p>
            <p className="text-2xl font-bold text-gray-800">RWF 0</p>
          </div>
        </div>
        <p className="text-gray-500 text-center py-8">Payments report data will be displayed here</p>
      </div>
    </div>
  );
};

export default PaymentsReport;