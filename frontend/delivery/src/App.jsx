import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DeliveryAuthProvider } from './contexts/DeliveryAuthContext';

import DeliveryLayout from './components/layout/DeliveryLayout';
import DeliveryLoginPage from './pages/DeliveryLoginPage';
import DeliveryRegisterPage from './pages/DeliveryRegisterPage';
import DeliveryDashboardPage from './pages/DeliveryDashboardPage';
import AvailableJobsPage from './pages/AvailableJobsPage';
import MyTripsPage from './pages/MyTripsPage';
import JobDetailPage from './pages/JobDetailPage';
import UsedPartInspectionPage from './pages/UsedPartInspectionPage';
import UsedPartsListPage from './pages/UsedPartsListPage';
import CodReconciliationPage from './pages/CodReconciliationPage';
import KycUploadPage from './pages/KycUploadPage';
import DeliveryProfilePage from './pages/DeliveryProfilePage';

export function App() {
  return (
    <DeliveryAuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              boxShadow: 'var(--shadow-lg)',
            },
          }}
        />
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<DeliveryLoginPage />} />
          <Route path="/register" element={<DeliveryRegisterPage />} />

          {/* Protected Rider Console Routes */}
          <Route element={<DeliveryLayout />}>
            <Route path="/dashboard" element={<DeliveryDashboardPage />} />
            <Route path="/jobs/available" element={<AvailableJobsPage />} />
            <Route path="/jobs/my" element={<MyTripsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/jobs/:id/inspect" element={<UsedPartInspectionPage />} />
            <Route path="/used-parts" element={<UsedPartsListPage />} />
            <Route path="/cod" element={<CodReconciliationPage />} />
            <Route path="/kyc" element={<KycUploadPage />} />
            <Route path="/profile" element={<DeliveryProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </DeliveryAuthProvider>
  );
}

export default App;
