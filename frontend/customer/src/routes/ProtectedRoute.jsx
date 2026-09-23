import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg, #0f172a)',
          color: 'var(--color-text-primary, #ffffff)',
          fontFamily: 'var(--font-primary, sans-serif)',
          gap: '1rem',
        }}
      >
        <div style={{ fontSize: '2.5rem', animation: 'spin 1s linear infinite' }}>⚙️</div>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-muted, #94a3b8)' }}>
          Verifying PartNexa authorization...
        </div>
      </div>
    );
  }

  // Not logged in -> send to /login with redirect state
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Role validation
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role;
    const isRoleAuthorized =
      allowedRoles.includes(userRole) ||
      (allowedRoles.includes('ADMIN') && userRole === 'SUPER_ADMIN');

    if (!isRoleAuthorized) {
      // User is logged in but does not have permission for this portal
      return (
        <Navigate
          to={`/unauthorized?from=${encodeURIComponent(location.pathname)}&role=${encodeURIComponent(userRole)}`}
          replace
        />
      );
    }
  }

  return children;
};

export default ProtectedRoute;
