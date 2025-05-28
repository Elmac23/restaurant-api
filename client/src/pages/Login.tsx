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
      
      // Pobierz aktualnego użytkownika z localStorage po zalogowaniu
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { jwtDecode } = await import('jwt-decode');
          const userData = jwtDecode<any>(token);
          
          // Przekierowanie do odpowiedniego panelu na podstawie roli
          switch (userData.role) {
            case 'admin':
              navigate('/admin/dashboard');
              break;
            case 'manager':
              navigate('/manager/dashboard');
              break;
            case 'worker':
              navigate('/worker/dashboard');
              break;
            default:
              navigate('/');
              break;
          }
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          navigate('/');
        }
      } else {
        navigate('/');
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
        <h1>Panel administracyjny</h1>
        <p className="login-subtitle">Zaloguj się, aby zarządzać restauracją</p>
        
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
          <a href="/">Powrót do strony głównej</a>
        </div>
      </div>
    </div>
  );
}

export default Login;