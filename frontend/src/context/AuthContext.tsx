import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance, { setAccessToken } from '../api/axiosInstance';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  avatar?: string;
}

export interface LoginCredentials {
  email?: string;
  password?: string;
  [key: string]: string | undefined;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to sync access token to memory and axios instance
  const syncAccessToken = (token: string | null) => {
    setAccessTokenState(token);
    setAccessToken(token);
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const { data } = await axiosInstance.post('/api/auth/login', credentials);
      syncAccessToken(data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // Fetch user profile immediately after login
      await fetchUser();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API failed, continuing with local cleanup:', error);
    } finally {
      syncAccessToken(null);
      setUser(null);
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  };

  const attemptSilentRefresh = async () => {
    const token = localStorage.getItem('refreshToken');
    if (!token) {
      syncAccessToken(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await axiosInstance.post('/api/auth/refresh', {
        refreshToken: token,
      });
      syncAccessToken(data.accessToken);
      await fetchUser();
    } catch (error) {
      console.error('Token refresh failed:', error);
      syncAccessToken(null);
      setUser(null);
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const { data } = await axiosInstance.get('/api/auth/me');
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Attempt silent refresh on app mount
        await attemptSilentRefresh();
      } catch (error) {
        console.error("Auth initialization silently crashed:", error);
        setIsLoading(false);
      }
    };
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        logout,
        refreshToken: attemptSilentRefresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
