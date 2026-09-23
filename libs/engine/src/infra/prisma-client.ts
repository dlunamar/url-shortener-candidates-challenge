import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  __prisma?: PrismaClient;
};

/**
 * Shared PrismaClient. The `globalThis` guard prevents exhausting
 * connections when modules reload (dev HMR, SSR per-request evaluation).
 */
export const prisma: PrismaClient =
  globalForPrisma.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
