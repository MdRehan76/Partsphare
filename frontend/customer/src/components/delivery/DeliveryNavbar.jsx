import React from 'react';
import { Link } from 'react-router-dom';
import { useDeliveryAuth } from '../../contexts/DeliveryAuthContext';

export const DeliveryNavbar = () => {
  const { user, partner, theme, toggleTheme, toggleDuty, logout } = useDeliveryAuth();

  const handleDutyClick = async () => {
    if (!partner) return;
    try {
      await toggleDuty(!partner.isOnline);
    } catch (e) {
      // toast handled in context
    }
  };

  return (
    <header
      style={{
        height: 'var(--navbar-height)',
        background: 'var(--color-bg-card)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'relative',
        zIndex: 100,
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Brand & Portal Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/delivery" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-amber))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.2rem',
            }}
          >
            ⚡
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
              Part<span style={{ color: 'var(--color-primary)' }}>Sphere</span>
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-amber)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Delivery Partner Portal
            </div>
          </div>
        </Link>
      </div>

      {/* Center / Action: Duty Switch */}
      {partner && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={handleDutyClick}
            className={`duty-switch-btn ${partner.isOnline ? 'online' : 'offline'}`}
            title={partner.isOnline ? 'Click to go Offline' : 'Click to go Online'}
          >
            <span className={`beacon-dot ${partner.isOnline ? 'beacon-online' : 'beacon-offline'}`} />
            <span>{partner.isOnline ? 'ONLINE (ON DUTY)' : 'OFFLINE (OFF DUTY)'}</span>
          </button>

          {/* Cash in Hand Quick Counter */}
          <Link
            to="/cod"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <span>💵 Cash in Hand:</span>
            <span style={{ color: '#EA580C', fontWeight: 800 }}>
              ₹{(partner.cashInHand || 0).toLocaleString('en-IN')}
            </span>
          </Link>
        </div>
      )}

      {/* Right Actions: Theme, Rider Badge, Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.1rem',
            color: 'var(--color-text-primary)',
            transition: 'all var(--transition-fast)',
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to="/delivery/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                {user.firstName ? user.firstName[0].toUpperCase() : 'R'}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  {user.firstName} {user.lastName}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                  {partner?.vehicleNum || 'Rider'}
                </div>
              </div>
            </Link>

            <button
              onClick={logout}
              className="btn btn-secondary btn-sm"
              title="Sign Out"
              style={{ padding: '0.45rem 0.75rem' }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default DeliveryNavbar;
