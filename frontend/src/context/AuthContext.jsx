import { createContext, useContext, useEffect, useState } from 'react';
import { adminApi } from '../api/client';

const AuthContext = createContext(null);
const TOKEN_KEY = 'sotuv_admin_token';

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    adminApi
      .get('/auth/me')
      .then((res) => setAdmin(res.data.admin))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = async (phone, password) => {
    const res = await adminApi.post('/auth/login', { phone, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setAdmin(res.data.admin);
    return res.data.admin;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  };

  return <AuthContext.Provider value={{ admin, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProvider ichida ishlatilishi kerak');
  return ctx;
}
