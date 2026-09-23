import React from 'react';
import { Outlet } from 'react-router-dom';
import UnifiedHeader from '../components/layout/UnifiedHeader';
import DeliveryNavbar from '../components/delivery/DeliveryNavbar';
import DeliverySidebar from '../components/delivery/DeliverySidebar';

export const DeliveryLayout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <UnifiedHeader>
        <DeliveryNavbar />
      </UnifiedHeader>
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
