import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import apiClient from '../api/client';

export type UserRole = 'klient' | 'worker' | 'manager' | 'admin';

export interface User {
  id: string;
  email: string;
  firstname?: string;
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
  sessionError: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionError, setSessionError] = useState('');
  // Używamy number zamiast NodeJS.Timeout w przeglądarce
  const logoutTimer = useRef<number | null>(null);

  // Funkcja do ustawiania automatycznego wylogowania po wygaśnięciu tokena
  const scheduleAutoLogout = (exp?: number) => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (!exp) return;
    const now = Date.now() / 1000;
    const ms = Math.max((exp - now) * 1000, 0);
    if (ms > 0) {
      logoutTimer.current = window.setTimeout(() => {
        setSessionError('Twoja sesja wygasła. Zaloguj się ponownie.');
        logout();
      }, ms);
    }
  };

  useEffect(() => {
    // Sprawdź token przy ładowaniu strony
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenData: any = jwtDecode(token);
        // Sprawdź czy token nie wygasł
        if (tokenData.exp && tokenData.exp * 1000 > Date.now()) {
          setUser(tokenData);
          scheduleAutoLogout(tokenData.exp);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    // eslint-disable-next-line
  }, []);

  // Czyść timer przy unmount
  useEffect(() => {
    return () => {
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setSessionError('');
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      const tokenData: any = jwtDecode(access_token);
      setUser(tokenData);
      scheduleAutoLogout(tokenData.exp);
    } catch (error) {
      throw new Error('Błąd logowania');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
  };

  const checkRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roles: UserRole[] = ['klient', 'worker', 'manager', 'admin'];
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
        checkRole,
        sessionError
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