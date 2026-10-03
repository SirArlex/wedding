import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [weddingId, setWeddingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if already logged in on mount
  useEffect(() => {
    authApi
      .me()
      .then((res) => {
        setAdmin(res.admin);
        setWeddingId(res.admin.weddingId);
      })
      .catch(() => {
        setAdmin(null);
        setWeddingId(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    setAdmin(res.admin);
    setWeddingId(res.admin.weddingId);
    return res;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setAdmin(null);
    setWeddingId(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, weddingId, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
