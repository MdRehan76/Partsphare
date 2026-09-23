import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Unified logout routine
  const logout = useCallback(async () => {
    const refreshToken =
      localStorage.getItem('partnexa_refresh_token') ||
      localStorage.getItem('refreshToken');

    try {
      if (refreshToken) {
        await authService.logout(refreshToken).catch(() => {});
      }
    } catch {
      // Ignore errors on logout
    } finally {
      // Clear standardized PartNexa storage
      localStorage.removeItem('partnexa_access_token');
      localStorage.removeItem('partnexa_refresh_token');
      localStorage.removeItem('partnexa_user');

      // Clear all legacy keys
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('shop_token');
      localStorage.removeItem('shop_user');
      localStorage.removeItem('shop_data');
      localStorage.removeItem('partsphere_delivery_token');
      localStorage.removeItem('partsphere_delivery_user');
      localStorage.removeItem('partsphere_delivery_partner');
      localStorage.removeItem('partnexa_admin_token');
      localStorage.removeItem('partnexa_admin_user');
      localStorage.removeItem('partnexa_admin_refresh');

      setUser(null);
      window.dispatchEvent(new Event('auth:logout'));
    }
  }, []);

  // Listen for forced logout events (from axios interceptor)
  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
      localStorage.removeItem('partnexa_access_token');
      localStorage.removeItem('partnexa_refresh_token');
      localStorage.removeItem('partnexa_user');
    };
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  // Restore session on mount — strictly query backend /auth/me for authoritative role
  useEffect(() => {
    const restoreSession = async () => {
      const token =
        localStorage.getItem('partnexa_access_token') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('partnexa_admin_token') ||
        localStorage.getItem('partsphere_delivery_token') ||
        localStorage.getItem('shop_token');

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Authoritative verification against PostgreSQL / database
        const res = await authService.getMe();
        const verifiedUser = res.data?.data || res.data;

        if (!verifiedUser || !verifiedUser.id) {
          throw new Error('Invalid user payload from /auth/me');
        }

        // Authoritative role from backend, ignoring any local storage manipulation
        setUser(verifiedUser);
        localStorage.setItem('partnexa_user', JSON.stringify(verifiedUser));
        localStorage.setItem('partnexa_access_token', token);
      } catch (err) {
        console.warn('Session restoration failed or token expired:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [logout]);

  /**
   * Unified login with backend-authoritative role verification
   * @param {Object} credentials - { email, password }
   * @param {string} [selectedRole] - 'CUSTOMER' | 'SHOP_OWNER' | 'DELIVERY_PARTNER' | 'ADMIN'
   */
  const login = async (credentials, selectedRole = null) => {
    const res = await authService.login(credentials);
    const resData = res.data?.data || res.data;
    const { user: userData, accessToken, refreshToken } = resData;

    if (!userData || !accessToken) {
      throw new Error('Authentication response is missing user or accessToken.');
    }

    // Backend-authoritative role check against selected role
    if (selectedRole) {
      const userRole = userData.role;
      const isRoleMatch =
        userRole === selectedRole ||
        (selectedRole === 'ADMIN' && (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'));

      if (!isRoleMatch) {
        // Access denied: do NOT save tokens to storage
        throw new Error(
          `Access Denied: You selected '${selectedRole}', but this account is registered as '${userRole}'. Please select the ${userRole} role to sign in.`
        );
      }
    }

    // Set standardized PartNexa storage
    localStorage.setItem('partnexa_access_token', accessToken);
    if (refreshToken) localStorage.setItem('partnexa_refresh_token', refreshToken);
    localStorage.setItem('partnexa_user', JSON.stringify(userData));

    // Backward-compatibility synchronization for legacy consumers
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));

    if (userData.role === 'SHOP_OWNER') {
      localStorage.setItem('shop_token', accessToken);
      localStorage.setItem('shop_user', JSON.stringify(userData));
    } else if (userData.role === 'DELIVERY_PARTNER') {
      localStorage.setItem('partsphere_delivery_token', accessToken);
      localStorage.setItem('partsphere_delivery_user', JSON.stringify(userData));
    } else if (userData.role === 'ADMIN' || userData.role === 'SUPER_ADMIN') {
      localStorage.setItem('partnexa_admin_token', accessToken);
      localStorage.setItem('partnexa_admin_user', JSON.stringify(userData));
      if (refreshToken) localStorage.setItem('partnexa_admin_refresh', refreshToken);
    }

    setUser(userData);
    window.dispatchEvent(
      new CustomEvent('auth:login', { detail: { user: userData, token: accessToken } })
    );

    return userData;
  };

  const register = async (credentials) => {
    const res = await authService.register(credentials);
    const resData = res.data?.data || res.data;
    const { user: userData, accessToken, refreshToken } = resData;

    localStorage.setItem('partnexa_access_token', accessToken);
    if (refreshToken) localStorage.setItem('partnexa_refresh_token', refreshToken);
    localStorage.setItem('partnexa_user', JSON.stringify(userData));

    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setUser(userData);
    return userData;
  };

  const refresh = async () => {
    const refreshToken =
      localStorage.getItem('partnexa_refresh_token') ||
      localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    const res = await authService.refresh(refreshToken);
    const resData = res.data?.data || res.data;
    const newAccessToken = resData.accessToken || resData.token;
    const newRefreshToken = resData.refreshToken || refreshToken;

    localStorage.setItem('partnexa_access_token', newAccessToken);
    localStorage.setItem('partnexa_refresh_token', newRefreshToken);
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    if (resData.user) {
      localStorage.setItem('partnexa_user', JSON.stringify(resData.user));
      setUser(resData.user);
    }

    return newAccessToken;
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('partnexa_user', JSON.stringify(merged));
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refresh,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
