// src/components/Layout/Sidebar.tsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'pos', label: 'POS/Sales', icon: '💰' },
    { id: 'claims', label: 'Claims', icon: '📋' },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    switch(tabId) {
      case 'dashboard':
        navigate('/pharmacist/dashboard');
        break;
      case 'inventory':
        navigate('/inventory');
        break;
      case 'pos':
        navigate('/pos');
        break;
      case 'claims':
        navigate('/claims');
        break;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">PharmaLink</h1>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="text-sm text-gray-500">Welcome back,</div>
        <div className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</div>
        <div className="text-xs text-gray-500 mt-1">
          {user?.role === 'PHARMACIST' ? 'Pharmacist' : 'Owner'}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;