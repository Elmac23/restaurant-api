import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createOrder } from '../api/services/orderService';
import { useAuth } from '../contexts/AuthContext';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, orderData } = location.state || { cartItems: [], orderData: {} };
  const [paymentMethod, setPaymentMethod] = useState('gotówka');
  const [paymentStatus, setPaymentStatus] = useState('oczekuje');
  const [orderSuccess, setOrderSuccess] = useState('');
  const [orderError, setOrderError] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);

  // Ustaw domyślne wartości pól adresowych na podstawie user jeśli nie ma ich w orderData
  const mergedOrderData = {
    city: orderData.city || user?.city || '',
    address: orderData.address || user?.address || '',
    phoneNumber: orderData.phoneNumber || user?.phoneNumber || '',
    ...orderData
  };
  const [formData, setFormData] = useState({
    city: mergedOrderData.city,
    address: mergedOrderData.address,
    phoneNumber: mergedOrderData.phoneNumber,
  });

  // Ensure formData is always up-to-date with user data if user changes (e.g. after login/profile update)
  useEffect(() => {
    setFormData({
      city: orderData.city || user?.city || '',
      address: orderData.address || user?.address || '',
      phoneNumber: orderData.phoneNumber || user?.phoneNumber || '',
    });
    // eslint-disable-next-line
  }, [user]);

  const handlePaymentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentMethod(e.target.value);
  };

  // Dodaj obsługę zmian pól adresowych
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);
    setOrderError('');
    setOrderSuccess('');
    try {
      await createOrder({
        ...mergedOrderData,
        ...formData,
        items: cartItems.map((item: any) => ({ id: item.id, quantity: item.quantity, type: item.type })),
        restaurantId: mergedOrderData.restaurantId || 'default',
        paymentMethod,
        paymentStatus,
      }, user?.id);
      setOrderSuccess('Zamówienie zostało złożone!');
      setTimeout(() => navigate('/orders-history'), 1500);
    } catch (err: any) {
      if (err?.response?.data) {
        setOrderError('Błąd: ' + JSON.stringify(err.response.data));
      } else {
        setOrderError('Błąd podczas składania zamówienia.');
      }
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h2>Podsumowanie zamówienia</h2>
      <ul>
        {cartItems.map((item: any) => (
          <li key={item.id}>{item.name} x{item.quantity} - {(item.price * item.quantity).toFixed(2)} zł</li>
        ))}
      </ul>
      <div>Razem: {cartItems.reduce((total: number, item: any) => total + (item.price * item.quantity), 0).toFixed(2)} zł</div>
      <div><b>Adres dostawy:</b> {formData.city}, {formData.address}</div>
      <form onSubmit={handleOrder} className="order-form">
        <label>
          Miasto:
          <input name="city" value={formData.city} onChange={handleInputChange} required minLength={2} />
        </label>
        <label>
          Adres:
          <input name="address" value={formData.address} onChange={handleInputChange} required minLength={5} />
        </label>
        <label>
          Telefon:
          <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required minLength={8} />
        </label>
        <h3>Szczegóły płatności</h3>
        <label>
          Metoda płatności:
          <select value={paymentMethod} onChange={handlePaymentChange} required>
            <option value="gotówka">Gotówka</option>
            <option value="karta">Karta</option>
            <option value="blik">BLIK</option>
          </select>
        </label>
        <label>
          Status płatności:
          <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} required>
            <option value="oczekuje">Oczekuje</option>
            <option value="opłacone">Opłacone</option>
            <option value="anulowane">Anulowane</option>
          </select>
        </label>
        <button type="submit" className="checkout-btn" disabled={orderLoading}>
          {orderLoading ? 'Wysyłanie...' : 'Złóż zamówienie'}
        </button>
        {orderError && <div className="error-message">{orderError}</div>}
        {orderSuccess && <div className="success-message">{orderSuccess}</div>}
      </form>
    </div>
  );
}
