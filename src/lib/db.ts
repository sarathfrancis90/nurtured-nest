import { PrismaClient } from '@prisma/client';

const globalThisForPrisma = globalThis as unknown as {
  __prisma?: PrismaClient;
};

export const prisma =
  globalThisForPrisma.__prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThisForPrisma.__prisma = prisma;
}
