// src/pages/PharmacistDashboard/Claims.tsx
import React, { useState } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import ClaimsList from '../../components/Claims/ClaimsList';

const ClaimsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('claims');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-64 p-6">
        <ClaimsList />
      </main>
    </div>
  );
};

export default ClaimsPage;