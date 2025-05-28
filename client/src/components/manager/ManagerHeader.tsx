import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ManagerHeaderProps {
  title?: string;
}

function ManagerHeader({ title = "RestaurantSystem Manager" }: ManagerHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="manager-header">
      <div className="header-logo">{title}</div>
      <div className="user-section">
        <span className="user-email">{user?.email}</span>
        <button className="logout-button" onClick={handleLogout}>Wyloguj</button>
      </div>
    </header>
  );
}

export default ManagerHeader;