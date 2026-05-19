import 'server-only'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const url = process.env.DATABASE_URL

if (!url && process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_URL is required in production')
}

const adapter = url ? new PrismaPg({ connectionString: url }) : null

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? (adapter ? new PrismaClient({ adapter }) : new PrismaClient())

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
