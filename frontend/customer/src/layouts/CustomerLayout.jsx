import React from 'react';
import { Outlet } from 'react-router-dom';
import UnifiedHeader from '../components/layout/UnifiedHeader';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export const CustomerLayout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <UnifiedHeader>
        <Navbar />
      </UnifiedHeader>
      <main className="page-content" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
