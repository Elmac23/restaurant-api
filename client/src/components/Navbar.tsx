import '../styles/Navbar.css';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">RestaurantSystem</div>
      <div className="nav-links">
        <Link to="/" className="nav-link">Menu</Link>
        <Link to="/orders" className="nav-link">Moje zamówienia</Link>
        <Link to="/contact" className="nav-link">Kontakt</Link>
        <Link to="/login" className="login-btn">Panel administracyjny</Link>
      </div>
    </nav>
  );
}

export default Navbar;