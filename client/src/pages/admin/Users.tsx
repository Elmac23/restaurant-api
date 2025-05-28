import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import '../../styles/admin/Users.css';

interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  role: 'admin' | 'manager' | 'worker' | 'customer';
  city: string;
  address: string;
  phoneNumber: string;
}

function AdminUsers() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstname: '',
    lastname: '',
    role: 'customer' as User['role'],
    city: '',
    address: '',
    phoneNumber: '',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Błąd pobierania użytkowników:', error);
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
      let userData = { ...formData };
      
      // Usuń hasło z danych jeśli edytujemy i pole jest puste
      if (editingUser && !userData.password) {
        const { password, ...userDataWithoutPassword } = userData;
        userData = userDataWithoutPassword as typeof userData;
      }

      if (editingUser) {
        await apiClient.put(`/users/${editingUser.id}`, userData);
      } else {
        await apiClient.post('/users', userData);
      }

      await fetchUsers();
      resetForm();
    } catch (error) {
      console.error('Błąd zapisywania użytkownika:', error);
    }
  };

  const handleEdit = (editUser: User) => {
    setEditingUser(editUser);
    setFormData({
      email: editUser.email,
      firstname: editUser.firstname,
      lastname: editUser.lastname,
      role: editUser.role,
      city: editUser.city,
      address: editUser.address,
      phoneNumber: editUser.phoneNumber,
      password: ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (id === user?.id) {
      alert('Nie możesz usunąć własnego konta!');
      return;
    }
    
    if (window.confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
      try {
        await apiClient.delete(`/users/${id}`);
        await fetchUsers();
      } catch (error) {
        console.error('Błąd usuwania użytkownika:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      firstname: '',
      lastname: '',
      role: 'customer',
      city: '',
      address: '',
      phoneNumber: '',
      password: ''
    });
    setEditingUser(null);
    setShowAddForm(false);
  };

  const getRoleLabel = (role: string) => {
    const roleLabels = {
      admin: 'Administrator',
      manager: 'Manager',
      worker: 'Pracownik',
      customer: 'Klient'
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  if (loading) {
    return <div className="loading">Ładowanie użytkowników...</div>;
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
            <h1>Zarządzanie Użytkownikami</h1>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Anuluj' : 'Dodaj użytkownika'}
            </button>
          </div>

          {showAddForm && (
            <div className="form-container">
              <h2>{editingUser ? 'Edytuj użytkownika' : 'Dodaj nowego użytkownika'}</h2>
              <form onSubmit={handleSubmit} className="user-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="role">Rola:</label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as User['role']})}
                      required
                    >
                      <option value="customer">Klient</option>
                      <option value="worker">Pracownik</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstname">Imię:</label>
                    <input
                      type="text"
                      id="firstname"
                      value={formData.firstname}
                      onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastname">Nazwisko:</label>
                    <input
                      type="text"
                      id="lastname"
                      value={formData.lastname}
                      onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">Miasto:</label>
                    <input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phoneNumber">Telefon:</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="address">Adres:</label>
                  <input
                    type="text"
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">
                    {editingUser ? 'Nowe hasło (pozostaw puste aby nie zmieniać):' : 'Hasło:'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required={!editingUser}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingUser ? 'Zaktualizuj' : 'Dodaj'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Anuluj
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Imię i Nazwisko</th>
                  <th>Rola</th>
                  <th>Miasto</th>
                  <th>Telefon</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {users.map((tableUser) => (
                  <tr key={tableUser.id}>
                    <td>{tableUser.email}</td>
                    <td>{tableUser.firstname} {tableUser.lastname}</td>
                    <td>
                      <span className={`role-badge ${tableUser.role}`}>
                        {getRoleLabel(tableUser.role)}
                      </span>
                    </td>
                    <td>{tableUser.city}</td>
                    <td>{tableUser.phoneNumber}</td>
                    <td className="actions">
                      <button 
                        className="btn btn-edit"
                        onClick={() => handleEdit(tableUser)}
                      >
                        Edytuj
                      </button>
                      {tableUser.id !== user?.id && (
                        <button 
                          className="btn btn-delete"
                          onClick={() => handleDelete(tableUser.id)}
                        >
                          Usuń
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="empty-state">
              <p>Brak użytkowników w systemie.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminUsers;