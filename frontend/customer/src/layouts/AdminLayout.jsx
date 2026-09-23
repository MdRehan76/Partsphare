import React from 'react';
import { Outlet } from 'react-router-dom';
import UnifiedHeader from '../components/layout/UnifiedHeader';
import AdminNavbar from '../components/admin/AdminNavbar';
import AdminSidebar from '../components/admin/AdminSidebar';

export default function AdminLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <UnifiedHeader>
        <AdminNavbar />
      </UnifiedHeader>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <AdminSidebar />
        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
