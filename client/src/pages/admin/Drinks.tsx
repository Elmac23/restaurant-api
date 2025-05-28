import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import '../../styles/admin/Drinks.css';

interface Drink {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  volume: number;
  available: boolean;
}

function AdminDrinks() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    volume: '',
    available: true
  });

  useEffect(() => {
    fetchDrinks();
  }, []);

  const fetchDrinks = async () => {
    try {
      const response = await apiClient.get('/drinks');
      setDrinks(response.data);
    } catch (error) {
      console.error('Błąd pobierania napojów:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const drinkData = {
        ...formData,
        price: parseFloat(formData.price),
        volume: parseInt(formData.volume)
      };

      if (editingDrink) {
        await apiClient.put(`/drinks/${editingDrink.id}`, drinkData);
      } else {
        await apiClient.post('/drinks', drinkData);
      }

      await fetchDrinks();
      resetForm();
    } catch (error) {
      console.error('Błąd zapisywania napoju:', error);
    }
  };

  const handleEdit = (drink: Drink) => {
    setEditingDrink(drink);
    setFormData({
      name: drink.name,
      description: drink.description,
      price: drink.price.toString(),
      category: drink.category,
      volume: drink.volume.toString(),
      available: drink.available
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten napój?')) {
      try {
        await apiClient.delete(`/drinks/${id}`);
        await fetchDrinks();
      } catch (error) {
        console.error('Błąd usuwania napoju:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      volume: '',
      available: true
    });
    setEditingDrink(null);
    setShowAddForm(false);
  };

  if (loading) {
    return <div className="loading">Ładowanie napojów...</div>;
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
              <li><NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Strona główna</NavLink></li>
            </ul>
          </nav>
        </aside>
        
        <main className="admin-content">
          <div className="page-header">
            <h1>Zarządzanie Napojami</h1>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Anuluj' : 'Dodaj napój'}
            </button>
          </div>

          {showAddForm && (
            <div className="form-container">
              <h2>{editingDrink ? 'Edytuj napój' : 'Dodaj nowy napój'}</h2>
              <form onSubmit={handleSubmit} className="drink-form">
                <div className="form-group">
                  <label htmlFor="name">Nazwa:</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Opis:</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="price">Cena (zł):</label>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="volume">Pojemność (ml):</label>
                  <input
                    type="number"
                    id="volume"
                    value={formData.volume}
                    onChange={(e) => setFormData({...formData, volume: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category">Kategoria:</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Wybierz kategorię</option>
                    <option value="soft_drinks">Napoje bezalkoholowe</option>
                    <option value="hot_drinks">Napoje gorące</option>
                    <option value="juices">Soki</option>
                    <option value="alcoholic">Napoje alkoholowe</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({...formData, available: e.target.checked})}
                    />
                    Dostępne
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingDrink ? 'Zaktualizuj' : 'Dodaj'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Anuluj
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="drinks-grid">
            {drinks.map((drink) => (
              <div key={drink.id} className="drink-card">
                <div className="drink-header">
                  <h3>{drink.name}</h3>
                  <span className={`status ${drink.available ? 'available' : 'unavailable'}`}>
                    {drink.available ? 'Dostępne' : 'Niedostępne'}
                  </span>
                </div>
                <p className="drink-description">{drink.description}</p>
                <div className="drink-details">
                  <span className="drink-category">{drink.category}</span>
                  <span className="drink-volume">{drink.volume}ml</span>
                  <span className="drink-price">{drink.price.toFixed(2)} zł</span>
                </div>
                <div className="drink-actions">
                  <button 
                    className="btn btn-edit"
                    onClick={() => handleEdit(drink)}
                  >
                    Edytuj
                  </button>
                  <button 
                    className="btn btn-delete"
                    onClick={() => handleDelete(drink.id)}
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))}
          </div>

          {drinks.length === 0 && (
            <div className="empty-state">
              <p>Brak napojów w systemie. Dodaj pierwszy napój!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDrinks;