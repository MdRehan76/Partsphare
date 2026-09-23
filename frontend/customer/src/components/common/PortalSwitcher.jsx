import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const PortalSwitcher = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const portals = [
    { label: 'Customer', path: '/customer', icon: '🛒', color: 'var(--color-primary, #0284C7)' },
    { label: 'Workshop', path: '/shop', icon: '🔧', color: 'var(--color-teal, #0D9488)' },
    { label: 'Delivery', path: '/delivery', icon: '🛵', color: 'var(--color-orange, #FF6B35)' },
    { label: 'Admin', path: '/admin', icon: '🛡️', color: 'var(--color-primary-dark, #2563EB)' },
  ];

  const currentPortal = portals.find((p) => location.pathname.startsWith(p.path)) || portals[0];

  return (
    <div
      className="portal-switcher-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        minHeight: 'var(--portal-bar-height, 38px)',
        width: '100%',
        boxSizing: 'border-box',
        background: 'var(--color-bg-elevated, #0f172a)',
        fontSize: '0.8rem',
        fontWeight: 600,
        position: 'relative',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflowX: 'auto', padding: '2px 0' }}>
        <span
          style={{
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-muted, #94a3b8)',
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          Portals:
        </span>

        {portals.map((portal) => {
          const isActive = location.pathname.startsWith(portal.path);
          return (
            <NavLink
              key={portal.path}
              to={portal.path}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.65rem',
                borderRadius: '6px',
                color: isActive ? '#FFFFFF' : 'var(--color-text-secondary, #cbd5e1)',
                backgroundColor: isActive ? portal.color : 'transparent',
                textDecoration: 'none',
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                border: isActive ? 'none' : '1px solid var(--color-border, rgba(255,255,255,0.08))',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{portal.icon}</span>
              <span>{portal.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #94a3b8)' }}>
              <strong style={{ color: 'var(--color-text-primary, #ffffff)' }}>{user.firstName || user.email}</strong> ({user.role})
            </span>
            <NavLink
              to="/login"
              style={{
                fontSize: '0.7rem',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.08)',
                color: 'var(--color-primary-light, #38bdf8)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
              title="Switch demo account or portal role"
            >
              Switch Role ⇄
            </NavLink>
            <button
              type="button"
              onClick={logout}
              style={{
                fontSize: '0.7rem',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              title="Sign out of PartNexa"
            >
              Logout
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-primary, #38bdf8)',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Sign In ↗
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default PortalSwitcher;
