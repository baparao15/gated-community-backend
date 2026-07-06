import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/endpoints';
import { setTokens, clearTokens } from '../api/client';

const AuthContext = createContext(null);

const isExpiredJwt = (token) => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return false;
    const { exp } = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return exp ? exp * 1000 <= Date.now() : false;
  } catch {
    return false;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    if (isExpiredJwt(token)) {
      clearTokens();
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.me();
      setUser(res.data);
    } catch (err) {
      // Only treat this as "logged out" for an actual auth rejection (401).
      // Transient errors (rate limiting, network blips, 5xx) shouldn't wipe the session.
      if (err.response?.status === 401) {
        clearTokens();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    setTokens(res.data);
    setUser(res.data.user);
    await loadMe();
    return res.data.user;
  };

  const register = async (payload) => authApi.register(payload);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, refresh: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
