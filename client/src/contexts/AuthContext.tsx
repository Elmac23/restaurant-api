import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiClient from '../api/client';

export type UserRole = 'user' | 'worker' | 'manager' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  lastname?: string;
  role: UserRole;
  restaurantId?: string;
  city: string;
  address: string;
  phoneNumber: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkRole: (requiredRole: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Sprawdź token przy ładowaniu strony
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenData = jwtDecode<User>(token);
        setUser(tokenData);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email, password: '***' });
      const response = await apiClient.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      
      const tokenData = jwtDecode<User>(access_token);
      console.log('Decoded token:', tokenData);
      setUser(tokenData);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Błąd logowania');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const checkRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    const roles: UserRole[] = ['user', 'worker', 'manager', 'admin'];
    const userRoleIndex = roles.indexOf(user.role);
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.some(role => {
        const requiredRoleIndex = roles.indexOf(role);
        return userRoleIndex >= requiredRoleIndex;
      });
    } else {
      const requiredRoleIndex = roles.indexOf(requiredRole);
      return userRoleIndex >= requiredRoleIndex;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        checkRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};