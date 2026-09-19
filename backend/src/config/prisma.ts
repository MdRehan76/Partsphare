import { PrismaClient } from '@prisma/client';
import config from './env';
import inMemoryDb from './inMemoryDb';

let isRealPrismaAvailable = false;
let realPrisma: PrismaClient | null = null;

try {
  realPrisma = new PrismaClient({
    log: config.env === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (err: any) {
  console.warn('⚠️ Could not initialize PrismaClient, using in-memory database store.');
}

export const setRealPrismaAvailable = (available: boolean) => {
  isRealPrismaAvailable = available;
};

export const getIsRealPrismaAvailable = () => isRealPrismaAvailable;

// Smart Proxy that routes calls to real Prisma or inMemoryDb seamlessly
export const prisma: any = new Proxy(
  {},
  {
    get(_target, prop: string) {
      if (prop === '$connect') {
        return async () => {
          if (realPrisma) {
            try {
              await realPrisma.$connect();
              isRealPrismaAvailable = true;
              console.log('✅ Real Database connected successfully.');
              return;
            } catch (err: any) {
              isRealPrismaAvailable = false;
              console.warn('⚠️ Prisma database connection failed, activating in-memory store:', err.message);
              return;
            }
          }
          isRealPrismaAvailable = false;
        };
      }

      if (prop === '$disconnect') {
        return async () => {
          if (realPrisma && isRealPrismaAvailable) {
            return realPrisma.$disconnect();
          }
        };
      }

      if (prop === '$transaction') {
        return async (fn: any) => {
          if (isRealPrismaAvailable && realPrisma) {
            try {
              return await realPrisma.$transaction(fn);
            } catch (err) {
              return inMemoryDb.$transaction(fn);
            }
          }
          return inMemoryDb.$transaction(fn);
        };
      }

      const realModel = realPrisma ? (realPrisma as any)[prop] : null;
      const memModel = (inMemoryDb as any)[prop];

      if (!isRealPrismaAvailable || !realModel) {
        return memModel;
      }

      return new Proxy(realModel, {
        get(target, method: string) {
          const originalMethod = target[method];
          if (typeof originalMethod !== 'function') return originalMethod;

          return async (...args: any[]) => {
            if (!isRealPrismaAvailable) {
              return memModel?.[method]?.(...args);
            }
            try {
              return await originalMethod.apply(target, args);
            } catch (error: any) {
              if (
                error.code?.startsWith('P1') ||
                error.name === 'PrismaClientInitializationError' ||
                error.name === 'PrismaClientKnownRequestError' ||
                error.message?.includes('Can\'t reach database server')
              ) {
                console.warn(`⚠️ Prisma query failed on ${prop}.${method}, falling back to inMemoryDb`);
                isRealPrismaAvailable = false;
                if (memModel && typeof memModel[method] === 'function') {
                  return memModel[method](...args);
                }
              }
              throw error;
            }
          };
        },
      });
    },
  }
);

export default prisma;
