import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ShopAuthProvider } from './contexts/ShopAuthContext';
import { DeliveryAuthProvider } from './contexts/DeliveryAuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { VehicleProvider } from './contexts/VehicleContext';
import { CartProvider } from './contexts/CartContext';

// Central Route Tree
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ShopAuthProvider>
          <DeliveryAuthProvider>
            <AdminAuthProvider>
              <VehicleProvider>
                <CartProvider>
                  <Toaster
                    position="top-right"
                    containerStyle={{ top: 'calc(var(--total-header-height, 110px) + 12px)' }}
                    toastOptions={{
                      style: {
                        background: 'var(--color-bg-card, #1e293b)',
                        color: 'var(--color-text-primary, #ffffff)',
                        border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
                        borderRadius: '12px',
                        fontSize: '14px',
                        boxShadow: 'var(--shadow-lg, 0 10px 30px rgba(0,0,0,0.2))',
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
            </AdminAuthProvider>
          </DeliveryAuthProvider>
        </ShopAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
