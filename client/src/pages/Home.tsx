import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import MenuSection from '../components/MenuSection';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Home.css';

function Home() {
  const { user } = useAuth();
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const res = await apiClient.get('/orders/my');
        const orders = res.data || [];
        const prevStatuses = JSON.parse(localStorage.getItem('orderStatuses') || '{}');
        let newStatuses: Record<string, string> = {};
        let showNotif = false;
        let notifMsg = '';
        for (const order of orders) {
          newStatuses[order.id] = order.status;
          if (
            prevStatuses[order.id] &&
            prevStatuses[order.id] !== order.status &&
            order.status !== 'cancelled' &&
            !(prevStatuses[order.id] === 'pending' && order.status === 'cancelled') // nie pokazuj jeśli klient sam anulował
          ) {
            showNotif = true;
            notifMsg = `Status zamówienia #${order.id.substring(0,8)} został zmieniony na: ${getStatusLabel(order.status)}`;
            break;
          }
        }
        localStorage.setItem('orderStatuses', JSON.stringify(newStatuses));
        if (showNotif) setNotification(notifMsg);
      } catch {}
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const getStatusLabel = (status: string) => {
    const statusLabels: any = {
      pending: 'Oczekujące',
      preparing: 'W przygotowaniu',
      ready: 'Gotowe do odbioru',
      delivered: 'Wysłane',
      cancelled: 'Anulowane',
    };
    return statusLabels[status] || status;
  };

  return (
    <div className="restaurant-page">
      {notification && (
        <div className="notification" style={{position:'fixed',top:20,right:20,background:'#28a745',color:'#fff',padding:'12px 24px',borderRadius:8,zIndex:1000,display:'flex',alignItems:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}}>
          <span style={{flex:1}}>{notification}</span>
          <button
            style={{
              marginLeft: 24,
              fontSize: 24,
              fontWeight: 'bold',
              background: 'none',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.15)')}
            onMouseOut={e => (e.currentTarget.style.background = 'none')}
            aria-label="Zamknij powiadomienie"
            onClick={()=>setNotification(null)}
          >
            ×
          </button>
        </div>
      )}
      <header className="header">
        <Navbar />
        <div className="hero-banner">
          <div className="content">
            <h1>Smaczne dania w naszej restauracji</h1>
            <p>Zamów online lub przyjdź do lokalu</p>
          </div>
        </div>
      </header>
      <MenuSection />
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">RestaurantSystem</div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Informacje</h4>
              <a href="#">O nas</a>
              <a href="#">Kontakt</a>
            </div>
            <div className="footer-column">
              <h4>Godziny otwarcia</h4>
              <p>Poniedziałek - Piątek: 10:00 - 22:00</p>
              <p>Sobota - Niedziela: 12:00 - 23:00</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2023 RestaurantSystem. Wszystkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;

