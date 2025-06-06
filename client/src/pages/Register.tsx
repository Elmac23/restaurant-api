import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/services/userService';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstname: '', // zamiast name
    lastname: '',
    city: '',
    address: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerUser(form);
      navigate('/');
    } catch (err: any) {
      setError('Rejestracja nie powiodła się.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Rejestracja</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Hasło" value={form.password} onChange={handleChange} required />
        <input name="firstname" placeholder="Imię" value={form.firstname} onChange={handleChange} required />
        <input name="lastname" placeholder="Nazwisko" value={form.lastname} onChange={handleChange} required />
        <input name="city" placeholder="Miasto" value={form.city} onChange={handleChange} required />
        <input name="address" placeholder="Adres" value={form.address} onChange={handleChange} required />
        <input name="phoneNumber" placeholder="Telefon" value={form.phoneNumber} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? 'Rejestruję...' : 'Zarejestruj się'}</button>
        {error && <div className="error">{error}</div>}
      </form>
      <button onClick={() => navigate('/')}>Powrót do logowania</button>
    </div>
  );
};

export default Register;
