import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/manager/Dashboard.css';

function ManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading] = useState(false);

  // Przykładowe dane bez połączenia z API
  const mockOrders = {
    pending: 8,
    preparing: 5,
    ready: 3,
    delivered: 42
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Ładowanie danych...</div>;
  }

  return (
    <div className="manager-layout">
      <header className="manager-header">
        <div className="header-logo">RestaurantSystem Manager</div>
        <div className="user-section">
          <span className="user-email">{user?.email}</span>
          <button className="logout-button" onClick={handleLogout}>Wyloguj</button>
        </div>
      </header>
      
      <div className="manager-container">
        <aside className="manager-sidebar">
          <nav>
            <ul>
              <li><NavLink to="/manager" end className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink></li>
              <li><NavLink to="/manager/orders" className={({ isActive }) => isActive ? 'active' : ''}>Zamówienia</NavLink></li>
              <li><NavLink to="/manager/reports" className={({ isActive }) => isActive ? 'active' : ''}>Raporty</NavLink></li>
              <li><NavLink to="/manager/staff" className={({ isActive }) => isActive ? 'active' : ''}>Personel</NavLink></li>
              <li><NavLink to="/home" className={({ isActive }) => isActive ? 'active' : ''}>Strona główna</NavLink></li>
            </ul>
          </nav>
        </aside>
        
        <main className="manager-content">
          <h1>Panel Managera</h1>
          <p>Witaj, {user?.email}!</p>
          
          <div className="restaurant-info">
            <h2>Informacje o restauracji</h2>
            <div className="info-grid">
              <div className="info-item">
                <strong>Nazwa:</strong> Restauracja "Smakosze"
              </div>
              <div className="info-item">
                <strong>Adres:</strong> ul. Główna 15, Wrocław
              </div>
              <div className="info-item">
                <strong>Telefon:</strong> +48 71 123 45 67
              </div>
              <div className="info-item">
                <strong>Godziny pracy:</strong> 10:00 - 22:00
              </div>
            </div>
          </div>
          
          <div className="stats-section">
            <h2>Statystyki zamówień</h2>
            <div className="order-stats">
              <div className="stat-card pending">
                <h3>Oczekujące</h3>
                <p className="stat-value">{mockOrders.pending}</p>
                <NavLink to="/manager/orders?status=pending" className="view-link">Zobacz szczegóły</NavLink>
              </div>
              
              <div className="stat-card preparing">
                <h3>W przygotowaniu</h3>
                <p className="stat-value">{mockOrders.preparing}</p>
                <NavLink to="/manager/orders?status=preparing" className="view-link">Zobacz szczegóły</NavLink>
              </div>
              
              <div className="stat-card ready">
                <h3>Gotowe</h3>
                <p className="stat-value">{mockOrders.ready}</p>
                <NavLink to="/manager/orders?status=ready" className="view-link">Zobacz szczegóły</NavLink>
              </div>
              
              <div className="stat-card delivered">
                <h3>Dostarczone dziś</h3>
                <p className="stat-value">{mockOrders.delivered}</p>
                <NavLink to="/manager/orders?status=delivered" className="view-link">Zobacz szczegóły</NavLink>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h2>Szybkie akcje</h2>
            <div className="actions-grid">
              <NavLink to="/manager/orders" className="action-card">
                <h3>Zarządzaj zamówieniami</h3>
                <p>Przeglądaj i aktualizuj status zamówień</p>
              </NavLink>
              <NavLink to="/manager/reports" className="action-card">
                <h3>Generuj raporty</h3>
                <p>Sprawdź statystyki sprzedaży i wydajności</p>
              </NavLink>
              <NavLink to="/manager/staff" className="action-card">
                <h3>Zarządzaj personelem</h3>
                <p>Przeglądaj harmonogramy i zadania pracowników</p>
              </NavLink>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ManagerDashboard;