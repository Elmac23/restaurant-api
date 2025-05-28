import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import WorkerHeader from '../../components/worker/WorkerHeader';
import WorkerSidebar from '../../components/worker/WorkerSidebar';
import '../../styles/worker/Orders.css';

interface Order {
  id: string;
  customerName: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    type: 'dish' | 'drink';
  }>;
}

function WorkerOrders() {
  const [searchParams] = useSearchParams();
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'active');

  // Mock data - frontend only implementation for worker
  const mockOrders: Order[] = [
    {
      id: '1',
      customerName: 'Jan Kowalski',
      status: 'pending',
      total: 45.50,
      createdAt: '2025-05-28T10:30:00Z',
      items: [
        { id: '1', name: 'Pizza Margherita', quantity: 1, price: 25.00, type: 'dish' },
        { id: '2', name: 'Coca Cola', quantity: 2, price: 10.25, type: 'drink' }
      ]
    },
    {
      id: '2',
      customerName: 'Anna Nowak',
      status: 'preparing',
      total: 67.80,
      createdAt: '2025-05-28T11:15:00Z',
      items: [
        { id: '3', name: 'Spaghetti Carbonara', quantity: 2, price: 22.00, type: 'dish' },
        { id: '4', name: 'Tiramisu', quantity: 1, price: 15.00, type: 'dish' },
        { id: '5', name: 'Wino białe', quantity: 1, price: 35.00, type: 'drink' }
      ]
    },
    {
      id: '3',
      customerName: 'Piotr Wiśniewski',
      status: 'preparing',
      total: 89.20,
      createdAt: '2025-05-28T12:00:00Z',
      items: [
        { id: '6', name: 'Steak Wołowy', quantity: 1, price: 65.00, type: 'dish' },
        { id: '7', name: 'Frytki', quantity: 1, price: 12.00, type: 'dish' },
        { id: '8', name: 'Piwo', quantity: 2, price: 12.20, type: 'drink' }
      ]
    },
    {
      id: '4',
      customerName: 'Maria Kowalczyk',
      status: 'ready',
      total: 34.50,
      createdAt: '2025-05-28T09:45:00Z',
      items: [
        { id: '9', name: 'Sałatka Caesar', quantity: 1, price: 18.50, type: 'dish' },
        { id: '10', name: 'Lemoniada', quantity: 2, price: 16.00, type: 'drink' }
      ]
    }
  ];

  const [orders, setOrders] = useState<Order[]>(mockOrders);

  // Filter orders for worker view - only active orders (pending, preparing, ready)
  const activeStatuses = ['pending', 'preparing', 'ready'];
  const filteredOrders = selectedStatus === 'active' 
    ? orders.filter(order => activeStatuses.includes(order.status))
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
      delivered: 'Dostarczone'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL');
  };

  const getItemTypeIcon = (type: string) => {
    return type === 'dish' ? '🍽️' : '🥤';
  };

  return (
    <div className="worker-layout">
      <WorkerHeader />
      
      <div className="worker-container">
        <WorkerSidebar />
        
        <main className="worker-content">
          <h1>Zamówienia do realizacji</h1>
          
          <div className="orders-controls">
            <div className="status-filters">
              <button 
                className={selectedStatus === 'active' ? 'active' : ''}
                onClick={() => setSelectedStatus('active')}
              >
                Aktywne ({orders.filter(o => activeStatuses.includes(o.status)).length})
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
                  <small>{formatDateTime(order.createdAt)}</small>
                </div>
                
                <div className="order-items">
                  <h4>Do przygotowania:</h4>
                  <ul>
                    {order.items.map(item => (
                      <li key={item.id} className={`item-${item.type}`}>
                        <span className="item-icon">{getItemTypeIcon(item.type)}</span>
                        <span className="item-details">
                          <strong>{item.quantity}x</strong> {item.name}
                        </span>
                        <span className="item-type">{item.type === 'dish' ? 'Danie' : 'Napój'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="order-total">
                  <strong>Suma: {order.total.toFixed(2)} zł</strong>
                </div>
                
                <div className="order-actions">
                  {order.status === 'pending' && (
                    <button 
                      className="btn btn-primary"
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
                    <div className="ready-info">
                      <p>✅ Zamówienie gotowe do odbioru</p>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleStatusChange(order.id, 'delivered')}
                      >
                        Oznacz jako wydane
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="empty-state">
              <p>Brak zamówień do wyświetlenia</p>
              <small>Wszystkie zamówienia zostały wykonane! 🎉</small>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default WorkerOrders;