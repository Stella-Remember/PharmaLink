import React, { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={onTabChange} />
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;