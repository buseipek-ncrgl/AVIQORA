'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthResponseDto, LoginRequestDto, RegisterRequestDto } from '@/types/api';
import { api } from '@/lib/api';

interface User {
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequestDto) => Promise<void>;
  register: (data: RegisterRequestDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on mount
    const savedToken = localStorage.getItem('aviqora_token');
    const savedUser = localStorage.getItem('aviqora_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('aviqora_token');
        localStorage.removeItem('aviqora_user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (res: AuthResponseDto) => {
    const userData = { email: res.email, fullName: res.fullName, role: res.role };
    setToken(res.token);
    setUser(userData);
    localStorage.setItem('aviqora_token', res.token);
    localStorage.setItem('aviqora_user', JSON.stringify(userData));
  };

  const login = async (data: LoginRequestDto) => {
    const res = await api.auth.login(data);
    handleAuthSuccess(res);
  };

  const register = async (data: RegisterRequestDto) => {
    const res = await api.auth.register(data);
    handleAuthSuccess(res);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('aviqora_token');
    localStorage.removeItem('aviqora_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
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
