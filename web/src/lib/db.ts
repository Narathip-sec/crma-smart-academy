// Prisma singleton — avoids exhausting connections in dev with HMR.
// Uses Prisma Accelerate (Prisma Postgres). DATABASE_URL must be a
// prisma+postgres:// connection string. Queries are routed over HTTP,
// so the client is generated with `--no-engine` (see package.json build).

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const createPrismaClient = () => new PrismaClient().$extends(withAccelerate());

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

declare global {
  var __prisma: ExtendedPrismaClient | undefined;
}

export const prisma: ExtendedPrismaClient =
  global.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
