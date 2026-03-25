// src/components/Layout/Sidebar.tsx
import React from 'react';




const Sidebar = ({ activeTab, onTabChange }: any) => {
  const menu = ['dashboard', 'inventory', 'pos', 'claims'];

  return (
    <div className="w-64 h-screen border-r bg-white fixed">
      <div className="p-4 font-bold">PharmaLink</div>

      <nav className="p-2">
        {menu.map((item) => (
          <button
            key={item}
            onClick={() => onTabChange(item)}
            className={`block w-full text-left px-3 py-2 rounded ${
              activeTab === item ? 'bg-gray-100 font-medium' : 'text-gray-500'
            }`}
          >
            {item}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;