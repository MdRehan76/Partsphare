import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDeliveryAuth } from '../../contexts/DeliveryAuthContext';

export const DeliverySidebar = () => {
  const { partner, kyc } = useDeliveryAuth();

  const navItems = [
    { label: 'Rider Dashboard', path: '/delivery', icon: '📊', end: true },
    { label: 'Available Jobs', path: '/delivery/jobs/available', icon: '📦' },
    { label: 'Active Trips', path: '/delivery/jobs/my', icon: '🛵' },
    { label: 'Used-Part Pickups', path: '/delivery/used-parts', icon: '🔍' },
    { label: 'COD & Reconciliation', path: '/delivery/cod', icon: '💵' },
    { label: 'KYC & Verification', path: '/delivery/kyc', icon: '📋' },
    { label: 'Vehicle & Profile', path: '/delivery/profile', icon: '⚙️' },
  ];

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        minHeight: 'calc(100vh - var(--total-header-height))',
        background: 'var(--color-bg-card)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem 0.85rem',
      }}
    >
      <div>
        {/* Rider Status Summary Widget */}
        {partner && (
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Rider Status
              </span>
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  color: partner.verificationStatus === 'APPROVED' ? 'var(--color-emerald)' : 'var(--color-amber)',
                }}
              >
                {partner.verificationStatus}
              </span>
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>
              {partner.vehicleType || 'Motorcycle'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Reg: {partner.vehicleNum || 'Not registered'}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid var(--color-border)' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Rating: </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-amber)' }}>
                  ★ {partner.rating || 5.0}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Trips: </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                  {partner.totalDeliveries || 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                background: isActive ? 'var(--color-primary-glow)' : 'transparent',
                border: isActive ? '1px solid var(--color-primary-glow)' : '1px solid transparent',
                transition: 'all var(--transition-fast)',
              })}
            >
              <span style={{ fontSize: '1.15rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Info: PartSphere Logistics Version */}
      <div
        style={{
          padding: '0.85rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          fontSize: '0.725rem',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>PartSphere Logistics Hub</div>
        <div>Phase 3 Delivery Network v1.0</div>
      </div>
    </aside>
  );
};

export default DeliverySidebar;
