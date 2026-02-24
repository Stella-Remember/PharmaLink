import React from 'react';
import OwnerSidebar from './OwnerSidebar';
import Header from './Header';

interface OwnerLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const OwnerLayout: React.FC<OwnerLayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <OwnerSidebar activeTab={activeTab} onTabChange={onTabChange} />
      <Header activeTab={activeTab} onTabChange={onTabChange} />
      <main className="ml-64 p-8 pt-24">
        {children}
      </main>
    </div>
  );
};

export default OwnerLayout;