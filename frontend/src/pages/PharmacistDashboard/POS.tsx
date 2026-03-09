
import React from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import POSComponent from '../../components/Sales/POS';

const POSPage: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeTab="pos" onTabChange={() => {}} />
      <main className="ml-64 flex-1 overflow-hidden">
        <POSComponent />
      </main>
    </div>
  );
};

export default POSPage;