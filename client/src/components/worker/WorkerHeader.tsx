import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface WorkerHeaderProps {
  title?: string;
}

function WorkerHeader({ title = "RestaurantSystem Worker" }: WorkerHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="worker-header">
      <div className="header-logo">{title}</div>
      <div className="user-section">
        <span className="user-email">{user?.email}</span>
        <button className="logout-button" onClick={handleLogout}>Wyloguj</button>
      </div>
    </header>
  );
}

export default WorkerHeader;