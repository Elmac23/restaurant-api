import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import '../../styles/admin/Orders.css';

interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total: number;
  city: string;
  address: string;
  createdAt: string;
  items?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

function AdminOrders() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
    // Dodaj polling co 10 sekund
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get('/orders');
      
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
      setError('');
    } catch (error: any) {
      setError(error?.response?.data?.error || error?.message || 'Błąd pobierania zamówień.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/orders/${orderId}`, { status: newStatus });
      await fetchOrders();
      setError('');
    } catch (error: any) {
      console.error('Błąd aktualizacji statusu:', error);
      setError(error?.response?.data?.error || 'Błąd aktualizacji statusu zamówienia.');
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      pending: 'Oczekujące',
      preparing: 'W przygotowaniu',
      ready: 'Gotowe',
      delivered: 'Wysłane',
      cancelled: 'Anulowane'
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: '#ffc107',
      preparing: '#fd7e14',
      ready: '#28a745',
      delivered: '#6c757d',
      cancelled: '#dc3545'
    };
    return statusColors[status as keyof typeof statusColors] || '#6c757d';
  };

  const filteredOrders = (selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus)
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (loading) {
    return <div className="loading">Ładowanie zamówień...</div>;
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
              <li><NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''}>Zamówienia</NavLink></li>
              <li><NavLink to="/home" className={({ isActive }) => isActive ? 'active' : ''}>Strona główna</NavLink></li>
            </ul>
          </nav>
        </aside>
        
        <main className="admin-content">
          <div className="page-header">
            <h1>Zarządzanie Zamówieniami</h1>
            <div className="filter-section">
              <label htmlFor="status-filter">Filtruj według statusu:</label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Wszystkie</option>
                <option value="pending">Oczekujące</option>
                <option value="preparing">W przygotowaniu</option>
                <option value="ready">Gotowe</option>
                <option value="delivered">Wysłane</option>
                <option value="cancelled">Anulowane</option>
              </select>
            </div>
          </div>

          <div className="orders-stats">
            <div className="stat-item">
              <span className="stat-label">Wszystkie:</span>
              <span className="stat-value">{orders.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Oczekujące:</span>
              <span className="stat-value">{orders.filter(o => o.status === 'pending').length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">W przygotowaniu:</span>
              <span className="stat-value">{orders.filter(o => o.status === 'preparing').length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Gotowe:</span>
              <span className="stat-value">{orders.filter(o => o.status === 'ready').length}</span>
            </div>
          </div>

          {error && <div className="error-message" style={{color: 'red', marginBottom: 16}}>{error}</div>}

          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <span className="order-id">#{order.id.substring(0, 8)}</span>
                  <span 
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                
                <div className="order-details">
                  <p><strong>Adres:</strong> {order.address}, {order.city}</p>
                  <p><strong>Wartość:</strong> {order.total.toFixed(2)} zł</p>
                  <p><strong>Data:</strong> {new Date(order.createdAt).toLocaleString('pl-PL')}</p>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="order-items">
                    <h4>Pozycje zamówienia:</h4>
                    <ul>
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.name} x{item.quantity} - {(item.price * item.quantity).toFixed(2)} zł
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="order-actions">
                  {order.status === 'pending' && (
                    <button 
                      className="btn btn-warning"
                      onClick={() => handleStatusChange(order.id, 'preparing')}
                    >
                      Rozpocznij przygotowanie
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button 
                      className="btn btn-success"
                      onClick={() => handleStatusChange(order.id, 'ready')}
                    >
                      Oznacz jako gotowe
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button 
                      className="btn btn-info"
                      onClick={() => handleStatusChange(order.id, 'delivered')}
                    >
                      Oznacz jako wysłane
                    </button>
                  )}
                  {(order.status === 'pending' || order.status === 'preparing') && (
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                    >
                      Anuluj
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="empty-state">
              <p>Brak zamówień {selectedStatus !== 'all' ? `ze statusem "${getStatusLabel(selectedStatus)}"` : 'w systemie'}.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminOrders;