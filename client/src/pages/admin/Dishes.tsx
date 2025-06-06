import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import { getDishesFiltered } from '../../api/services/dishService';
import { getCategories, type Category } from '../../api/services/categoryService';
import '../../styles/admin/Dishes.css';

interface Dish {
  id: string;
  name: string;
  description: string;
  price: string | number;
  kcal: string | number;
  categoryId?: string;
  available?: boolean;
  filePath?: string;
}

function AdminDishes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
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
    fetchDishes();
    fetchCategories();
  // eslint-disable-next-line
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories('dish');
      setCategories(data);
    } catch (error) {
      console.error('Błąd pobierania kategorii:', error);
    }
  };

  const fetchDishes = async (filterParams = filters) => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterParams.name) params.name = filterParams.name;
      if (filterParams.category) params.categoryId = filterParams.category;
      
      const data = await getDishesFiltered(params);
      setDishes(data);
    } catch (error: any) {
      console.error('Błąd pobierania dań:', error);
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

      if (editingDish) {
        await apiClient.patch(`/dishes/${editingDish.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await apiClient.post('/dishes', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      await fetchDishes();
      resetForm();
    } catch (error: any) {
      console.error('Błąd zapisywania dania:', error);
      alert('Błąd podczas zapisywania dania: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description,
      price: String(dish.price),
      kcal: dish.kcal ? String(dish.kcal) : '',
      categoryId: dish.categoryId || ''
    });
    setImagePreview(dish.filePath || null);
    setSelectedImage(null);
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
      kcal: '',
      categoryId: ''
    });
    setEditingDish(null);
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
    fetchDishes();
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
              <li><NavLink to="/home" className={({ isActive }) => isActive ? 'active' : ''}>Strona główna</NavLink></li>
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

          <div className="filter-bar">
            <form onSubmit={handleFilterSubmit} className="filter-form">
              <input
                type="text"
                name="name"
                placeholder="Nazwa dania"
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
                  <label htmlFor="kcal">Kalorie (kcal):</label>
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
            {dishes.map((dish) => {
              const dishCategory = categories.find(cat => cat.id === dish.categoryId);
              return (
                <div key={dish.id} className="dish-card">
                  {dish.filePath && (
                    <div className="dish-image">
                      <img src={dish.filePath} alt={dish.name} style={{width: '100%', height: '150px', objectFit: 'cover'}} />
                    </div>
                  )}
                  <div className="dish-header">
                    <h3>{dish.name}</h3>
                  </div>
                  <p className="dish-description">{dish.description}</p>
                  <div className="dish-details">
                    <span className="dish-category">{dishCategory?.name || 'Brak kategorii'}</span>
                    <span className="dish-price">{Number(dish.price).toFixed(2)} zł</span>
                    {dish.kcal && <span className="dish-kcal">{dish.kcal} kcal</span>}
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
              );
            })}
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