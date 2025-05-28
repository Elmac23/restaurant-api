import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import '../../styles/admin/Dashboard.css';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    dishes: 0,
    drinks: 0,
    orders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dishes, drinks, orders] = await Promise.all([
          apiClient.get('/dishes'),
          apiClient.get('/drinks'),
          apiClient.get('/orders')
        ]);
        
        setStats({
          dishes: dishes.data.length,
          drinks: drinks.data.length,
          orders: orders.data.length
        });
      } catch (error) {
        console.error('Błąd pobierania statystyk:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Ładowanie danych...</div>;
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="header-logo">RestaurantSystem Admin</div>
        <div className="user-section">
          <span className="user-email">{user?.email}</span>
          <button className="logout-button" onClick={handleLogout}>Wyloguj</button>
        </div>
      </header>
      
      <div className="admin-container">
        <aside className="admin-sidebar">
          <nav>
            <ul>
              <li><NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink></li>
              <li><NavLink to="/admin/dishes" className={({ isActive }) => isActive ? 'active' : ''}>Dania</NavLink></li>
              <li><NavLink to="/admin/drinks" className={({ isActive }) => isActive ? 'active' : ''}>Napoje</NavLink></li>
              <li><NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>Użytkownicy</NavLink></li>
              <li><NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Strona główna</NavLink></li>
            </ul>
          </nav>
        </aside>
        
        <main className="admin-content">
          <h1>Panel Administratora</h1>
          <p>Witaj, {user?.email}!</p>
          
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Dania</h3>
              <p className="stat-value">{stats.dishes}</p>
              <NavLink to="/admin/dishes" className="view-link">Zarządzaj daniami</NavLink>
            </div>
            
            <div className="stat-card">
              <h3>Napoje</h3>
              <p className="stat-value">{stats.drinks}</p>
              <NavLink to="/admin/drinks" className="view-link">Zarządzaj napojami</NavLink>
            </div>
            
            <div className="stat-card">
              <h3>Zamówienia</h3>
              <p className="stat-value">{stats.orders}</p>
              <NavLink to="/admin/orders" className="view-link">Zobacz zamówienia</NavLink>
            </div>
            
            <div className="stat-card">
              <h3>Użytkownicy</h3>
              <p className="stat-value">-</p>
              <NavLink to="/admin/users" className="view-link">Zarządzaj użytkownikami</NavLink>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;