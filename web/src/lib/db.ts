// Prisma singleton — avoids exhausting connections in dev with HMR.
// Production (Vercel): DATABASE_URL must be prisma+postgres:// (Accelerate).
// Local dev: plain postgres:// URL works (engine present from migrate dev).

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

function createPrismaClient(): PrismaClient {
  const base = new PrismaClient();
  if (process.env.DATABASE_URL?.startsWith("prisma+postgres://")) {
    return base.$extends(withAccelerate()) as unknown as PrismaClient;
  }
  return base;
}

type PrismaInstance = PrismaClient;

declare global {
  var __prisma: PrismaInstance | undefined;
}

export const prisma: PrismaInstance = global.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
