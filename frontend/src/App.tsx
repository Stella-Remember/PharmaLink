// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import OwnerDashboard from './pages/OwnerDashboard/OwnerDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard/PharmacistDashboard';
import InventoryPage from './pages/PharmacistDashboard/Inventory';
import POSPage from './pages/PharmacistDashboard/POS';
import ClaimsPage from './pages/PharmacistDashboard/Claims';

// Owner Pages

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles = [] 
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Pharmacist Routes */}
      <Route path="/pharmacist/dashboard" element={
        <ProtectedRoute allowedRoles={['PHARMACIST', 'PHARMACY_OWNER']}>
          <PharmacistDashboard />
        </ProtectedRoute>
      } />
      <Route path="/inventory" element={
        <ProtectedRoute allowedRoles={['PHARMACIST', 'PHARMACY_OWNER']}>
          <InventoryPage />
        </ProtectedRoute>
      } />
      <Route path="/pos" element={
        <ProtectedRoute allowedRoles={['PHARMACIST', 'PHARMACY_OWNER']}>
          <POSPage />
        </ProtectedRoute>
      } />
      <Route path="/claims" element={
        <ProtectedRoute allowedRoles={['PHARMACIST', 'PHARMACY_OWNER']}>
          <ClaimsPage />
        </ProtectedRoute>
      } />
      
      {/* Owner Routes */}
      <Route path="/owner/dashboard" element={
        <ProtectedRoute allowedRoles={['PHARMACY_OWNER']}>
          <OwnerDashboard />
        </ProtectedRoute>
      } />
      
      {/* Default Redirect */}
      <Route path="/" element={
        user ? (
          user.role === 'PHARMACY_OWNER' 
            ? <Navigate to="/owner/dashboard" /> 
            : <Navigate to="/pharmacist/dashboard" />
        ) : (
          <Navigate to="/login" />
        )
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;