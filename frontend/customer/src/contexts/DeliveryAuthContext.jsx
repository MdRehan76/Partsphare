import React, { createContext, useContext, useState, useEffect } from 'react';
import deliveryService from '../services/deliveryService';
import toast from 'react-hot-toast';

const DeliveryAuthContext = createContext(null);

export const DeliveryAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('partnexa_user') || localStorage.getItem('partsphere_delivery_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [partner, setPartner] = useState(() => {
    const saved = localStorage.getItem('partsphere_delivery_partner');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(
    () => localStorage.getItem('partnexa_access_token') || localStorage.getItem('partsphere_delivery_token') || null
  );

  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme support (Light / Dark mode)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('partnexa_theme') || localStorage.getItem('partsphere_theme') || 'light';
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
      const savedToken = localStorage.getItem('partnexa_access_token') || localStorage.getItem('partsphere_delivery_token');
      const savedUser = localStorage.getItem('partnexa_user') || localStorage.getItem('partsphere_delivery_user');
      const savedPartner = localStorage.getItem('partsphere_delivery_partner');
      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          try { setUser(JSON.parse(savedUser)); } catch {}
        }
        if (savedPartner) {
          try { setPartner(JSON.parse(savedPartner)); } catch {}
        }
      }
    };
    const handleAuthLogout = () => {
      setUser(null);
      setPartner(null);
      setKyc(null);
      setToken(null);
    };
    window.addEventListener('auth:login', handleAuthLogin);
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth:login', handleAuthLogin);
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  // Restore session
  useEffect(() => {
    const activeToken = localStorage.getItem('partnexa_access_token') || localStorage.getItem('partsphere_delivery_token');
    if (activeToken) {
      setToken(activeToken);
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
          localStorage.setItem('partnexa_user', JSON.stringify(profile.user));
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
      const { user: u, partner: p, kyc: k, token: tok, accessToken, refreshToken } = res.data;
      const finalToken = accessToken || tok;
      setToken(finalToken);
      localStorage.setItem('partnexa_access_token', finalToken);
      if (refreshToken) localStorage.setItem('partnexa_refresh_token', refreshToken);
      localStorage.setItem('partnexa_user', JSON.stringify(u));
      localStorage.setItem('partsphere_delivery_token', finalToken);
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
      const { user: u, partner: p, kyc: k, token: tok, accessToken, refreshToken } = res.data;
      const finalToken = accessToken || tok;
      setToken(finalToken);
      localStorage.setItem('partnexa_access_token', finalToken);
      if (refreshToken) localStorage.setItem('partnexa_refresh_token', refreshToken);
      localStorage.setItem('partnexa_user', JSON.stringify(u));
      localStorage.setItem('partsphere_delivery_token', finalToken);
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
    localStorage.removeItem('partnexa_access_token');
    localStorage.removeItem('partnexa_refresh_token');
    localStorage.removeItem('partnexa_user');
    localStorage.removeItem('partsphere_delivery_token');
    localStorage.removeItem('partsphere_delivery_user');
    localStorage.removeItem('partsphere_delivery_partner');
    setUser(null);
    setPartner(null);
    setKyc(null);
    setToken(null);
    window.dispatchEvent(new Event('auth:logout'));
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
        token,
        accessToken: token,
        isAuthenticated: !!token,
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
