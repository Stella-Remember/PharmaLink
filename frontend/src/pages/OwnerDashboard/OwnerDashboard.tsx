import React, { useState } from 'react';
import { 
  BuildingStorefrontIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import OwnerLayout from '../../components/Layout/OwnerLayout';
import StoresManagement from './StoresManagement';
import UsersManagement from './UsersManagement';
import ReportsOverview from './Reports/ReportsOverview';
import SalesReport from './Reports/SalesReport';
import PaymentsReport from './Reports/PaymentsReport';

export type TabType = 'dashboard' | 'stores' | 'users' | 'reports' | 'settings';
type ReportSubTab = 'overview' | 'sales' | 'payments' | 'performance';

interface Store {
  id: string;
  name: string;
  location: string;
  totalMedicines: number;
  lowStock: number;
  todaySales: number;
  employees: number;
  status: 'active' | 'inactive';
}

const OwnerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activeReport, setActiveReport] = useState<ReportSubTab>('overview');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const stores: Store[] = [
    {
      id: '1',
      name: 'MedCare Pharmacy Downtown',
      location: '123 Main Street, Downtown',
      totalMedicines: 1245,
      lowStock: 8,
      todaySales: 1250.50,
      employees: 5,
      status: 'active'
    },
    {
      id: '2',
      name: 'HealthFirst Pharmacy West',
      location: '456 Oak Avenue, West District',
      totalMedicines: 980,
      lowStock: 5,
      todaySales: 890.75,
      employees: 4,
      status: 'active'
    }
  ];

  const totalSales = stores.reduce((sum, store) => sum + store.todaySales, 0);
  const totalMedicines = stores.reduce((sum, store) => sum + store.totalMedicines, 0);
  const totalLowStock = stores.reduce((sum, store) => sum + store.lowStock, 0);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Subash!</h1>
        <p className="text-blue-100">Here's what's happening with your pharmacies today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +12.5%
            </span>
          </div>
          <div className="text-sm text-gray-500">Total Sales Today</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">
            {totalSales.toLocaleString()} RWF
          </div>
          <div className="text-xs text-gray-400 mt-2">vs yesterday: +1,250 RWF</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <BuildingStorefrontIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="text-sm text-gray-500">Total Stores</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{stores.length}</div>
          <div className="text-xs text-gray-400 mt-2">All stores active</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="text-sm text-gray-500">Total Medicines</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{totalMedicines}</div>
          <div className="text-xs text-gray-400 mt-2">Across all stores</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="text-sm text-gray-500">Low Stock Alerts</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{totalLowStock}</div>
          <div className="text-xs text-red-500 mt-2">Need attention</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-4">
        <button
          onClick={() => setActiveTab('stores')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center"
        >
          <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
          Manage Stores
        </button>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="px-4 py-2 bg-white text-gray-700 border rounded-lg hover:bg-gray-50 font-medium flex items-center"
        >
          <UsersIcon className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Stores List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Your Stores</h3>
          <button 
            onClick={() => setActiveTab('stores')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stores.map(store => (
            <div key={store.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center">
                    <h4 className="font-semibold text-gray-800">{store.name}</h4>
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {store.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{store.location}</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Details
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Medicines</div>
                  <div className="font-semibold text-gray-800">{store.totalMedicines}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Employees</div>
                  <div className="font-semibold text-gray-800">{store.employees}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Low Stock</div>
                  <div className="font-semibold text-red-600">{store.lowStock}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Today's Sales</div>
                  <div className="font-semibold text-green-600">{store.todaySales.toLocaleString()} RWF</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReports = () => {
    switch(activeReport) {
      case 'sales':
        return <SalesReport onBack={() => setActiveReport('overview')} />;
      case 'payments':
        return <PaymentsReport onBack={() => setActiveReport('overview')} />;
      case 'performance':
        return (
          <div className="text-center py-12 text-gray-500">
            Performance report coming soon...
          </div>
        );
      default:
        return <ReportsOverview onSelectReport={setActiveReport} />;
    }
  };

  return (
    <OwnerLayout 
      activeTab={activeTab} 
      onTabChange={(tab: string) => {
        if (['dashboard', 'stores', 'users', 'reports', 'settings'].includes(tab)) {
          setActiveTab(tab as TabType);
          // Reset to overview when switching to reports tab
          if (tab === 'reports') {
            setActiveReport('overview');
          }
        }
      }}
    >
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'stores' && <StoresManagement stores={stores} />}
      {activeTab === 'users' && <UsersManagement stores={stores} />}
      {activeTab === 'reports' && renderReports()}
      {activeTab === 'settings' && (
        <div className="text-center py-12 text-gray-500">
          Settings page coming soon...
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add New User</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              setShowAddUserModal(false);
              // Handle form submission
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Select Role</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="helper">Helper</option>
                    <option value="manager">Store Manager</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Store</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Select Store</option>
                    {stores.map(store => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAddUserModal(false)} 
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
};

export default OwnerDashboard;