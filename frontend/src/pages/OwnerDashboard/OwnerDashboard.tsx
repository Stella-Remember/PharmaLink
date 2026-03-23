// src/pages/OwnerDashboard/OwnerDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import OwnerLayout from '../../components/Layout/OwnerLayout';
import StoresManagement from './StoresManagement';
import UsersManagement from './UsersManagement';
import SalesReport from './SalesReport';
import OwnerSettings from './OwnerSettings';
import ClaimsManagement from './ClaimsManagement';
import { useAuth } from '../../contexts/AuthContext';

export type TabType = 'dashboard' | 'stores' | 'users' | 'reports' | 'inventory-report' | 'claims' | 'settings';

interface DashboardStats {
  totalStores: number;
  todaySales: number;
  totalMedicines: number;
  lowStockCount: number;
  totalEmployees: number;
  pendingClaims: number;
}

interface Store {
  id: string;
  name: string;
  location: string;
  totalMedicines: number;
  lowStock: number;
  todaySales: number;
  employees: number;
  pendingClaims: number;
  status: 'active' | 'inactive';
}

interface InventoryReportItem {
  id: string;
  medicineName: string;
  genericName: string;
  medicineType: string;
  category: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  reorderLevel: number;
  sellingPrice: number;
  pharmacyName: string;
  status: 'OK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED';
}

const API = 'http://localhost:3001/api';
const getToken = () => localStorage.getItem('token');
const apiFetch = (path: string) =>
  fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${getToken()}` } }).then(r => r.json());

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icons = {
  revenue: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  stores: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  medicines: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3"/>
      <circle cx="18" cy="18" r="3"/><path d="m22 22-1.5-1.5"/>
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  alert: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  claims: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  refresh: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  download: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; accent: string; loading?: boolean;
}> = ({ label, value, sub, icon, accent, loading }) => {
  const accents: Record<string, { icon: string; bg: string }> = {
    green:  { icon: 'text-teal-600',   bg: 'bg-teal-50' },
    blue:   { icon: 'text-blue-600',   bg: 'bg-blue-50' },
    purple: { icon: 'text-purple-600', bg: 'bg-purple-50' },
    indigo: { icon: 'text-indigo-600', bg: 'bg-indigo-50' },
    amber:  { icon: 'text-amber-600',  bg: 'bg-amber-50' },
    red:    { icon: 'text-red-500',    bg: 'bg-red-50' },
  };
  const a = accents[accent] || accents.blue;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${a.bg} ${a.icon}`}>{icon}</div>
      </div>
      {loading ? (
        <div className="h-7 w-20 rounded-md animate-pulse bg-gray-100" />
      ) : (
        <div className="text-2xl font-semibold text-gray-800">{value}</div>
      )}
      <div className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wide">{label}</div>
      {sub && <div className="text-xs text-gray-300 mt-0.5">{sub}</div>}
    </div>
  );
};

// ── Inventory Report Tab ──────────────────────────────────────────────────────
const InventoryReportTab: React.FC = () => {
  const [items, setItems] = useState<InventoryReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    apiFetch('/pharmacies/inventory-report')
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => {
    const matchStatus = filter === 'all' || i.status === filter;
    const matchSearch = i.medicineName.toLowerCase().includes(search.toLowerCase()) ||
      i.pharmacyName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const downloadCSV = () => {
    const headers = ['Medicine', 'Generic Name', 'Type', 'Category', 'Batch', 'Expiry', 'Qty', 'Reorder Level', 'Price (RWF)', 'Store', 'Status'];
    const rows = filtered.map(i => [
      i.medicineName, i.genericName, i.medicineType, i.category,
      i.batchNumber, new Date(i.expiryDate).toLocaleDateString(),
      i.quantity, i.reorderLevel, i.sellingPrice, i.pharmacyName, i.status
    ].map(v => `"${v}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `stock_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const statusBadge: Record<string, string> = {
    OK:           'bg-green-100 text-green-700',
    LOW_STOCK:    'bg-amber-100 text-amber-700',
    OUT_OF_STOCK: 'bg-red-100 text-red-700',
    EXPIRED:      'bg-red-200 text-red-800',
  };

  const counts = {
    all: items.length,
    LOW_STOCK:    items.filter(i => i.status === 'LOW_STOCK').length,
    OUT_OF_STOCK: items.filter(i => i.status === 'OUT_OF_STOCK').length,
    EXPIRED:      items.filter(i => i.status === 'EXPIRED').length,
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Stock Report</h2>
          <p className="text-sm text-gray-400 mt-0.5">Full inventory across all your stores</p>
        </div>
        <button onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium text-sm hover:bg-teal-700 transition">
          {Icons.download} Download CSV
        </button>
      </div>

      {(counts.LOW_STOCK > 0 || counts.OUT_OF_STOCK > 0 || counts.EXPIRED > 0) && (
        <div className="rounded-xl p-4 border bg-amber-50 border-amber-200">
          <div className="font-semibold text-sm text-amber-700 mb-1">Attention Required</div>
          <div className="flex gap-4 text-sm">
            {counts.LOW_STOCK > 0 && <span className="text-amber-600 font-medium">{counts.LOW_STOCK} low stock</span>}
            {counts.OUT_OF_STOCK > 0 && <span className="text-red-600 font-medium">{counts.OUT_OF_STOCK} out of stock</span>}
            {counts.EXPIRED > 0 && <span className="text-red-700 font-semibold">{counts.EXPIRED} expired</span>}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-wrap gap-2">
        <input type="text" placeholder="Search medicines or stores..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 rounded-lg text-sm border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          {(['all', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-medium transition ${filter === f
                ? 'bg-[#1a2235] text-white'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}>
              {f === 'all' ? `All (${counts.all})` : f === 'LOW_STOCK' ? `Low (${counts.LOW_STOCK})` : f === 'OUT_OF_STOCK' ? `Empty (${counts.OUT_OF_STOCK})` : `Expired (${counts.EXPIRED})`}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div className="text-sm text-gray-400">Loading inventory...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {['Medicine', 'Type', 'Store', 'Batch', 'Expiry', 'Stock', 'Reorder', 'Price', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{item.medicineName}</div>
                      {item.genericName && <div className="text-xs text-gray-400">{item.genericName}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.medicineType === 'PATENTED' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>{item.medicineType === 'PATENTED' ? 'Patented' : 'Generic'}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{item.pharmacyName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.batchNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${new Date(item.expiryDate) < new Date() ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${item.quantity === 0 ? 'text-red-500' : item.quantity <= item.reorderLevel ? 'text-amber-500' : 'text-gray-800'}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.reorderLevel}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{(item.sellingPrice || 0).toLocaleString()} RWF</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[item.status] || ''}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">No items found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const OwnerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [storesLoading, setStoresLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await apiFetch('/pharmacies/dashboard-stats');
      setStats(data);
    } catch (e) { console.error(e); }
    finally { setStatsLoading(false); }
  }, []);

  const fetchStores = useCallback(async () => {
    setStoresLoading(true);
    try {
      const data = await apiFetch('/pharmacies');
      const mapped: Store[] = (Array.isArray(data) ? data : []).map((p: any) => ({
        ...p,
        location: p.location || p.address || '',
        status: (p.status === 'active' ? 'active' : 'inactive') as 'active' | 'inactive',
      }));
      setStores(mapped);
    } catch (e) { console.error(e); }
    finally { setStoresLoading(false); }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchStores();
    const interval = setInterval(() => {
      fetchStats(); fetchStores(); setLastRefresh(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchStores]);

  const handleRefresh = () => { fetchStats(); fetchStores(); setLastRefresh(new Date()); };

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">{greeting}, {user?.firstName}!</h2>
          <p className="text-sm text-gray-400 mt-0.5">Here's what's happening across your pharmacies today.</p>
        </div>
        <button onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
          {Icons.refresh}
          Refresh · {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Today's Revenue" loading={statsLoading}
          value={stats ? `${(stats.todaySales || 0).toLocaleString()} RWF` : '—'}
          icon={Icons.revenue} accent="green" sub="Sales today" />
        <StatCard label="Total Stores" loading={statsLoading}
          value={stats?.totalStores ?? '—'} icon={Icons.stores} accent="blue" />
        <StatCard label="Medicines" loading={statsLoading}
          value={stats?.totalMedicines ?? '—'} icon={Icons.medicines} accent="purple" sub="Across all stores" />
        <StatCard label="Employees" loading={statsLoading}
          value={stats?.totalEmployees ?? '—'} icon={Icons.users} accent="indigo" />
        <StatCard label="Low Stock" loading={statsLoading}
          value={stats?.lowStockCount ?? '—'} icon={Icons.alert} accent="amber"
          sub={stats?.lowStockCount ? 'Needs restock' : 'All good'} />
        <StatCard label="Pending Claims" loading={statsLoading}
          value={stats?.pendingClaims ?? '—'} icon={Icons.claims} accent="red" sub="Insurance" />
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'View Reports',   tab: 'reports' as TabType,           primary: true },
          { label: 'Stock Report',   tab: 'inventory-report' as TabType,  primary: false },
          { label: 'Manage Stores',  tab: 'stores' as TabType,            primary: false },
          { label: 'Manage Users',   tab: 'users' as TabType,             primary: false },
        ].map(a => (
          <button key={a.tab} onClick={() => setActiveTab(a.tab)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              a.primary
                ? 'bg-[#1a2235] text-white hover:bg-[#2a3245]'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}>
            {a.label}
          </button>
        ))}
      </div>

      {/* Stores grid */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-semibold text-gray-800">Your Stores</h3>
          <button onClick={() => setActiveTab('stores')} className="text-sm text-teal-600 hover:underline font-medium">View all</button>
        </div>

        {storesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="rounded-xl p-5 border border-gray-100 bg-white animate-pulse">
                <div className="h-4 w-32 rounded bg-gray-100 mb-4" />
                <div className="grid grid-cols-2 gap-3">
                  {[1,2,3,4].map(j => <div key={j} className="h-12 rounded-lg bg-gray-100" />)}
                </div>
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="rounded-xl p-12 text-center border border-gray-100 bg-white">
            <div className="text-gray-400 font-medium mb-2">No stores yet</div>
            <button onClick={() => setActiveTab('stores')} className="text-teal-600 text-sm hover:underline">Add your first store</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map(store => (
              <div key={store.id} className="rounded-xl border border-gray-100 bg-white p-5 hover:shadow-sm transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-800">{store.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        store.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{store.status}</span>
                    </div>
                    {store.location && <p className="text-xs text-gray-400 mt-0.5">{store.location}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Medicines',     value: store.totalMedicines,                             color: 'text-blue-600' },
                    { label: 'Employees',     value: store.employees,                                  color: 'text-indigo-600' },
                    { label: 'Low Stock',     value: store.lowStock,                                   color: store.lowStock > 0 ? 'text-amber-600' : 'text-teal-600' },
                    { label: "Today's Sales", value: `${(store.todaySales || 0).toLocaleString()} RWF`, color: 'text-teal-600' },
                  ].map(stat => (
                    <div key={stat.label} className="p-3 rounded-lg bg-gray-50">
                      <div className="text-xs text-gray-400">{stat.label}</div>
                      <div className={`font-semibold text-sm mt-0.5 ${stat.color}`}>{stat.value}</div>
                    </div>
                  ))}
                </div>
                {store.pendingClaims > 0 && (
                  <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-xs font-medium text-amber-700">
                    {store.pendingClaims} pending insurance claim{store.pendingClaims > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <OwnerLayout activeTab={activeTab} onTabChange={(tab) => {
      if (['dashboard','stores','users','reports','inventory-report','claims','settings'].includes(tab)) {
        setActiveTab(tab as TabType);
      }
    }}>
      {activeTab === 'dashboard'        && renderDashboard()}
      {activeTab === 'stores'           && <StoresManagement stores={stores} onRefresh={() => { fetchStores(); fetchStats(); }} />}
      {activeTab === 'users'            && <UsersManagement stores={stores} />}
      {activeTab === 'reports'          && <SalesReport />}
      {activeTab === 'inventory-report' && <InventoryReportTab />}
      {activeTab === 'claims'           && <ClaimsManagement />}
      {activeTab === 'settings'         && <OwnerSettings />}
    </OwnerLayout>
  );
};

export default OwnerDashboard;