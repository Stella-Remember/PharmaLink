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
    {
      id: 'dashboard', label: 'Dashboard',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
    },
    {
      id: 'inventory', label: 'Inventory',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
      ),
    },
    {
      id: 'pos', label: 'POS / Sales',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      ),
    },
    {
      id: 'claims', label: 'Claims',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
    },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    switch (tabId) {
      case 'dashboard': navigate('/pharmacist/dashboard'); break;
      case 'inventory':  navigate('/inventory'); break;
      case 'pos':        navigate('/pos'); break;
      case 'claims':     navigate('/claims'); break;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-200 flex flex-col">

      {/* Logo */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-center">
        <img
          src="/logo.png"
          alt="PharmaLink"
          className="h-12 w-auto object-contain"
        />
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-[#1a2235] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {initials || 'PH'}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-800 truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs text-gray-400">
              {user?.role === 'PHARMACIST' ? 'Pharmacist' : 'Owner'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">Main Menu</p>
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium border-l-2 ${
                  activeTab === item.id
                    ? 'bg-teal-50 text-teal-600 border-teal-500'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-transparent'
                }`}
              >
                <span className={activeTab === item.id ? 'text-teal-600' : 'text-gray-400'}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-all text-sm font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;