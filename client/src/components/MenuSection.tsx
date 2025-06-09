import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../api/services/orderService';
import { getCategories, type Category } from '../api/services/categoryService';
import apiClient from '../api/client';
import '../styles/MenuSection.css';
import { useNavigate } from 'react-router-dom';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string | number;
  kcal: string | number;
  categoryId?: string;
  filePath?: string;
}

function MenuSection() {
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [drinks, setDrinks] = useState<MenuItem[]>([]);
  const [dishCategories, setDishCategories] = useState<Category[]>([]);
  const [drinkCategories, setDrinkCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<{id: string, name: string, price: number, quantity: number, type: 'dish' | 'drink'}[]>([]);

  // Helper function to convert price to number
  const getPrice = (price: string | number): number => {
    return typeof price === 'string' ? parseFloat(price) : price;
  };

  // Helper function to convert kcal to number
  const getKcal = (kcal: string | number): number => {
    return typeof kcal === 'string' ? parseInt(kcal) : kcal;
  };
  const { user } = useAuth();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderData, setOrderData] = useState({
    city: user?.city || '',
    address: user?.address || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [orderSuccess, setOrderSuccess] = useState('');
  const [orderError, setOrderError] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const [dishesResponse, drinksResponse, dishCategoriesData, drinkCategoriesData] = await Promise.all([
          apiClient.get('/dishes'),
          apiClient.get('/drinks'),
          getCategories('dish'),
          getCategories('drink')
        ]);
        
        setDishes(dishesResponse.data);
        setDrinks(drinksResponse.data);
        setDishCategories(dishCategoriesData);
        setDrinkCategories(drinkCategoriesData);
        setLoading(false);
      } catch (error) {
        console.error('Błąd pobierania menu:', error);
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const addToCart = (item: MenuItem, type: 'dish' | 'drink') => {
    const price = getPrice(item.price);
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id && cartItem.type === type);
      if (existingItem) {
        return prevItems.map(cartItem => 
          cartItem.id === item.id && cartItem.type === type
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevItems, { id: item.id, name: item.name, price: price, quantity: 1, type }];
      }
    });
  };

  const handleOrderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderData({ ...orderData, [e.target.name]: e.target.value });
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);
    setOrderError('');
    setOrderSuccess('');
    try {
      await createOrder({
        ...orderData,
        items: cartItems.map(item => ({ id: item.id, quantity: item.quantity, type: item.type })),
        restaurantId: user?.restaurantId || 'default',
      });
      setOrderSuccess('Zamówienie zostało złożone!');
      setCartItems([]);
      setShowOrderForm(false);
    } catch (err) {
      setOrderError('Błąd podczas składania zamówienia.');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleGoToCheckout = () => {
    navigate('/checkout', { state: { cartItems, orderData: { ...orderData, restaurantId: user?.restaurantId || 'default' } } });
  };

  if (loading) return <div className="loading">Ładowanie menu...</div>;

  return (
    <section className="menu-section">
      <div className="menu-container">
        <div className="menu-categories">
          <h2>Menu restauracji</h2>
          
          {/* Dishes by category */}
          {dishCategories.map(category => {
            const categoryDishes = dishes.filter(dish => dish.categoryId === category.id);
            if (categoryDishes.length === 0) return null;
            
            return (
              <div key={category.id} className="category">
                <h3>{category.name}</h3>
                <div className="menu-items">
                  {categoryDishes.map(dish => (
                    <div key={dish.id} className="menu-item">
                      {dish.filePath && (
                        <div className="item-image">
                          <img src={dish.filePath} alt={dish.name} />
                        </div>
                      )}
                      <div className="item-info">
                        <h4>{dish.name}</h4>
                        <p className="description">{dish.description}</p>
                        <div className="price-kcal">
                          <span className="price">{getPrice(dish.price).toFixed(2)} zł</span>
                          <span className="kcal">{getKcal(dish.kcal)} kcal</span>
                        </div>
                      </div>
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => addToCart(dish, 'dish')}
                      >
                        Dodaj
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Drinks by category */}
          {drinkCategories.map(category => {
            const categoryDrinks = drinks.filter(drink => drink.categoryId === category.id);
            if (categoryDrinks.length === 0) return null;
            
            return (
              <div key={category.id} className="category">
                <h3>{category.name}</h3>
                <div className="menu-items">
                  {categoryDrinks.map(drink => (
                    <div key={drink.id} className="menu-item">                        {drink.filePath && (
                          <div className="item-image">
                            <img src={drink.filePath} alt={drink.name} />
                          </div>
                        )}
                      <div className="item-info">
                        <h4>{drink.name}</h4>
                        <p className="description">{drink.description}</p>
                        <div className="price-kcal">
                          <span className="price">{getPrice(drink.price).toFixed(2)} zł</span>
                          <span className="kcal">{getKcal(drink.kcal)} kcal</span>
                        </div>
                      </div>
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => addToCart(drink, 'drink')}
                      >
                        Dodaj
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-sidebar">
          <h3>Twoje zamówienie</h3>
          {cartItems.length === 0 ? (
            <p className="empty-cart">Twój koszyk jest pusty</p>
          ) : (
            <>
              <ul className="cart-items">
                {cartItems.map(item => (
                  <li key={item.id} className="cart-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                    <span className="item-price">{(item.price * item.quantity).toFixed(2)} zł</span>
                  </li>
                ))}
              </ul>
              <div className="cart-total">
                <span>Razem:</span>
                <span>
                  {cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)} zł
                </span>
              </div>
              {!showOrderForm && (
                <button className="checkout-btn" onClick={handleGoToCheckout} disabled={cartItems.length === 0}>
                  Zamów na adres
                </button>
              )}
              {showOrderForm && (
                <form onSubmit={handleOrder} className="order-form">
                  <label>
                    Miasto:
                    <input name="city" value={orderData.city} onChange={handleOrderInput} required />
                  </label>
                  <label>
                    Adres dostawy:
                    <input name="address" value={orderData.address} onChange={handleOrderInput} required />
                  </label>
                  <label>
                    Telefon kontaktowy:
                    <input name="phoneNumber" value={orderData.phoneNumber} onChange={handleOrderInput} required />
                  </label>
                  <button type="submit" className="checkout-btn" disabled={orderLoading}>
                    {orderLoading ? 'Wysyłanie...' : 'Złóż zamówienie'}
                  </button>
                  <button type="button" onClick={() => setShowOrderForm(false)} className="checkout-btn" style={{marginTop:8}}>Anuluj</button>
                  {orderError && <div className="error-message">{orderError}</div>}
                </form>
              )}
              {orderSuccess && <div className="success-message">{orderSuccess}</div>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default MenuSection;