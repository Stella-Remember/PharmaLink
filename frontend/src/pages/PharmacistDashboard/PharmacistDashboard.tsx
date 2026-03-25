import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import StatsCard from '../../components/Dashboard/StatsCard';
import LowStockTable from '../../components/Dashboard/LowStockTable';
import RecentSales from '../../components/Dashboard/RecentSales';
import api from '../../api/client';

const PharmacistDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStockCount: 0,
    todaySales: 0,
    pendingClaims: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Replace with actual API calls
      const [medicinesRes, salesRes, claimsRes] = await Promise.all([
        api.get('/medicines/stats'),
        api.get('/sales/today'),
        api.get('/claims/pending'),
      ]);
      
      setStats({
        totalMedicines: medicinesRes.data.total,
        lowStockCount: medicinesRes.data.lowStock,
        todaySales: salesRes.data.total,
        pendingClaims: claimsRes.data.count,
      });
      
      setLowStockItems(medicinesRes.data.lowStockItems || []);
      setRecentSales(salesRes.data.recent || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clean SVG icons - no emojis
  const icons = {
    medicines: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7h-4.18A3 3 0 0 0 16 5.18V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1.18A3 3 0 0 0 8.18 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
        <line x1="12" y1="11" x2="12" y2="17"/>
        <line x1="9" y1="14" x2="15" y2="14"/>
      </svg>
    ),
    alert: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    sales: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    claims: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="ml-64 p-6 flex items-center justify-center">
          <div className="text-gray-500">Loading dashboard...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-64 p-6">

        {/* Header - Clean, no "Live" badge */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of pharmacy operations</p>
        </div>

        {/* Stats Grid - Clean cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatsCard
            title="Total Medicines"
            value={stats.totalMedicines.toLocaleString()}
            icon={icons.medicines}
            trend={stats.totalMedicines > 0 ? "+12 this month" : undefined}
          />
          <StatsCard
            title="Low Stock Alerts"
            value={stats.lowStockCount}
            subtitle={stats.lowStockCount > 0 ? "Requires attention" : "All stocked"}
            icon={icons.alert}
            variant={stats.lowStockCount > 0 ? "warning" : "default"}
          />
          <StatsCard
            title="Today's Sales"
            value={`${stats.todaySales.toLocaleString()} RWF`}
            icon={icons.sales}
          />
          <StatsCard
            title="Pending Claims"
            value={stats.pendingClaims}
            icon={icons.claims}
            variant={stats.pendingClaims > 0 ? "warning" : "default"}
          />
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LowStockTable items={lowStockItems} onReorder={(id) => console.log('Reorder', id)} />
          </div>
          <div className="lg:col-span-1">
            <RecentSales sales={recentSales} />
          </div>
        </div>

      </main>
    </div>
  );
};

export default PharmacistDashboard;