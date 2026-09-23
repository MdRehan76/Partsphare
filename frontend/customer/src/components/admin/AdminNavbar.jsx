import React from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export default function AdminNavbar() {
  const { user, logout, theme, toggleTheme } = useAdminAuth();

  return (
    <header
      style={{
        position: 'relative',
        width: '100%',
        height: 'var(--navbar-height)',
        backgroundColor: 'var(--bg-glass, rgba(15, 23, 42, 0.9))',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success)',
              boxShadow: '0 0 10px var(--color-success)',
            }}
          />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            System Live: Core & Fleet Connected
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: '1px solid var(--border-color)',
            transition: 'all 0.2s',
          }}
          title="Toggle Light / Dark Mode"
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>

        {/* User Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.35rem 0.8rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-bg)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {user?.firstName?.[0] || 'A'}
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {user?.firstName || 'Admin'} {user?.lastName || ''}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              {user?.role || 'SUPER_ADMIN'}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            fontSize: '0.82rem',
            fontWeight: 600,
            border: '1px solid rgba(239, 68, 68, 0.2)',
            transition: 'all 0.2s',
          }}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
