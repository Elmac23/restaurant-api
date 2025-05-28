import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, type UserRole } from './contexts/AuthContext';
import type { ReactElement } from 'react';

// Strony publiczne
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Panele administratora
import AdminDashboard from './pages/admin/Dashboard';
import AdminDishes from './pages/admin/Dishes';
import AdminDrinks from './pages/admin/Drinks';
import AdminUsers from './pages/admin/Users';
import AdminOrders from './pages/admin/Orders';

// Panel managera
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerOrders from './pages/manager/Orders';
import ManagerReports from './pages/manager/Reports';
import ManagerStaff from './pages/manager/Staff';

// Panel pracownika
import WorkerDashboard from './pages/worker/Dashboard';
import WorkerOrders from './pages/worker/Orders';

// Komponent dla zabezpieczenia ścieżek
const RoleRoute = ({ 
  children, 
  requiredRole 
}: { 
  children: ReactElement, 
  requiredRole: UserRole | UserRole[]
}) => {
  const { isAuthenticated, checkRole } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!checkRole(requiredRole)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Główny komponent tras
const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  // Komponent do przekierowania do odpowiedniego dashboardu
  const DashboardRedirect = () => {
    if (!user) return <Navigate to="/login" />;
    
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      case 'manager':
        return <Navigate to="/manager/dashboard" />;
      case 'worker':
        return <Navigate to="/worker/dashboard" />;
      default:
        return <Navigate to="/" />;
    }
  };

  return (
    <Routes>
      {/* Strony publiczne */}
      <Route path="/" element={<Home />} />
      <Route 
        path="/login" 
        element={isAuthenticated ? <DashboardRedirect /> : <Login />} 
      />

      {/* Przekierowanie do odpowiedniego dashboardu */}
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* Panel administratora */}
      <Route 
        path="/admin/dashboard" 
        element={
          <RoleRoute requiredRole="admin">
            <AdminDashboard />
          </RoleRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <RoleRoute requiredRole="admin">
            <AdminDashboard />
          </RoleRoute>
        } 
      />
      <Route 
        path="/admin/dishes" 
        element={
          <RoleRoute requiredRole="admin">
            <AdminDishes />
          </RoleRoute>
        } 
      />
      <Route 
        path="/admin/drinks" 
        element={
          <RoleRoute requiredRole="admin">
            <AdminDrinks />
          </RoleRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <RoleRoute requiredRole="admin">
            <AdminUsers />
          </RoleRoute>
        } 
      />
      <Route 
        path="/admin/orders" 
        element={
          <RoleRoute requiredRole="admin">
            <AdminOrders />
          </RoleRoute>
        } 
      />

      {/* Panel managera */}
      <Route 
        path="/manager/dashboard" 
        element={
          <RoleRoute requiredRole="manager">
            <ManagerDashboard />
          </RoleRoute>
        } 
      />
      <Route 
        path="/manager" 
        element={
          <RoleRoute requiredRole="manager">
            <ManagerDashboard />
          </RoleRoute>
        } 
      />
      <Route 
        path="/manager/orders" 
        element={
          <RoleRoute requiredRole="manager">
            <ManagerOrders />
          </RoleRoute>
        } 
      />
      <Route 
        path="/manager/reports" 
        element={
          <RoleRoute requiredRole="manager">
            <ManagerReports />
          </RoleRoute>
        } 
      />
      <Route 
        path="/manager/staff" 
        element={
          <RoleRoute requiredRole="manager">
            <ManagerStaff />
          </RoleRoute>
        } 
      />

      {/* Panel pracownika */}
      <Route 
        path="/worker/dashboard" 
        element={
          <RoleRoute requiredRole="worker">
            <WorkerDashboard />
          </RoleRoute>
        } 
      />
      <Route 
        path="/worker" 
        element={
          <RoleRoute requiredRole="worker">
            <WorkerDashboard />
          </RoleRoute>
        } 
      />
      <Route 
        path="/worker/orders" 
        element={
          <RoleRoute requiredRole="worker">
            <WorkerOrders />
          </RoleRoute>
        } 
      />

      {/* 404 - strona nie znaleziona */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;