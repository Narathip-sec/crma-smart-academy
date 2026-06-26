import { Prisma } from "@prisma/client";
import { prisma } from "./db";

export interface AuditParams {
  actorId?: string;
  action: string;       // "report.create" | "claim.approve" | "activity.moderate" etc.
  entityType?: string;  // Prisma model name
  entityId?: string;
  meta?: Prisma.JsonObject;
  ip?: string;
}

export async function writeAuditLog(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId:    params.actorId,
        action:     params.action,
        entityType: params.entityType,
        entityId:   params.entityId,
        meta:       (params.meta as Prisma.InputJsonValue) ?? undefined,
        ip:         params.ip,
      },
    });
  } catch {
    // Audit log failures must never crash the primary action.
    console.error("[audit] write failed:", params.action, params.entityId);
  }
}

export function ipFrom(req: Request): string | undefined {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    undefined
  );
}
