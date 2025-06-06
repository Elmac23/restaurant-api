import { useEffect, useState } from 'react';
import apiClient from '../api/client';

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [itemsMap, setItemsMap] = useState<Record<string, string>>({});

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      pending: 'Oczekujące',
      preparing: 'W przygotowaniu',
      ready: 'Gotowe do odbioru',
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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [ordersRes, dishesRes, drinksRes] = await Promise.all([
          apiClient.get('/orders/my'),
          apiClient.get('/dishes'),
          apiClient.get('/drinks'),
        ]);
        
        setOrders(ordersRes.data);
        // Mapowanie id -> nazwa dla zarówno dań jak i napojów
        const map: Record<string, string> = {};
        for (const dish of dishesRes.data) {
          map[dish.id] = dish.name;
        }
        for (const drink of drinksRes.data) {
          map[drink.id] = drink.name;
        }
        setItemsMap(map);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Błąd pobierania historii zamówień.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await apiClient.patch(`/orders/${orderId}`, { status: 'cancelled' });
      setOrders(orders => orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      setError('');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Błąd anulowania zamówienia.');
    }
  };

  if (loading) return <div>Ładowanie historii zamówień...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="orders-history-page">
      <h2>Historia zamówień</h2>
      {orders.length === 0 ? (
        <p>Brak zamówień.</p>
      ) : (
        <ul>
          {orders
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(order => (
            <li key={order.id} style={{marginBottom: 16, border: '1px solid #ddd', padding: '12px', borderRadius: '8px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                <div><b>Zamówienie #{order.id.substring(0, 8)}</b></div>
                <div 
                  style={{
                    backgroundColor: getStatusColor(order.status || 'pending'),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.9em'
                  }}
                >
                  {getStatusLabel(order.status || 'pending')}
                </div>
              </div>
              <div><b>Data:</b> {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'brak'}</div>
              <div><b>Status płatności:</b> {order.paymentStatus || 'brak'}</div>
              <div><b>Metoda płatności:</b> {order.paymentMethod || 'brak'}</div>
              <div><b>Adres:</b> {order.city || 'brak'}, {order.address || 'brak'}</div>
              <div><b>Telefon:</b> {order.phoneNumber || 'brak'}</div>
              <div><b>Wartość:</b> {order.total ? order.total.toFixed(2) + ' zł' : 'brak'}</div>
              <div><b>Pozycje:</b>
                <ul>
                  {order.items?.map((item: any) => {
                    const itemName = itemsMap[item.id];
                    const displayName = itemName ? itemName : `[Usunięty produkt]`;
                    const isDeleted = !itemName;
                    
                    return (
                      <li 
                        key={item.id} 
                        style={{ color: isDeleted ? '#999' : 'inherit' }}
                        title={isDeleted ? `ID: ${item.id}` : undefined}
                      >
                        {displayName} x{item.quantity}
                        {isDeleted && <span style={{ fontSize: '0.8em', marginLeft: '8px' }}>(produkt niedostępny)</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
              {order.status === 'pending' && (
                <button style={{marginTop: 8, background: '#dc3545', color: 'white', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer'}} onClick={() => handleCancelOrder(order.id)}>
                  Anuluj zamówienie
                </button>
              )}
              {error && <div className="error-message" style={{color: 'red', marginTop: 8}}>{error}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
