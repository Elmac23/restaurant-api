import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      // Przekieruj na odpowiedni panel na podstawie roli
      const token = localStorage.getItem('token');
      if (token) {
        // Dekoduj token aby sprawdzić rolę
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        
        if (payload.role === 'admin') {
          navigate('/home');
        } else if (payload.role === 'manager') {
          navigate('/manager/dashboard');
        } else if (payload.role === 'worker') {
          navigate('/worker');
        } else {
          navigate('/home');
        }
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError('Nieprawidłowy email lub hasło');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Panel logowania</h1>
        <p className="login-subtitle">Zaloguj się, aby przejść na główną stronę</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Hasło</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>
        
        <div className="back-link">
          <a href="/register">Nie masz konta? Zarejestruj się</a>
        </div>
        <div className="back-link">
          <a href="/reset-password">Zapomniałeś hasła? Zresetuj hasło</a>
        </div>
      </div>
    </div>
  );
}

export default Login;