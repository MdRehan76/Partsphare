import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';

import config from './config/env';
import { checkDatabaseConnection } from './config/prisma';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rateLimiter.middleware';

// Route modules
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import vehiclesRoutes from './modules/vehicles/vehicles.routes';
import catalogRoutes from './modules/catalog/catalog.routes';
import cartRoutes from './modules/cart/cart.routes';
import ordersRoutes from './modules/orders/orders.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import subscriptionsRoutes from './modules/subscriptions/subscriptions.routes';
import shopsRoutes from './modules/shops/shops.routes';
import usedPartsRoutes from './modules/usedparts/usedparts.routes';
import supportRoutes from './modules/support/support.routes';
import deliveryRoutes from './modules/delivery/delivery.routes';
import adminRoutes from './modules/admin/admin.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';

const app = express();

// ============================================================
// Security & General Middleware
// ============================================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving images
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, postman, mobile)
      if (!origin) return callback(null, true);
      if (config.cors.allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin ${origin} not allowed.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (config.env !== 'test') {
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', config.upload.dir)));

// General rate limiter on /api
app.use('/api', generalLimiter);

// ============================================================
// Health Checks (Live PostgreSQL Connection Probe)
// ============================================================
const healthHandler = async (_req: express.Request, res: express.Response) => {
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.isConnected) {
    return res.status(200).json({
      success: true,
      api: 'ok',
      database: 'connected',
    });
  }
  return res.status(200).json({
    success: false,
    api: 'ok',
    database: 'disconnected',
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// ============================================================
// API Routes
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/shops', shopsRoutes);
app.use('/api/usedparts', usedPartsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);

// ============================================================
// Error Handling
// ============================================================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
