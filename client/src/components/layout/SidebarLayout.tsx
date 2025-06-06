import type { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/layout/SidebarLayout.css';

interface SidebarLayoutProps {
  children: ReactNode;
  title: string;
  sidebarContent: ReactNode;
}

function SidebarLayout({ children, title, sidebarContent }: SidebarLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <h1 className="dashboard-logo">RestaurantSystem</h1>
        <div className="user-controls">
          <span className="user-email">{user?.email} ({user?.role})</span>
          <button onClick={handleLogout} className="logout-button">Wyloguj</button>
        </div>
      </header>
      
      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          {sidebarContent}
        </aside>
        
        <main className="dashboard-content">
          <h1 className="page-title">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}

export default SidebarLayout;