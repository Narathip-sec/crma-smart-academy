import 'server-only'

import { Prisma } from '@prisma/client'

import { prisma as defaultPrisma } from '@/lib/prisma'

import type { AuditResult, PrismaClient } from '@prisma/client'

export type AuditEntry = {
  userId: string | null
  action: string
  resource: string
  result?: AuditResult
  ip?: string | null
  userAgent?: string | null
  metadata?: Prisma.InputJsonValue
}

type AuditClient = Pick<PrismaClient, 'auditLog'>

export function createAudit(deps: { prisma: AuditClient }) {
  return async function audit(entry: AuditEntry): Promise<void> {
    try {
      await deps.prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          result: entry.result ?? 'ALLOW',
          ip: entry.ip ?? null,
          userAgent: entry.userAgent ?? null,
          metadata: entry.metadata ?? Prisma.JsonNull,
        },
      })
    } catch (err) {
      // Audit failure MUST NOT break the request, but it must be loud
      // so the operator notices missing rows. See CLAUDE.md hard
      // constraint: every API mutation writes one AuditLog row.
      console.error('[audit] failed to write row', { entry, err })
    }
  }
}

export const audit = createAudit({ prisma: defaultPrisma })
