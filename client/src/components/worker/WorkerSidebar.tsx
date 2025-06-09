import { NavLink } from 'react-router-dom';

function WorkerSidebar() {
  return (
    <aside className="worker-sidebar">
      <nav>
        <ul>
          <li>
            <NavLink 
              to="/worker/dashboard" 
              end 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/worker/orders" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Zamówienia
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/home" 
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

export default WorkerSidebar;