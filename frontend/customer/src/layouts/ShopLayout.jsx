import React from 'react';
import { Outlet } from 'react-router-dom';
import UnifiedHeader from '../components/layout/UnifiedHeader';
import ShopNavbar from '../components/shop/ShopNavbar';
import ShopSidebar from '../components/shop/ShopSidebar';

export const ShopLayout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <UnifiedHeader>
        <ShopNavbar />
      </UnifiedHeader>
      <div style={{ display: 'flex', flex: 1 }}>
        <ShopSidebar />
        <main style={{ flex: 1, padding: '2rem', maxWidth: 'calc(100vw - var(--sidebar-width))', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ShopLayout;
