import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import { getCategories, type Category } from '../../api/services/categoryService';
import '../../styles/admin/Drinks.css';

interface Drink {
  id: string;
  name: string;
  description: string;
  price: string;
  kcal: string;
  categoryId?: string;
  filePath?: string;
}

function AdminDrinks() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    kcal: '',
    categoryId: ''
  });
  const [filters, setFilters] = useState({ name: '', category: '' });

  useEffect(() => {
    fetchDrinks();
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories('drink');
      setCategories(data);
    } catch (error) {
      console.error('Błąd pobierania kategorii:', error);
    }
  };

  const fetchDrinks = async (filterParams = filters) => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterParams.name) params.name = filterParams.name;
      if (filterParams.category) params.categoryId = filterParams.category;
      
      const queryString = Object.keys(params).length > 0 
        ? '?' + new URLSearchParams(params).toString() 
        : '';
      
      const response = await apiClient.get(`/drinks${queryString}`);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', String(formData.price));
      formDataToSend.append('kcal', formData.kcal ? String(Math.max(0, Number(formData.kcal))) : "0");
      formDataToSend.append('categoryId', formData.categoryId);

      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      if (editingDrink) {
        await apiClient.patch(`/drinks/${editingDrink.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await apiClient.post('/drinks', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      await fetchDrinks();
      resetForm();
    } catch (error: any) {
      console.error('Błąd zapisywania napoju:', error);
      alert('Błąd podczas zapisywania napoju: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (drink: Drink) => {
    setEditingDrink(drink);
    setFormData({
      name: drink.name,
      description: drink.description,
      price: drink.price,
      kcal: drink.kcal,
      categoryId: drink.categoryId || ''
    });
    setImagePreview(drink.filePath || null);
    setSelectedImage(null);
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
      kcal: '',
      categoryId: ''
    });
    setEditingDrink(null);
    setSelectedImage(null);
    setImagePreview(null);
    setShowAddForm(false);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDrinks();
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
              <li><NavLink to="/home" className={({ isActive }) => isActive ? 'active' : ''}>Strona główna</NavLink></li>
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

          <div className="filter-bar">
            <form onSubmit={handleFilterSubmit} className="filter-form">
              <input
                type="text"
                name="name"
                placeholder="Nazwa napoju"
                value={filters.name}
                onChange={handleFilterChange}
              />
              <select name="category" value={filters.category} onChange={handleFilterChange}>
                <option value="">Wszystkie kategorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <button type="submit" className="btn btn-secondary">Filtruj</button>
            </form>
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
                  <label htmlFor="kcal">Kalorie:</label>
                  <input
                    type="number"
                    id="kcal"
                    value={formData.kcal}
                    onChange={(e) => setFormData({...formData, kcal: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="categoryId">Kategoria:</label>
                  <select
                    id="categoryId"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    required
                  >
                    <option value="">Wybierz kategorię</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="image">Zdjęcie:</label>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Podgląd" style={{maxWidth: '200px', marginTop: '10px'}} />
                    </div>
                  )}
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
            {drinks.map((drink) => {
              const drinkCategory = categories.find(cat => cat.id === drink.categoryId);
              return (
                <div key={drink.id} className="drink-card">
                  {drink.filePath && (
                    <div className="drink-image">
                      <img src={drink.filePath} alt={drink.name} style={{width: '100%', height: '150px', objectFit: 'cover'}} />
                    </div>
                  )}
                  <div className="drink-header">
                    <h3>{drink.name}</h3>
                  </div>
                  <p className="drink-description">{drink.description}</p>
                  <div className="drink-details">
                    <span className="drink-category">{drinkCategory?.name || 'Brak kategorii'}</span>
                    <span className="drink-kcal">{drink.kcal} kcal</span>
                    <span className="drink-price">{parseFloat(drink.price).toFixed(2)} zł</span>
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
              );
            })}
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