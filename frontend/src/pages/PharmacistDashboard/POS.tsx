// src/pages/PharmacistDashboard/POS.tsx
import React, { useState } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import POSComponent from '../../components/Sales/POS';

const POSPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pos');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-64 p-6">
        <POSComponent />
      </main>
    </div>
  );
};

export default POSPage;