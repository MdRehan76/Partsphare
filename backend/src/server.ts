import app from './app';
import config from './config/env';
import { checkDatabaseConnection, getIsRealPrismaAvailable } from './config/prisma';

const startServer = async () => {
  try {
    // Probe database connection on boot
    const dbStatus = await checkDatabaseConnection();
    if (dbStatus.isConnected) {
      if (getIsRealPrismaAvailable()) {
        console.log('✅ PostgreSQL / Supabase database connected successfully.');
      } else {
        console.log('🧪 Operating in test in-memory database mode (USE_IN_MEMORY_DB=true).');
      }
    } else {
      console.warn('⚠️ WARNING: PostgreSQL database is NOT connected.');
      console.warn(`   Error: ${dbStatus.error}`);
      console.warn('   Please check DATABASE_URL in backend/.env to establish connection.');
      console.warn('   GET /api/health will report database: "disconnected".');
    }

    app.listen(config.port, () => {
      console.log(`🚀 PartNexa API server listening on http://localhost:${config.port}`);
      console.log(`   Environment: ${config.env}`);
      console.log(`   Database Status: ${dbStatus.isConnected ? (getIsRealPrismaAvailable() ? 'PostgreSQL Connected' : 'In-Memory (Test)') : 'Disconnected'}`);
      console.log(`   Health check: http://localhost:${config.port}/api/health`);
    });
  } catch (err: any) {
    console.error('❌ Server startup error:', err.message);
    process.exit(1);
  }
};

startServer();
