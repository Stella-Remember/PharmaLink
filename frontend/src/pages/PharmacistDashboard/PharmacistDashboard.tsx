import React, { useState } from 'react';
import Sidebar from '../../components/Layout/Sidebar';

const PharmacistDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="ml-64 p-6 w-full">
        <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">Total Medicines: 695</div>
          <div className="card">Low Stock: 4</div>
          <div className="card">Pending Claims: 2</div>
        </div>
      </main>
    </div>
  );
};

export default PharmacistDashboard;