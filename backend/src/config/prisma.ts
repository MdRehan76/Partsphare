import { PrismaClient } from '@prisma/client';
import config from './env';
import inMemoryDb from './inMemoryDb';

let realPrisma: PrismaClient | null = null;

try {
  realPrisma = new PrismaClient({
    log: config.env === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (err: any) {
  console.error('❌ Failed to instantiate PrismaClient:', err.message);
}

/**
 * Actively probe database health by executing a lightweight query.
 * Returns { isConnected: boolean, error?: string }
 */
export const checkDatabaseConnection = async (): Promise<{ isConnected: boolean; error?: string }> => {
  if (config.useInMemoryDb) {
    return { isConnected: true };
  }

  if (!realPrisma) {
    return { isConnected: false, error: 'PrismaClient is not initialized' };
  }

  try {
    const probe = realPrisma.$queryRaw`SELECT 1`;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Database ping timed out after 3000ms')), 3000)
    );
    await Promise.race([probe, timeout]);
    return { isConnected: true };
  } catch (err: any) {
    return { isConnected: false, error: err.message || 'Database unreachable' };
  }
};

export const getIsRealPrismaAvailable = () => !config.useInMemoryDb;

/**
 * Primary database client:
 * - When USE_IN_MEMORY_DB=true (explicit test mode): routes to inMemoryDb
 * - By default (USE_IN_MEMORY_DB=false): exports real PrismaClient
 * 
 * NO SILENT FALLBACK: If PostgreSQL is disconnected, queries fail loudly with
 * clear errors rather than silently substituting mock data.
 */
export const prisma: any = config.useInMemoryDb ? inMemoryDb : (realPrisma as PrismaClient);

export default prisma;
