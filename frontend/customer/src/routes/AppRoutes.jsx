import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import ShopLayout from '../layouts/ShopLayout';
import DeliveryLayout from '../layouts/DeliveryLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public & Auth Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';

// Customer Pages
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import VehiclesPage from '../pages/VehiclesPage';
import VehicleOnboardingPage from '../pages/VehicleOnboardingPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import ServicesPage from '../pages/ServicesPage';
import SubscriptionsPage from '../pages/SubscriptionsPage';
import SubscriptionPlanDetailPage from '../pages/SubscriptionPlanDetailPage';
import MySubscriptionsPage from '../pages/MySubscriptionsPage';
import SellUsedPartPage from '../pages/SellUsedPartPage';
import OrdersPage from '../pages/OrdersPage';
import OrderDetailPage from '../pages/OrderDetailPage';
import ProfilePage from '../pages/ProfilePage';
import SupportPage from '../pages/SupportPage';

// Shop Pages
import ShopDashboardPage from '../pages/shop/ShopDashboardPage';
import ServiceCalendarPage from '../pages/shop/ServiceCalendarPage';
import CommissionLedgerPage from '../pages/shop/CommissionLedgerPage';
import DeliveriesPage from '../pages/shop/DeliveriesPage';
import UsedPartIntakePage from '../pages/shop/UsedPartIntakePage';
import ShopTicketsPage from '../pages/shop/ShopTicketsPage';
import ShopProfilePage from '../pages/shop/ShopProfilePage';
import ShopRegisterPage from '../pages/shop/ShopRegisterPage';

// Delivery Pages
import DeliveryDashboardPage from '../pages/delivery/DeliveryDashboardPage';
import AvailableJobsPage from '../pages/delivery/AvailableJobsPage';
import MyTripsPage from '../pages/delivery/MyTripsPage';
import JobDetailPage from '../pages/delivery/JobDetailPage';
import UsedPartInspectionPage from '../pages/delivery/UsedPartInspectionPage';
import UsedPartsListPage from '../pages/delivery/UsedPartsListPage';
import CodReconciliationPage from '../pages/delivery/CodReconciliationPage';
import KycUploadPage from '../pages/delivery/KycUploadPage';
import DeliveryProfilePage from '../pages/delivery/DeliveryProfilePage';
import DeliveryRegisterPage from '../pages/delivery/DeliveryRegisterPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import OrdersManagementPage from '../pages/admin/OrdersManagementPage';
import CustomersPage from '../pages/admin/CustomersPage';
import ShopsManagementPage from '../pages/admin/ShopsManagementPage';
import DeliveryPartnersPage from '../pages/admin/DeliveryPartnersPage';
import ProductsInventoryPage from '../pages/admin/ProductsInventoryPage';
import PlatformConfigPage from '../pages/admin/PlatformConfigPage';
import UsedPartsOversightPage from '../pages/admin/UsedPartsOversightPage';
import DeliveriesOversightPage from '../pages/admin/DeliveriesOversightPage';
import CustomerCareHubPage from '../pages/admin/CustomerCareHubPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect to Customer Marketplace */}
      <Route path="/" element={<Navigate to="/customer" replace />} />

      {/* Unified Authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Role-specific registration routes */}
      <Route path="/shop/register" element={<ShopRegisterPage />} />
      <Route path="/delivery/register" element={<DeliveryRegisterPage />} />
      <Route path="/shop/login" element={<Navigate to="/login?redirect=/shop" replace />} />
      <Route path="/delivery/login" element={<Navigate to="/login?redirect=/delivery" replace />} />
      <Route path="/admin/login" element={<Navigate to="/login?redirect=/admin" replace />} />

      {/* ============================================================ */}
      {/* 1. CUSTOMER PORTAL (/customer/* and root aliases)             */}
      {/* ============================================================ */}
      <Route element={<CustomerLayout />}>
        <Route path="/customer" element={<HomePage />} />
        <Route path="/customer/products" element={<ProductsPage />} />
        <Route path="/customer/products/:id" element={<ProductDetailPage />} />
        <Route path="/customer/products/slug/:slug" element={<ProductDetailPage />} />
        <Route path="/customer/vehicles" element={<VehiclesPage />} />
        <Route path="/customer/garage" element={<Navigate to="/customer/vehicles" replace />} />
        <Route
          path="/customer/onboarding/vehicle"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <VehicleOnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route path="/customer/cart" element={<CartPage />} />
        <Route
          path="/customer/checkout"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route path="/customer/services" element={<ServicesPage />} />
        <Route path="/customer/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/customer/subscriptions/:id" element={<SubscriptionPlanDetailPage />} />
        <Route
          path="/customer/my-subscriptions"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <MySubscriptionsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/customer/sell-used-parts" element={<SellUsedPartPage />} />
        <Route
          path="/customer/orders"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/customer/support" element={<SupportPage />} />
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Backward-Compatible Direct Aliases */}
        <Route path="/products" element={<Navigate to="/customer/products" replace />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/slug/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<Navigate to="/customer/cart" replace />} />
        <Route path="/checkout" element={<Navigate to="/customer/checkout" replace />} />
        <Route path="/services" element={<Navigate to="/customer/services" replace />} />
        <Route path="/subscriptions" element={<Navigate to="/customer/subscriptions" replace />} />
        <Route path="/subscriptions/:id" element={<SubscriptionPlanDetailPage />} />
        <Route
          path="/my-subscriptions"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <MySubscriptionsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/vehicles" element={<Navigate to="/customer/vehicles" replace />} />
        <Route path="/garage" element={<Navigate to="/customer/vehicles" replace />} />
        <Route
          path="/onboarding/vehicle"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <VehicleOnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route path="/sell-used-parts" element={<Navigate to="/customer/sell-used-parts" replace />} />
        <Route path="/orders" element={<Navigate to="/customer/orders" replace />} />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/support" element={<Navigate to="/customer/support" replace />} />
        <Route path="/profile" element={<Navigate to="/customer/profile" replace />} />
      </Route>

      {/* ============================================================ */}
      {/* 2. MECHANICAL WORKSHOP PORTAL (/shop/*)                       */}
      {/* ============================================================ */}
      <Route
        path="/shop"
        element={
          <ProtectedRoute allowedRoles={['SHOP_OWNER']}>
            <ShopLayout />
          </ProtectedRoute>
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

      {/* ============================================================ */}
      {/* 3. DELIVERY PARTNER PORTAL (/delivery/*)                     */}
      {/* ============================================================ */}
      <Route
        path="/delivery"
        element={
          <ProtectedRoute allowedRoles={['DELIVERY_PARTNER']}>
            <DeliveryLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DeliveryDashboardPage />} />
        <Route path="dashboard" element={<Navigate to="/delivery" replace />} />
        <Route path="jobs/available" element={<AvailableJobsPage />} />
        <Route path="jobs/my" element={<MyTripsPage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />
        <Route path="jobs/:id/inspect" element={<UsedPartInspectionPage />} />
        <Route path="used-parts" element={<UsedPartsListPage />} />
        <Route path="cod" element={<CodReconciliationPage />} />
        <Route path="kyc" element={<KycUploadPage />} />
        <Route path="profile" element={<DeliveryProfilePage />} />
      </Route>

      {/* ============================================================ */}
      {/* 4. EXECUTIVE ADMIN CONSOLE (/admin/*)                         */}
      {/* ============================================================ */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="orders" element={<OrdersManagementPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="shops" element={<ShopsManagementPage />} />
        <Route path="delivery-partners" element={<DeliveryPartnersPage />} />
        <Route path="products-inventory" element={<ProductsInventoryPage />} />
        <Route path="platform-config" element={<PlatformConfigPage />} />
        <Route path="used-parts" element={<UsedPartsOversightPage />} />
        <Route path="deliveries" element={<DeliveriesOversightPage />} />
        <Route path="care-hub" element={<CustomerCareHubPage />} />
      </Route>

      {/* Global 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
