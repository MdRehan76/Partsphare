import React from 'react';
import { Outlet } from 'react-router-dom';
import ShopNavbar from './ShopNavbar';
import ShopSidebar from './ShopSidebar';

export const ShopLayout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <ShopNavbar />
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
