import React, { createContext, useContext, useState, useEffect } from 'react';
import shopService from '../services/shopService';

const ShopAuthContext = createContext(null);

export const ShopAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('partnexa_user') || localStorage.getItem('shop_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      return parsed.role === 'SHOP_OWNER' ? parsed : null;
    } catch {
      return null;
    }
  });
  const [shop, setShop] = useState(() => {
    try {
      const savedUser = localStorage.getItem('partnexa_user') || localStorage.getItem('shop_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.role !== 'SHOP_OWNER') return null;
      }
      const saved = localStorage.getItem('shop_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      const savedUser = localStorage.getItem('partnexa_user') || localStorage.getItem('shop_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'SHOP_OWNER') {
          return localStorage.getItem('partnexa_access_token') || localStorage.getItem('shop_token') || null;
        }
      }
    } catch {}
    return null;
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('partnexa_theme') || localStorage.getItem('shop_theme') || 'light');
  const [loading, setLoading] = useState(true);

  // Initialize and synchronize theme
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
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    window.dispatchEvent(new CustomEvent('theme:change', { detail: nextTheme }));
  };

  // Verify and refresh profile on mount ONLY if the authenticated user is a SHOP_OWNER
  useEffect(() => {
    const checkAuth = async () => {
      const savedUserStr = localStorage.getItem('partnexa_user') || localStorage.getItem('shop_user');
      let parsedUser = null;
      try { parsedUser = savedUserStr ? JSON.parse(savedUserStr) : null; } catch {}

      // Keep passive if current user is not a SHOP_OWNER
      if (!parsedUser || parsedUser.role !== 'SHOP_OWNER') {
        setLoading(false);
        return;
      }

      const activeToken = localStorage.getItem('partnexa_access_token') || token;
      if (activeToken) {
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
          console.warn('[ShopAuth] Could not load shop profile:', err.message);
          // Do NOT wipe shared user session or dispatch global logout
          setShop(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  // Synchronize with global auth events
  useEffect(() => {
    const handleAuthLogin = () => {
      const savedUserStr = localStorage.getItem('partnexa_user') || localStorage.getItem('shop_user');
      let parsed = null;
      try { parsed = savedUserStr ? JSON.parse(savedUserStr) : null; } catch {}

      if (parsed && parsed.role === 'SHOP_OWNER') {
        const savedToken = localStorage.getItem('partnexa_access_token') || localStorage.getItem('shop_token');
        setToken(savedToken);
        setUser(parsed);
        // Load profile for shop owner in background
        shopService.getProfile().then((res) => {
          if (res?.data) {
            setShop(res.data);
            localStorage.setItem('shop_data', JSON.stringify(res.data));
          }
        }).catch((err) => {
          console.warn('[ShopAuth] Background shop profile fetch:', err.message);
        });
      } else {
        // Current session is not for Shop portal — stay idle
        setUser(null);
        setShop(null);
        setToken(null);
      }
    };
    const handleAuthLogout = () => {
      setUser(null);
      setShop(null);
      setToken(null);
    };
    window.addEventListener('auth:login', handleAuthLogin);
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth:login', handleAuthLogin);
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  const login = async (credentials) => {
    const res = await shopService.login(credentials);
    const { user: userData, shop: shopData, token: authToken, accessToken, refreshToken } = res.data || res;
    const finalToken = accessToken || authToken;
    setUser(userData);
    setShop(shopData);
    setToken(finalToken);
    localStorage.setItem('partnexa_access_token', finalToken);
    if (refreshToken) localStorage.setItem('partnexa_refresh_token', refreshToken);
    localStorage.setItem('partnexa_user', JSON.stringify(userData));
    localStorage.setItem('shop_user', JSON.stringify(userData));
    localStorage.setItem('shop_data', JSON.stringify(shopData));
    localStorage.setItem('shop_token', finalToken);
    return res;
  };

  const register = async (data) => {
    const res = await shopService.register(data);
    const { user: userData, shop: shopData, token: authToken, accessToken, refreshToken } = res.data || res;
    const finalToken = accessToken || authToken;
    setUser(userData);
    setShop(shopData);
    setToken(finalToken);
    localStorage.setItem('partnexa_access_token', finalToken);
    if (refreshToken) localStorage.setItem('partnexa_refresh_token', refreshToken);
    localStorage.setItem('partnexa_user', JSON.stringify(userData));
    localStorage.setItem('shop_user', JSON.stringify(userData));
    localStorage.setItem('shop_data', JSON.stringify(shopData));
    localStorage.setItem('shop_token', finalToken);
    return res;
  };

  const logout = () => {
    setUser(null);
    setShop(null);
    setToken(null);
    localStorage.removeItem('shop_user');
    localStorage.removeItem('shop_data');
    localStorage.removeItem('shop_token');

    // Only clear global session if the current user was actually a SHOP_OWNER
    const savedUserStr = localStorage.getItem('partnexa_user');
    let parsed = null;
    try { parsed = savedUserStr ? JSON.parse(savedUserStr) : null; } catch {}
    if (parsed && parsed.role === 'SHOP_OWNER') {
      localStorage.removeItem('partnexa_access_token');
      localStorage.removeItem('partnexa_refresh_token');
      localStorage.removeItem('partnexa_user');
      window.dispatchEvent(new Event('auth:logout'));
    }
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
        accessToken: token,
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
