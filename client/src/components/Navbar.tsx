import '../styles/Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <div className="logo">RestaurantSystem</div>
      <div className="nav-links">
        <Link to="/home" className="nav-link">Strona główna</Link>
        <Link to="/orders" className="nav-link">Moje zamówienia</Link>
        <Link to="/contact" className="nav-link">Kontakt</Link>
        {isAuthenticated && (
          <>
            <Link to="/profile" className="nav-link">Mój profil</Link>
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="nav-link admin-panel">Panel administracyjny</Link>
            )}
            <button
              className="nav-link logout-btn"
              onClick={() => {
                logout();
                navigate('/');
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
            >
              Wyloguj się
            </button>
          </>
        )}
        {!isAuthenticated && <Link to="/" className="login-btn">Zaloguj się</Link>}
      </div>
    </nav>
  );
}

export default Navbar;