import React, { createContext, useContext, useState, useEffect } from 'react';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('partnexa_user') || localStorage.getItem('partnexa_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(
    () => localStorage.getItem('partnexa_access_token') || localStorage.getItem('partnexa_admin_token') || null
  );
  const [loading, setLoading] = useState(false);

  // Theme Management (Light / Dark)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('partnexa_theme') || localStorage.getItem('partnexa_admin_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('partnexa_theme', theme);
    const handleThemeChange = (e) => {
      if (e.detail) setTheme(e.detail);
    };
    window.addEventListener('theme:change', handleThemeChange);
    return () => window.removeEventListener('theme:change', handleThemeChange);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    window.dispatchEvent(new CustomEvent('theme:change', { detail: next }));
  };

  // Synchronize with global auth events
  useEffect(() => {
    const handleAuthLogin = () => {
      const savedToken = localStorage.getItem('partnexa_access_token') || localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('partnexa_user') || localStorage.getItem('user');
      if (savedToken) setToken(savedToken);
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.role === 'ADMIN' || parsed.role === 'SUPER_ADMIN') {
            setUser(parsed);
          }
        } catch {}
      }
    };
    const handleAuthLogout = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth:login', handleAuthLogin);
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth:login', handleAuthLogin);
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await adminService.login(email, password);
      const { user: authUser, token: authToken, refreshToken: authRefresh } = res;

      if (authUser.role !== 'ADMIN' && authUser.role !== 'SUPER_ADMIN') {
        throw new Error('Access Denied: Only administrators can access the Admin Console.');
      }

      setUser(authUser);
      setToken(authToken);

      localStorage.setItem('partnexa_access_token', authToken);
      localStorage.setItem('partnexa_user', JSON.stringify(authUser));
      if (authRefresh) localStorage.setItem('partnexa_refresh_token', authRefresh);

      // Legacy sync
      localStorage.setItem('partnexa_admin_token', authToken);
      localStorage.setItem('partnexa_admin_user', JSON.stringify(authUser));

      toast.success(`Welcome back, ${authUser.firstName || 'Administrator'}!`);
      return authUser;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Invalid credentials.';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('partnexa_access_token');
    localStorage.removeItem('partnexa_refresh_token');
    localStorage.removeItem('partnexa_user');
    localStorage.removeItem('partnexa_admin_token');
    localStorage.removeItem('partnexa_admin_user');
    localStorage.removeItem('partnexa_admin_refresh');
    window.dispatchEvent(new Event('auth:logout'));
    toast.success('Signed out from Admin Console.');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        accessToken: token,
        isAuthenticated: !!token && !!user,
        loading,
        theme,
        toggleTheme,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;
