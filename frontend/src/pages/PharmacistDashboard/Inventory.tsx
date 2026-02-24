// src/pages/PharmacistDashboard/Inventory.tsx
import React, { useState } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import InventoryList from '../../components/Inventory/InventoryList';

const InventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inventory');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-64 p-6">
        <InventoryList />
      </main>
    </div>
  );
};

export default InventoryPage;