import React, { createContext, useContext, useState, useEffect } from 'react';
import deliveryService from '../services/deliveryService';
import toast from 'react-hot-toast';

const DeliveryAuthContext = createContext(null);

export const DeliveryAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('partsphere_delivery_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [partner, setPartner] = useState(() => {
    const saved = localStorage.getItem('partsphere_delivery_partner');
    return saved ? JSON.parse(saved) : null;
  });

  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme support (Light / Dark mode)
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('partsphere_theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('partsphere_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Restore session
  useEffect(() => {
    const token = localStorage.getItem('partsphere_delivery_token');
    if (token) {
      refreshProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const refreshProfile = async () => {
    try {
      setLoading(true);
      const profile = await deliveryService.getProfile();
      if (profile) {
        setPartner(profile);
        setUser(profile.user || null);
        setKyc(profile.kyc || null);
        localStorage.setItem('partsphere_delivery_partner', JSON.stringify(profile));
        if (profile.user) {
          localStorage.setItem('partsphere_delivery_user', JSON.stringify(profile.user));
        }
      }
    } catch (err) {
      console.warn('Could not refresh delivery profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await deliveryService.login({ email, password });
    if (res.data) {
      const { user: u, partner: p, kyc: k, token } = res.data;
      localStorage.setItem('partsphere_delivery_token', token);
      localStorage.setItem('partsphere_delivery_user', JSON.stringify(u));
      localStorage.setItem('partsphere_delivery_partner', JSON.stringify(p));
      setUser(u);
      setPartner(p);
      setKyc(k);
      toast.success(`Welcome back, ${u.firstName}!`);
      return res.data;
    }
  };

  const register = async (data) => {
    const res = await deliveryService.register(data);
    if (res.data) {
      const { user: u, partner: p, kyc: k, token } = res.data;
      localStorage.setItem('partsphere_delivery_token', token);
      localStorage.setItem('partsphere_delivery_user', JSON.stringify(u));
      localStorage.setItem('partsphere_delivery_partner', JSON.stringify(p));
      setUser(u);
      setPartner(p);
      setKyc(k);
      toast.success('Registration successful! Please upload your KYC documents.');
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('partsphere_delivery_token');
    localStorage.removeItem('partsphere_delivery_user');
    localStorage.removeItem('partsphere_delivery_partner');
    setUser(null);
    setPartner(null);
    setKyc(null);
    toast.success('Logged out successfully.');
  };

  const toggleDuty = async (isOnline) => {
    try {
      const updated = await deliveryService.toggleDuty(isOnline);
      setPartner((prev) => ({ ...prev, ...updated }));
      toast.success(isOnline ? 'You are now ONLINE. Looking for orders!' : 'You are now OFFLINE.');
      return updated;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not toggle duty status.');
      throw err;
    }
  };

  return (
    <DeliveryAuthContext.Provider
      value={{
        user,
        partner,
        kyc,
        loading,
        theme,
        toggleTheme,
        login,
        register,
        logout,
        refreshProfile,
        toggleDuty,
      }}
    >
      {children}
    </DeliveryAuthContext.Provider>
  );
};

export const useDeliveryAuth = () => {
  const context = useContext(DeliveryAuthContext);
  if (!context) {
    throw new Error('useDeliveryAuth must be used within DeliveryAuthProvider');
  }
  return context;
};

export default DeliveryAuthContext;
