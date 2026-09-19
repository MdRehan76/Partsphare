import app from './app';
import config from './config/env';
import { prisma, getIsRealPrismaAvailable } from './config/prisma';

const startServer = async () => {
  try {
    // Attempt database connection test
    await prisma.$connect();
    if (getIsRealPrismaAvailable()) {
      console.log('✅ Database connected successfully to Supabase/PostgreSQL.');
    } else {
      console.log('📦 Operating in robust in-memory database mode for development & testing.');
    }

    app.listen(config.port, () => {
      console.log(`🚀 PartSphere API server listening on http://localhost:${config.port}`);
      console.log(`   Environment: ${config.env}`);
      console.log(`   Health check: http://localhost:${config.port}/health`);
    });
  } catch (err: any) {
    console.error('❌ Server startup error:', err.message);
    process.exit(1);
  }
};

startServer();
