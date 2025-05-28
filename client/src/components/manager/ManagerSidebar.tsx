import { NavLink } from 'react-router-dom';

function ManagerSidebar() {
  return (
    <aside className="manager-sidebar">
      <nav>
        <ul>
          <li>
            <NavLink 
              to="/manager/dashboard" 
              end 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/manager/orders" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Zamówienia
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/manager/reports" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Raporty
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/manager/staff" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Personel
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Strona główna
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default ManagerSidebar;