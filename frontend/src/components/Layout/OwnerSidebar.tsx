import React from 'react';
import { 
  HomeIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const OwnerSidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'stores', name: 'Stores', icon: BuildingStorefrontIcon },
    { id: 'users', name: 'Users', icon: UsersIcon },
    { id: 'reports', name: 'Reports', icon: DocumentChartBarIcon },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">PharmaLink</h1>
        <p className="text-sm text-gray-500 mt-1">Owner Portal</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            O
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Owner</p>
            <p className="text-xs text-gray-500">owner@pharmalink.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerSidebar;