const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const config = require('./config');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { generalLimiter } = require('./middleware/rateLimiter.middleware');

// Route modules
const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const vehiclesRoutes = require('./modules/vehicles/vehicles.routes');
const catalogRoutes = require('./modules/catalog/catalog.routes');

const app = express();

// ============================================================
// Security & General Middleware
// ============================================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving uploaded images
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (config.cors.allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
if (config.env !== 'test') {
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', config.upload.dir)));

// General rate limiter
app.use('/api', generalLimiter);

// ============================================================
// Health Check
// ============================================================
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PartSphere API is running.',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    env: config.env,
  });
});

// ============================================================
// API Routes
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/catalog', catalogRoutes);

// ============================================================
// Error Handling (must be last)
// ============================================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================
// Start Server
// ============================================================
const startServer = async () => {
  try {
    // Test DB connection
    const prisma = require('./config/prisma');
    await prisma.$connect();
    console.log('✅ Database connected successfully.');

    app.listen(config.port, () => {
      console.log(`🚀 PartSphere API running on http://localhost:${config.port}`);
      console.log(`   Environment: ${config.env}`);
      console.log(`   Health check: http://localhost:${config.port}/health`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
