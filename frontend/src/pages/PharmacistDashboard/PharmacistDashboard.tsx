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
    pendingClaims: 2,
  };

  const lowStockItems = [
    { medicine: 'Aspirin 75mg',        currentStock: 15,  reorderLevel: 80,  status: 'Low Stock' },
    { medicine: 'Metformin 500mg',     currentStock: 30,  reorderLevel: 60,  status: 'Low Stock' },
    { medicine: 'Amoxicillin 250mg',   currentStock: 45,  reorderLevel: 50,  status: 'Low Stock' },
    { medicine: 'Paracetamol 500mg',   currentStock: 120, reorderLevel: 150, status: 'Low Stock' },
  ];

  // SVG icons — no emoji
  const icons = {
    medicines: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3"/>
        <circle cx="18" cy="18" r="3"/><path d="m22 22-1.5-1.5"/>
      </svg>
    ),
    alert: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    sales: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    claims: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-64 p-6">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-gray-800">Dashboard</h2>
            <p className="text-gray-400 text-sm mt-0.5">Overview of your pharmacy operations</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse inline-block" />
            <span className="text-xs text-gray-400">Live</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Medicines"
            value={stats.totalMedicines}
            icon={icons.medicines}
            accent="blue"
          />
          <StatsCard
            title="Low Stock Alerts"
            value={stats.lowStockCount}
            subtitle="Requires attention"
            icon={icons.alert}
            accent="amber"
          />
          <StatsCard
            title="Today's Sales"
            value={`${stats.todaySales.toLocaleString()} RWF`}
            icon={icons.sales}
            accent="green"
          />
          <StatsCard
            title="Pending Claims"
            value={stats.pendingClaims}
            icon={icons.claims}
            accent="indigo"
          />
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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