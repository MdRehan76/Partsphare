import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AdminLayout from './components/layout/AdminLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CustomersPage from './pages/CustomersPage';
import ShopsManagementPage from './pages/ShopsManagementPage';
import DeliveryPartnersPage from './pages/DeliveryPartnersPage';
import ProductsInventoryPage from './pages/ProductsInventoryPage';
import PlatformConfigPage from './pages/PlatformConfigPage';
import UsedPartsOversightPage from './pages/UsedPartsOversightPage';
import DeliveriesOversightPage from './pages/DeliveriesOversightPage';
import CustomerCareHubPage from './pages/CustomerCareHubPage';

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<AdminLoginPage />} />

          {/* Protected Administrator Console Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/" element={<AdminDashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/shops" element={<ShopsManagementPage />} />
            <Route path="/delivery-partners" element={<DeliveryPartnersPage />} />
            <Route path="/products-inventory" element={<ProductsInventoryPage />} />
            <Route path="/platform-config" element={<PlatformConfigPage />} />
            <Route path="/used-parts" element={<UsedPartsOversightPage />} />
            <Route path="/deliveries" element={<DeliveriesOversightPage />} />
            <Route path="/care-hub" element={<CustomerCareHubPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}
