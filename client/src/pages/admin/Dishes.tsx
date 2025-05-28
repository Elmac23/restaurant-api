import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import '../../styles/admin/Dishes.css';

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

function AdminDishes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true
  });

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      const response = await apiClient.get('/dishes');
      setDishes(response.data);
    } catch (error) {
      console.error('Błąd pobierania dań:', error);
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
      const dishData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (editingDish) {
        await apiClient.put(`/dishes/${editingDish.id}`, dishData);
      } else {
        await apiClient.post('/dishes', dishData);
      }

      await fetchDishes();
      resetForm();
    } catch (error) {
      console.error('Błąd zapisywania dania:', error);
    }
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description,
      price: dish.price.toString(),
      category: dish.category,
      available: dish.available
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć to danie?')) {
      try {
        await apiClient.delete(`/dishes/${id}`);
        await fetchDishes();
      } catch (error) {
        console.error('Błąd usuwania dania:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      available: true
    });
    setEditingDish(null);
    setShowAddForm(false);
  };

  if (loading) {
    return <div className="loading">Ładowanie dań...</div>;
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
            <h1>Zarządzanie Daniami</h1>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Anuluj' : 'Dodaj danie'}
            </button>
          </div>

          {showAddForm && (
            <div className="form-container">
              <h2>{editingDish ? 'Edytuj danie' : 'Dodaj nowe danie'}</h2>
              <form onSubmit={handleSubmit} className="dish-form">
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
                  <label htmlFor="category">Kategoria:</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Wybierz kategorię</option>
                    <option value="appetizers">Przystawki</option>
                    <option value="main">Dania główne</option>
                    <option value="desserts">Desery</option>
                    <option value="salads">Sałatki</option>
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
                    {editingDish ? 'Zaktualizuj' : 'Dodaj'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Anuluj
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="dishes-grid">
            {dishes.map((dish) => (
              <div key={dish.id} className="dish-card">
                <div className="dish-header">
                  <h3>{dish.name}</h3>
                  <span className={`status ${dish.available ? 'available' : 'unavailable'}`}>
                    {dish.available ? 'Dostępne' : 'Niedostępne'}
                  </span>
                </div>
                <p className="dish-description">{dish.description}</p>
                <div className="dish-details">
                  <span className="dish-category">{dish.category}</span>
                  <span className="dish-price">{dish.price.toFixed(2)} zł</span>
                </div>
                <div className="dish-actions">
                  <button 
                    className="btn btn-edit"
                    onClick={() => handleEdit(dish)}
                  >
                    Edytuj
                  </button>
                  <button 
                    className="btn btn-delete"
                    onClick={() => handleDelete(dish.id)}
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))}
          </div>

          {dishes.length === 0 && (
            <div className="empty-state">
              <p>Brak dań w systemie. Dodaj pierwsze danie!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDishes;