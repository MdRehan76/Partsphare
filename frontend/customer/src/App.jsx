import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { VehicleProvider } from './contexts/VehicleContext';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VehicleOnboardingPage from './pages/VehicleOnboardingPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import VehiclesPage from './pages/VehiclesPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ServicesPage from './pages/ServicesPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import SellUsedPartPage from './pages/SellUsedPartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';
import SupportPage from './pages/SupportPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Guest-only Route (redirect logged-in users to home)
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
        {/* Core Catalog & Home */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/slug/:slug" element={<ProductDetailPage />} />

        {/* Vehicles / Garage */}
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/garage" element={<Navigate to="/vehicles" replace />} />
        <Route
          path="/onboarding/vehicle"
          element={
            <ProtectedRoute>
              <VehicleOnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Cart & Checkout */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* Services & Maintenance Subscriptions */}
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />

        {/* Circular Economy: Sell Used Parts */}
        <Route path="/sell-used-parts" element={<SellUsedPartPage />} />

        {/* Orders & Tracking */}
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />

        {/* Customer Support */}
        <Route path="/support" element={<SupportPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Protected Profile */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

function App() {
  return (
    <AuthProvider>
      <VehicleProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-surface-elevated, #1E293B)',
                color: 'var(--text-primary, #F8FAFC)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                borderRadius: '12px',
                fontSize: '14px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
              },
              success: {
                iconTheme: { primary: '#0D9488', secondary: '#F8FAFC' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#F8FAFC' },
              },
            }}
          />
          <AppRoutes />
        </CartProvider>
      </VehicleProvider>
    </AuthProvider>
  );
}

export default App;
