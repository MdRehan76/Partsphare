import React from 'react';
import { NavLink } from 'react-router-dom';
import { useShopAuth } from '../contexts/ShopAuthContext';

export const ShopSidebar = () => {
  const { shop } = useShopAuth();

  const links = [
    { to: '/', label: 'Shop Dashboard', icon: '📊', end: true },
    { to: '/calendar', label: 'Service Calendar', icon: '📅' },
    { to: '/commission', label: 'Commission & Ledger', icon: '💰' },
    { to: '/deliveries', label: 'Incoming Deliveries', icon: '🚚' },
    { to: '/used-parts', label: 'Used-Part Intake', icon: '🔧' },
    { to: '/tickets', label: 'Support Tickets', icon: '🎫' },
    { to: '/profile', label: 'Workshop Profile', icon: '⚙️' },
  ];

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--color-bg-card)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem 0.85rem',
        minHeight: 'calc(100vh - var(--navbar-height))',
        position: 'sticky',
        top: 'var(--navbar-height)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ padding: '0 0.75rem 0.75rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Operations & DIFM
        </div>

        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.7rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
              boxShadow: isActive ? '0 2px 10px rgba(2, 132, 199, 0.3)' : 'none',
              transition: 'all var(--transition-fast)',
            })}
          >
            <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Workshop Summary Footer Card */}
      {shop && (
        <div
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Commission
            </span>
            <span className="badge badge-info" style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
              {shop.commissionRate || 12}% Rate
            </span>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            <strong>Categories:</strong> {(shop.vehicleCategories || ['CAR', 'BIKE']).join(', ')}
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
            🔒 Commission releases only when service is completed & payment clears.
          </div>
        </div>
      )}
    </aside>
  );
};

export default ShopSidebar;
