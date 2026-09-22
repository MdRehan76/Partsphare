import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import DeliveryNavbar from './DeliveryNavbar';
import DeliverySidebar from './DeliverySidebar';
import { useDeliveryAuth } from '../../contexts/DeliveryAuthContext';

export const DeliveryLayout = () => {
  const { user, loading } = useDeliveryAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-primary)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>🛵</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Loading PartSphere Rider Portal...</div>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <DeliveryNavbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <DeliverySidebar />
        <main
          style={{
            flex: 1,
            background: 'var(--color-bg)',
            overflowY: 'auto',
            paddingBottom: '3rem',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DeliveryLayout;
