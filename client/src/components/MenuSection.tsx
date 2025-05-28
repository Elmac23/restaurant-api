import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MenuSection.css';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  kcal: number;
}

function MenuSection() {
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [drinks, setDrinks] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<{id: string, name: string, price: number, quantity: number}[]>([]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const [dishesResponse, drinksResponse] = await Promise.all([
          axios.get('http://localhost:5000/dishes'),
          axios.get('http://localhost:5000/drinks')
        ]);
        
        setDishes(dishesResponse.data);
        setDrinks(drinksResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Błąd pobierania menu:', error);
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const addToCart = (item: MenuItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        return prevItems.map(cartItem => 
          cartItem.id === item.id 
            ? {...cartItem, quantity: cartItem.quantity + 1} 
            : cartItem
        );
      } else {
        return [...prevItems, {id: item.id, name: item.name, price: item.price, quantity: 1}];
      }
    });
  };

  if (loading) return <div className="loading">Ładowanie menu...</div>;

  return (
    <section className="menu-section">
      <div className="menu-container">
        <div className="menu-categories">
          <h2>Menu restauracji</h2>
          
          <div className="category">
            <h3>Dania główne</h3>
            <div className="menu-items">
              {dishes.map(dish => (
                <div key={dish.id} className="menu-item">
                  <div className="item-info">
                    <h4>{dish.name}</h4>
                    <p className="description">{dish.description}</p>
                    <div className="price-kcal">
                      <span className="price">{dish.price.toFixed(2)} zł</span>
                      <span className="kcal">{dish.kcal} kcal</span>
                    </div>
                  </div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(dish)}
                  >
                    Dodaj
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="category">
            <h3>Napoje</h3>
            <div className="menu-items">
              {drinks.map(drink => (
                <div key={drink.id} className="menu-item">
                  <div className="item-info">
                    <h4>{drink.name}</h4>
                    <p className="description">{drink.description}</p>
                    <div className="price-kcal">
                      <span className="price">{drink.price.toFixed(2)} zł</span>
                      <span className="kcal">{drink.kcal} kcal</span>
                    </div>
                  </div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(drink)}
                  >
                    Dodaj
                  </button>
                </div>
              ))}
            </div>
          </div>
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
              <button className="checkout-btn">Zamów do stolika</button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default MenuSection;