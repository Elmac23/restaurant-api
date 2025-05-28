import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ManagerHeader from '../../components/manager/ManagerHeader';
import ManagerSidebar from '../../components/manager/ManagerSidebar';
import '../../styles/manager/Orders.css';

interface Order {
  id: string;
  customerName: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total: number;
  address: string;
  phone: string;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

function ManagerOrders() {
  const [searchParams] = useSearchParams();
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'all');

  // Mock data - frontend only implementation
  const mockOrders: Order[] = [
    {
      id: '1',
      customerName: 'Jan Kowalski',
      status: 'pending',
      total: 45.50,
      address: 'ul. Kwiatowa 12, Wrocław',
      phone: '+48 123 456 789',
      createdAt: '2025-05-28T10:30:00Z',
      items: [
        { id: '1', name: 'Pizza Margherita', quantity: 1, price: 25.00 },
        { id: '2', name: 'Coca Cola', quantity: 2, price: 10.25 }
      ]
    },
    {
      id: '2',
      customerName: 'Anna Nowak',
      status: 'preparing',
      total: 67.80,
      address: 'ul. Długa 8, Wrocław',
      phone: '+48 987 654 321',
      createdAt: '2025-05-28T11:15:00Z',
      items: [
        { id: '3', name: 'Spaghetti Carbonara', quantity: 2, price: 22.00 },
        { id: '4', name: 'Tiramisu', quantity: 1, price: 15.00 },
        { id: '5', name: 'Wino białe', quantity: 1, price: 35.00 }
      ]
    },
    {
      id: '3',
      customerName: 'Piotr Wiśniewski',
      status: 'ready',
      total: 89.20,
      address: 'ul. Krótka 15, Wrocław',
      phone: '+48 555 123 456',
      createdAt: '2025-05-28T12:00:00Z',
      items: [
        { id: '6', name: 'Steak Wołowy', quantity: 1, price: 65.00 },
        { id: '7', name: 'Frytki', quantity: 1, price: 12.00 },
        { id: '8', name: 'Piwo', quantity: 2, price: 12.20 }
      ]
    },
    {
      id: '4',
      customerName: 'Maria Kowalczyk',
      status: 'delivered',
      total: 34.50,
      address: 'ul. Główna 22, Wrocław',
      phone: '+48 666 789 012',
      createdAt: '2025-05-28T09:45:00Z',
      items: [
        { id: '9', name: 'Sałatka Caesar', quantity: 1, price: 18.50 },
        { id: '10', name: 'Lemoniada', quantity: 2, price: 16.00 }
      ]
    }
  ];

  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      )
    );
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Oczekuje',
      preparing: 'W przygotowaniu',
      ready: 'Gotowe',
      delivered: 'Dostarczone',
      cancelled: 'Anulowane'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL');
  };

  return (
    <div className="manager-layout">
      <ManagerHeader />
      
      <div className="manager-container">
        <ManagerSidebar />
        
        <main className="manager-content">
          <h1>Zarządzanie zamówieniami</h1>
          
          <div className="orders-controls">
            <div className="status-filters">
              <button 
                className={selectedStatus === 'all' ? 'active' : ''}
                onClick={() => setSelectedStatus('all')}
              >
                Wszystkie ({orders.length})
              </button>
              <button 
                className={selectedStatus === 'pending' ? 'active' : ''}
                onClick={() => setSelectedStatus('pending')}
              >
                Oczekujące ({orders.filter(o => o.status === 'pending').length})
              </button>
              <button 
                className={selectedStatus === 'preparing' ? 'active' : ''}
                onClick={() => setSelectedStatus('preparing')}
              >
                W przygotowaniu ({orders.filter(o => o.status === 'preparing').length})
              </button>
              <button 
                className={selectedStatus === 'ready' ? 'active' : ''}
                onClick={() => setSelectedStatus('ready')}
              >
                Gotowe ({orders.filter(o => o.status === 'ready').length})
              </button>
              <button 
                className={selectedStatus === 'delivered' ? 'active' : ''}
                onClick={() => setSelectedStatus('delivered')}
              >
                Dostarczone ({orders.filter(o => o.status === 'delivered').length})
              </button>
            </div>
          </div>

          <div className="orders-grid">
            {filteredOrders.map(order => (
              <div key={order.id} className={`order-card status-${order.status}`}>
                <div className="order-header">
                  <div className="order-id">Zamówienie #{order.id}</div>
                  <div className={`order-status status-${order.status}`}>
                    {getStatusLabel(order.status)}
                  </div>
                </div>
                
                <div className="order-customer">
                  <strong>{order.customerName}</strong>
                  <p>{order.phone}</p>
                  <p>{order.address}</p>
                </div>
                
                <div className="order-items">
                  <h4>Pozycje:</h4>
                  <ul>
                    {order.items.map(item => (
                      <li key={item.id}>
                        {item.quantity}x {item.name} - {item.price.toFixed(2)} zł
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="order-meta">
                  <div className="order-total">
                    <strong>Suma: {order.total.toFixed(2)} zł</strong>
                  </div>
                  <div className="order-time">
                    {formatDateTime(order.createdAt)}
                  </div>
                </div>
                
                <div className="order-actions">
                  {order.status === 'pending' && (
                    <>
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleStatusChange(order.id, 'preparing')}
                      >
                        Rozpocznij przygotowanie
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                      >
                        Anuluj
                      </button>
                    </>
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
                      className="btn btn-success"
                      onClick={() => handleStatusChange(order.id, 'delivered')}
                    >
                      Oznacz jako dostarczone
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="empty-state">
              <p>Brak zamówień do wyświetlenia</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ManagerOrders;