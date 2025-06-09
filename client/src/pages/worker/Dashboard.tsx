import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import '../../styles/worker/Dashboard.css';

function WorkerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get('/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Błąd pobierania zamówień:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
    // Odświeżaj co 30 sekund
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/orders/${orderId}`, { status: newStatus });
      
      // Odśwież listę zamówień
      const response = await apiClient.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Błąd aktualizacji statusu:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Ładowanie danych...</div>;
  }

  const pendingOrders = orders.filter((order: any) => order.status === 'pending');

  return (
    <div className="worker-layout">
      <header className="worker-header">
        <div className="header-logo">RestaurantSystem Worker</div>
        <div className="user-section">
          <span className="user-email">{user?.email}</span>
          <button className="logout-button" onClick={handleLogout}>Wyloguj</button>
        </div>
      </header>
      
      <div className="worker-container">
        <aside className="worker-sidebar">
          <nav>
            <ul>
              <li><NavLink to="/worker" end className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink></li>
              <li><NavLink to="/worker/orders" className={({ isActive }) => isActive ? 'active' : ''}>Zamówienia</NavLink></li>
              <li><NavLink to="/home" className={({ isActive }) => isActive ? 'active' : ''}>Strona główna</NavLink></li>
            </ul>
          </nav>
        </aside>
        
        <main className="worker-content">
          <h1>Panel Pracownika</h1>
          <p>Witaj, {user?.email}!</p>
          
          <div className="orders-section">
            <h2>Oczekujące zamówienia ({pendingOrders.length})</h2>
            {pendingOrders.length === 0 ? (
              <p className="no-orders">Brak oczekujących zamówień</p>
            ) : (
              <div className="orders-list">
                {pendingOrders.map((order: any) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <span className="order-id">#{order.id.substring(0, 8)}</span>
                      <span className="order-status">Oczekujące</span>
                    </div>
                    <div className="order-body">
                      <p><strong>Adres:</strong> {order.address}, {order.city}</p>
                      <p><strong>Wartość:</strong> {order.total.toFixed(2)} zł</p>
                    </div>
                    <button 
                      className="status-button prepare"
                      onClick={() => handleStatusChange(order.id, 'preparing')}
                    >
                      Rozpocznij przygotowanie
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Podobne sekcje dla zamówień w przygotowaniu i gotowych */}
        </main>
      </div>
    </div>
  );
}

export default WorkerDashboard;