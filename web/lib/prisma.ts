import 'server-only'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// Lazy singleton. Prisma 7 requires a driver adapter at construction
// time, but we don't want module import to fail in unit tests that
// never run a query (those tests pass a mock via dependency injection,
// e.g. `createAudit({ prisma: mock })`). The Proxy below defers
// construction until the first property access.

const globalForPrisma = globalThis as unknown as { _prismaSingleton?: PrismaClient }

function buildClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL is required. In unit tests, inject a mock prisma via the lib factories instead of using the singleton.',
    )
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })
}

function getClient(): PrismaClient {
  if (globalForPrisma._prismaSingleton) return globalForPrisma._prismaSingleton
  const client = buildClient()
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma._prismaSingleton = client
  }
  return client
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver)
  },
})
