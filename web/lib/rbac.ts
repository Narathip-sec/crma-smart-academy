import type { Role } from '@prisma/client'

const STAFF_PLUS: readonly Role[] = ['INSTRUCTOR', 'OFFICER', 'ADMIN']
const OFFICER_PLUS: readonly Role[] = ['OFFICER', 'ADMIN']

export function isStaffPlus(role: Role): boolean {
  return STAFF_PLUS.includes(role)
}

export function isOfficerPlus(role: Role): boolean {
  return OFFICER_PLUS.includes(role)
}

/**
 * Locked semesters return false for every role. Per-row ownership
 * (cadets see only their own enrollment, instructors see their cohort)
 * is enforced at the route layer, not here.
 */
export function canViewGrades(_role: Role, semesterIsLocked: boolean): boolean {
  if (semesterIsLocked) return false
  return true
}

export function canEditRoster(role: Role): boolean {
  return isOfficerPlus(role)
}

export function canPublishAnnouncement(role: Role): boolean {
  return isStaffPlus(role)
}

export function canEditEnrollment(role: Role): boolean {
  return role === 'ADMIN'
}

/**
 * Phase 10 — Audit log export is ADMIN-only (compliance review).
 * Each export call writes its own AuditLog row tagged ADMIN:audit_export.
 */
export function canExportAudit(role: Role): boolean {
  return role === 'ADMIN'
}
