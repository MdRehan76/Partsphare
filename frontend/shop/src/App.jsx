import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ShopAuthProvider, useShopAuth } from './contexts/ShopAuthContext';
import ShopLayout from './components/ShopLayout';

import ShopLoginPage from './pages/ShopLoginPage';
import ShopRegisterPage from './pages/ShopRegisterPage';
import ShopDashboardPage from './pages/ShopDashboardPage';
import ServiceCalendarPage from './pages/ServiceCalendarPage';
import CommissionLedgerPage from './pages/CommissionLedgerPage';
import DeliveriesPage from './pages/DeliveriesPage';
import UsedPartIntakePage from './pages/UsedPartIntakePage';
import ShopTicketsPage from './pages/ShopTicketsPage';
import ShopProfilePage from './pages/ShopProfilePage';

// Protected Route Component
const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useShopAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '1rem', fontWeight: 500 }}>
          Verifying Workshop Authorization...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <ShopAuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<ShopLoginPage />} />
          <Route path="/register" element={<ShopRegisterPage />} />

          {/* Protected Workshop Portal Routes */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <ShopLayout />
              </RequireAuth>
            }
          >
            <Route index element={<ShopDashboardPage />} />
            <Route path="calendar" element={<ServiceCalendarPage />} />
            <Route path="commission" element={<CommissionLedgerPage />} />
            <Route path="deliveries" element={<DeliveriesPage />} />
            <Route path="used-parts" element={<UsedPartIntakePage />} />
            <Route path="tickets" element={<ShopTicketsPage />} />
            <Route path="profile" element={<ShopProfilePage />} />
          </Route>

          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ShopAuthProvider>
  );
};

export default App;
