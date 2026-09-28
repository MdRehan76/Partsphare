import { PrismaClient } from '@prisma/client';
import config from './env';
import inMemoryDb from './inMemoryDb';

let realPrisma: PrismaClient | null = null;

const getNormalizedDatabaseUrl = (): string | undefined => {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;
  
  // If connecting to Supabase pooler on port 5432 (session mode limit: 15), upgrade to port 6543 (transaction mode PgBouncer)
  if (rawUrl.includes('pooler.supabase.com:5432')) {
    let upgraded = rawUrl.replace('pooler.supabase.com:5432', 'pooler.supabase.com:6543');
    if (!upgraded.includes('pgbouncer=true')) {
      const sep = upgraded.includes('?') ? '&' : '?';
      upgraded = `${upgraded}${sep}pgbouncer=true&connection_limit=10`;
    }
    return upgraded;
  }
  return rawUrl;
};

try {
  const datasourceUrl = getNormalizedDatabaseUrl();
  realPrisma = new PrismaClient({
    ...(datasourceUrl && { datasourceUrl }),
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
 * - By default: routes to real PrismaClient (PostgreSQL), and proxies extended/mock-only
 *   entities (such as shopJob, shopDelivery, usedPartIntake, cODReconciliation) to inMemoryDb
 *   so runtime calls never throw "Cannot read properties of undefined (reading 'findMany')".
 */
const createPrismaProxy = () => {
  if (config.useInMemoryDb) return inMemoryDb;
  if (!realPrisma) return inMemoryDb;

  return new Proxy(realPrisma, {
    get(target: any, prop: string | symbol) {
      if (prop in target) {
        return target[prop];
      }
      if (inMemoryDb && prop in inMemoryDb) {
        return (inMemoryDb as any)[prop];
      }
      return undefined;
    },
  });
};

export const prisma: any = createPrismaProxy();

export default prisma;

