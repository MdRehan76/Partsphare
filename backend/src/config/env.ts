import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root or parent if needed
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  directUrl: process.env.DIRECT_URL || '',
  useInMemoryDb: process.env.USE_IN_MEMORY_DB === 'true',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_for_development_32chars!',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_for_development_32chars!',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176')
      .split(',')
      .map((origin) => origin.trim()),
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
  },

  mail: {
    host: process.env.MAIL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true',
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    from: process.env.MAIL_FROM || 'PartSphere <noreply@partsphere.in>',
  },

  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  },

  platform: {
    commissionPercent: parseFloat(process.env.PLATFORM_COMMISSION_PERCENT || '15'),
    deliveryBaseFee: parseFloat(process.env.DELIVERY_BASE_FEE || '49'),
    freeDeliveryThreshold: parseFloat(process.env.FREE_DELIVERY_THRESHOLD || '999'),
    difmHomeVisitSurcharge: parseFloat(process.env.DIFM_HOME_VISIT_SURCHARGE || '199'),
  },
};

export default config;
