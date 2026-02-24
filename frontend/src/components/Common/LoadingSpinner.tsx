import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
        <div className="mt-4 text-gray-600 font-medium">Loading...</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;