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
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
    },
    {
      id: 'inventory', label: 'Inventory',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    },
    {
      id: 'pos', label: 'POS / Sales',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    },
    {
      id: 'claims', label: 'Claims',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    const routes: Record<string, string> = {
      dashboard: '/pharmacist/dashboard',
      inventory: '/inventory',
      pos: '/pos',
      claims: '/claims',
    };
    if (routes[tabId]) navigate(routes[tabId]);
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div style={{
      width: 240,
      backgroundColor: '#ffffff',
      height: '100vh',
      position: 'fixed',
      left: 0, top: 0,
      borderRight: '1px solid #EFF7FF',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid #F8FAFC', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img
          src="/logo.png"
          alt="PharmaLink"
          style={{ width: 30, height: 30, objectFit: 'contain', borderRadius: 6 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <span style={{ fontWeight: 700, fontSize: 16, color: '#201E50', letterSpacing: '-0.3px' }}>PharmaLink</span>
      </div>

      {/* User */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #F8FAFC' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', backgroundColor: '#EFF7FF', borderRadius: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            backgroundColor: '#201E50', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, flexShrink: 0,
          }}>
            {initials || 'PH'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#201E50', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: 10, color: '#4F7CAC' }}>
              {user?.role === 'PHARMACIST' ? 'Pharmacist' : 'Owner'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 10px', marginBottom: 6, margin: '0 0 8px 10px' }}>
          Main Menu
        </p>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {menuItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleTabClick(item.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 8,
                    backgroundColor: isActive ? '#EFF7FF' : 'transparent',
                    color: isActive ? '#32A287' : '#6B7280',
                    border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.12s', textAlign: 'left',
                  }}
                >
                  <span style={{ color: isActive ? '#32A287' : '#9CA3AF', flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid #F8FAFC' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8, border: 'none',
            backgroundColor: 'transparent', color: '#9CA3AF',
            cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.12s',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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