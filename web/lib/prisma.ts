// Prisma 7 requires a driver adapter for direct DB connections.
// Phase 2 wires @prisma/adapter-pg with DATABASE_URL from env.
// Chassis exports the client type only so imports compile without
// pulling in a runtime adapter that has no schema models yet.

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma: PrismaClient = globalForPrisma.prisma ?? (new PrismaClient() as PrismaClient)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
