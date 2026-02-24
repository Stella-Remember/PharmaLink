// src/components/Layout/Header.tsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'inventory', name: 'Inventory' },
    { id: 'pos', name: 'POS/Sales' },
    { id: 'claims', name: 'Claims' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    switch (tabId) {
      case 'inventory':
        navigate('/inventory');
        break;
      case 'pos':
        navigate('/pos');
        break;
      case 'claims':
        navigate('/claims');
        break;
      default:
        navigate('/pharmacist/dashboard');
        break;
    }
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm border-bottom py-2 sticky-top">
      <Container fluid className="px-4">
        <Navbar.Brand className="fw-bold text-primary fs-3">PharmaLink</Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {tabs.map((tab) => (
              <Nav.Link
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-3 mx-1 rounded-3 ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white' 
                    : 'text-dark'
                }`}
              >
                {tab.name}
              </Nav.Link>
            ))}
          </Nav>

          <div className="d-flex align-items-center">
            <div className="text-end me-3">
              <div className="small text-muted">Welcome back,</div>
              <div className="fw-semibold">{user?.firstName} {user?.lastName}</div>
              <div className="small text-muted">{user?.role === 'PHARMACIST' ? 'Pharmacist' : 'Owner'}</div>
            </div>
            
            <Dropdown align="end">
              <Dropdown.Toggle variant="light" className="rounded-circle p-0 border-0" style={{ width: '40px', height: '40px' }}>
                <div className="bg-primary bg-opacity-10 text-primary w-100 h-100 rounded-circle d-flex align-items-center justify-content-center fw-semibold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;