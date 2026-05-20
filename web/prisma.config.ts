import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import dotenv from 'dotenv'
import { defineConfig } from 'prisma/config'

// Load .env.local (Next.js dev convention) before .env so local
// overrides win — matches Next's own loading order.
for (const file of ['.env.local', '.env']) {
  const path = resolve(process.cwd(), file)
  if (existsSync(path)) dotenv.config({ path, override: false })
}

// Prisma CLI (migrate / generate / db pull) prefers DIRECT_URL when set:
// Supabase's transaction pooler (DATABASE_URL on port 6543) does not
// support session-mode features like advisory locks that `prisma migrate`
// requires. DIRECT_URL points at the session pooler / direct port 5432.
// Runtime queries still use DATABASE_URL via @prisma/adapter-pg
// (see lib/prisma.ts).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
})
