import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../api/services/userService';
import Navbar from '../components/Navbar';
import '../styles/Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    email: '',
    firstname: '',
    lastname: '',
    city: '',
    address: '',
    phoneNumber: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      getUserProfile(user.id).then(data => setForm({ ...form, ...data, password: '' }));
    }
    // eslint-disable-next-line
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!user?.id) return;
    try {
      await updateUserProfile(user.id, form);
      setMessage('Dane zostały zaktualizowane.');
    } catch {
      setError('Błąd podczas aktualizacji.');
    }
  };

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <h1>Mój Profil</h1>
            <p>Zarządzaj swoimi danymi osobowymi</p>
          </div>
          
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstname">Imię</label>
                <input 
                  id="firstname"
                  name="firstname" 
                  placeholder="Imię" 
                  value={form.firstname} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastname">Nazwisko</label>
                <input 
                  id="lastname"
                  name="lastname" 
                  placeholder="Nazwisko" 
                  value={form.lastname} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                id="email"
                name="email" 
                type="email" 
                placeholder="Email" 
                value={form.email} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phoneNumber">Telefon</label>
              <input 
                id="phoneNumber"
                name="phoneNumber" 
                placeholder="Telefon" 
                value={form.phoneNumber} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Miasto</label>
                <input 
                  id="city"
                  name="city" 
                  placeholder="Miasto" 
                  value={form.city} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Adres</label>
                <input 
                  id="address"
                  name="address" 
                  placeholder="Adres" 
                  value={form.address} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Nowe hasło (opcjonalnie)</label>
              <input 
                id="password"
                name="password" 
                type="password" 
                placeholder="Pozostaw puste, aby nie zmieniać hasła" 
                value={form.password} 
                onChange={handleChange} 
              />
            </div>
            
            <button type="submit" className="save-btn">
              Zapisz zmiany
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
