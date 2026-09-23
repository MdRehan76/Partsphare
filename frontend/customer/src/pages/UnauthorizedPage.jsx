import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const UnauthorizedPage = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const attemptedPath = queryParams.get('from') || 'requested resource';
  const role = user?.role || queryParams.get('role') || 'UNKNOWN';

  const getHomePortal = () => {
    switch (role) {
      case 'SHOP_OWNER':
        return { path: '/shop', label: 'Mechanical Workshop Portal' };
      case 'DELIVERY_PARTNER':
        return { path: '/delivery', label: 'Delivery Partner Portal' };
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return { path: '/admin', label: 'Executive Admin Console' };
      case 'CUSTOMER':
      default:
        return { path: '/customer', label: 'Customer Marketplace' };
    }
  };

  const home = getHomePortal();

  const handleSwitchAccount = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: 'var(--color-bg, #0f172a)',
        color: 'var(--color-text-primary, #ffffff)',
        fontFamily: 'var(--font-primary, sans-serif)',
      }}
    >
      <div
        className="card-glass"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '2.5rem',
          borderRadius: '16px',
          border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
          backgroundColor: 'var(--color-bg-card, #1e293b)',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            margin: '0 auto 1.5rem',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
          }}
        >
          🛡️
        </div>

        <div
          style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
          }}
        >
          403 Access Denied
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.2 }}>
          Unauthorized Portal Access
        </h1>

        <p
          style={{
            fontSize: '0.95rem',
            color: 'var(--color-text-muted, #94a3b8)',
            marginBottom: '1.5rem',
            lineHeight: 1.5,
          }}
        >
          You do not have administrative or authorization privileges to access{' '}
          <code
            style={{
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              color: 'var(--color-primary, #38bdf8)',
              fontSize: '0.9rem',
            }}
          >
            {attemptedPath}
          </code>
          .
        </p>

        {user && (
          <div
            style={{
              padding: '1rem',
              borderRadius: '10px',
              backgroundColor: 'var(--color-bg-elevated, rgba(0,0,0,0.2))',
              border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
              marginBottom: '1.75rem',
              textAlign: 'left',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ color: 'var(--color-text-muted, #94a3b8)', marginBottom: '0.25rem' }}>
              Authenticated User:
            </div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary, #ffffff)' }}>
              {user.firstName} {user.lastName} ({user.email})
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--color-text-muted, #94a3b8)' }}>Active Role:</span>
              <span
                style={{
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(2, 132, 199, 0.2)',
                  color: '#38bdf8',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              >
                {user.role}
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link
            to={home.path}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary, #0284c7)',
              color: '#ffffff',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Return to {home.label} &rarr;
          </Link>

          <button
            type="button"
            onClick={handleSwitchAccount}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              background: 'transparent',
              border: '1px solid var(--color-border, rgba(255,255,255,0.15))',
              color: 'var(--color-text-primary, #ffffff)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Switch Account / Sign In with Another Role
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
