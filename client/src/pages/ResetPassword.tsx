import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/Login.css';
import { resetPasswordRequest, resetPassword } from '../api/services/userService';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const isResettingPassword = !!token;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await resetPasswordRequest(email);
      setMessage('Jeśli podany email istnieje, wysłaliśmy link do resetu hasła.');
    } catch (err) {
      setError('Wystąpił błąd. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne');
      return;
    }
    
    if (password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await resetPassword(token!, password);
      setMessage('Hasło zostało pomyślnie zmienione. Możesz się teraz zalogować.');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError('Wystąpił błąd lub token wygasł. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  if (isResettingPassword) {
    return (
      <div className="login-page">
        <div className="login-container">
          <h1>Ustaw nowe hasło</h1>
          <p className="login-subtitle">Wprowadź nowe hasło dla swojego konta</p>
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handlePasswordSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="password">Nowe hasło</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Potwierdź hasło</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Ustawianie hasła...' : 'Ustaw nowe hasło'}
            </button>
          </form>
          <div className="back-link">
            <a href="/">Powrót do logowania</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Resetowanie hasła</h1>
        <p className="login-subtitle">Podaj swój email, aby zresetować hasło</p>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleEmailSubmit} className="login-form">
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
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Wysyłanie...' : 'Wyślij link resetujący'}
          </button>
        </form>
        <div className="back-link">
          <a href="/">Powrót do logowania</a>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
