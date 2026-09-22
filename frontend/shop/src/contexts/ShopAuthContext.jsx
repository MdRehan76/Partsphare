import React, { createContext, useContext, useState, useEffect } from 'react';
import shopService from '../services/shopService';

const ShopAuthContext = createContext(null);

export const ShopAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shop_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [shop, setShop] = useState(() => {
    const saved = localStorage.getItem('shop_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('shop_token') || null);
  const [theme, setTheme] = useState(() => localStorage.getItem('shop_theme') || 'light');
  const [loading, setLoading] = useState(true);

  // Initialize theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('shop_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Verify and refresh profile on mount if token exists
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const profile = await shopService.getProfile();
          if (profile.data) {
            setShop(profile.data);
            localStorage.setItem('shop_data', JSON.stringify(profile.data));
            if (profile.data.owner) {
              setUser(profile.data.owner);
              localStorage.setItem('shop_user', JSON.stringify(profile.data.owner));
            }
          }
        } catch (err) {
          console.warn('Session verification failed, logging out.', err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (credentials) => {
    const res = await shopService.login(credentials);
    const { user: userData, shop: shopData, token: authToken } = res.data;
    setUser(userData);
    setShop(shopData);
    setToken(authToken);
    localStorage.setItem('shop_user', JSON.stringify(userData));
    localStorage.setItem('shop_data', JSON.stringify(shopData));
    localStorage.setItem('shop_token', authToken);
    return res;
  };

  const register = async (data) => {
    const res = await shopService.register(data);
    const { user: userData, shop: shopData, token: authToken } = res.data;
    setUser(userData);
    setShop(shopData);
    setToken(authToken);
    localStorage.setItem('shop_user', JSON.stringify(userData));
    localStorage.setItem('shop_data', JSON.stringify(shopData));
    localStorage.setItem('shop_token', authToken);
    return res;
  };

  const logout = () => {
    setUser(null);
    setShop(null);
    setToken(null);
    localStorage.removeItem('shop_user');
    localStorage.removeItem('shop_data');
    localStorage.removeItem('shop_token');
  };

  const refreshProfile = async () => {
    try {
      const res = await shopService.getProfile();
      if (res.data) {
        setShop(res.data);
        localStorage.setItem('shop_data', JSON.stringify(res.data));
      }
    } catch (e) {
      console.error('Failed to refresh profile', e);
    }
  };

  return (
    <ShopAuthContext.Provider
      value={{
        user,
        shop,
        token,
        isAuthenticated: !!token,
        loading,
        theme,
        toggleTheme,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </ShopAuthContext.Provider>
  );
};

export const useShopAuth = () => {
  const context = useContext(ShopAuthContext);
  if (!context) {
    throw new Error('useShopAuth must be used within a ShopAuthProvider');
  }
  return context;
};
