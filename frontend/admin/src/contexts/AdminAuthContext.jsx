import React, { createContext, useContext, useState, useEffect } from 'react';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('partsphere_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('partsphere_admin_token') || null);
  const [loading, setLoading] = useState(false);

  // Theme Management (Light / Dark)
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('partsphere_admin_theme');
    return savedTheme || 'dark'; // default to sleek modern dark mode
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('partsphere_admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await adminService.login(email, password);
      const { user: authUser, token: authToken } = res.data;

      if (authUser.role !== 'ADMIN' && authUser.role !== 'SUPER_ADMIN') {
        throw new Error('Access Denied: Only administrators can access the Admin Console.');
      }

      setUser(authUser);
      setToken(authToken);

      localStorage.setItem('partsphere_admin_token', authToken);
      localStorage.setItem('partsphere_admin_user', JSON.stringify(authUser));

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
    localStorage.removeItem('partsphere_admin_token');
    localStorage.removeItem('partsphere_admin_user');
    toast.success('Signed out from Admin Console.');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
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
