import React, { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'hbg_customer_token';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const persist = (t) => {
    try {
      if (t) localStorage.setItem(STORAGE_KEY, t);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setToken(t);
  };

  const loadMe = useCallback(async (t) => {
    if (!t) {
      setUser(null);
      setReady(true);
      return;
    }
    try {
      const r = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${t}` } });
      if (!r.ok) throw new Error();
      setUser(await r.json());
    } catch {
      persist('');
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  // Load the profile once on first mount if a token was already stored.
  React.useEffect(() => {
    loadMe(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const authRequest = async (path, body) => {
    const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || 'Something went wrong');
    persist(d.token);
    setUser(d.user);
    return d.user;
  };

  const register = (name, email, password) => authRequest('/api/auth/register', { name, email, password });
  const login = (email, password) => authRequest('/api/auth/login', { email, password });
  const logout = () => {
    persist('');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, ready, register, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
