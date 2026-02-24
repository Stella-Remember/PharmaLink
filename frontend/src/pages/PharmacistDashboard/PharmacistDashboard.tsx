// src/pages/PharmacistDashboard/PharmacistDashboard.tsx
import React, { useState } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import StatsCard from '../../components/Dashboard/StatsCard';
import LowStockTable from '../../components/Dashboard/LowStockTable';
import RecentSales from '../../components/Dashboard/RecentSales';

const PharmacistDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = {
    totalMedicines: 695,
    lowStockCount: 4,
    todaySales: 0,
    pendingClaims: 2
  };

  const lowStockItems = [
    { medicine: 'Aspirin 75mg', currentStock: 15, reorderLevel: 80, status: 'Low Stock' },
    { medicine: 'Metformin 500mg', currentStock: 30, reorderLevel: 60, status: 'Low Stock' },
    { medicine: 'Amoxicillin 250mg', currentStock: 45, reorderLevel: 50, status: 'Low Stock' },
    { medicine: 'Paracetamol 500mg', currentStock: 120, reorderLevel: 150, status: 'Low Stock' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-64 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-600">Overview of your pharmacy operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Medicines" value={stats.totalMedicines} icon="💊" />
          <StatsCard title="Low Stock Alerts" value={stats.lowStockCount} subtitle="Requires attention" icon="⚠️" />
          <StatsCard title="Today's Sales" value={`$${stats.todaySales.toFixed(2)}`} icon="💰" />
          <StatsCard title="Pending Claims" value={stats.pendingClaims} icon="📋" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LowStockTable items={lowStockItems} />
          </div>
          <div className="lg:col-span-1">
            <RecentSales sales={[]} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PharmacistDashboard;