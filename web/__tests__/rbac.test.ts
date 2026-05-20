// @vitest-environment node
import { describe, expect, test } from 'vitest'

import {
  canEditEnrollment,
  canEditRoster,
  canExportAudit,
  canPublishAnnouncement,
  canViewGrades,
  isOfficerPlus,
  isStaffPlus,
} from '@/lib/rbac'

import type { Role } from '@prisma/client'

const ROLES: readonly Role[] = ['CADET', 'INSTRUCTOR', 'OFFICER', 'ADMIN'] as const

describe('rbac — canViewGrades', () => {
  test('locked semester denies everyone', () => {
    for (const role of ROLES) {
      expect(canViewGrades(role, true)).toBe(false)
    }
  })

  test('unlocked semester allows every role', () => {
    for (const role of ROLES) {
      expect(canViewGrades(role, false)).toBe(true)
    }
  })
})

describe('rbac — canEditRoster (OFFICER+ only)', () => {
  test.each([
    ['CADET', false],
    ['INSTRUCTOR', false],
    ['OFFICER', true],
    ['ADMIN', true],
  ] as const)('%s -> %s', (role, expected) => {
    expect(canEditRoster(role)).toBe(expected)
  })
})

describe('rbac — canPublishAnnouncement (INSTRUCTOR+ only)', () => {
  test.each([
    ['CADET', false],
    ['INSTRUCTOR', true],
    ['OFFICER', true],
    ['ADMIN', true],
  ] as const)('%s -> %s', (role, expected) => {
    expect(canPublishAnnouncement(role)).toBe(expected)
  })
})

describe('rbac — canEditEnrollment (ADMIN only)', () => {
  test.each([
    ['CADET', false],
    ['INSTRUCTOR', false],
    ['OFFICER', false],
    ['ADMIN', true],
  ] as const)('%s -> %s', (role, expected) => {
    expect(canEditEnrollment(role)).toBe(expected)
  })
})

describe('rbac — canExportAudit (ADMIN only)', () => {
  test.each([
    ['CADET', false],
    ['INSTRUCTOR', false],
    ['OFFICER', false],
    ['ADMIN', true],
  ] as const)('%s -> %s', (role, expected) => {
    expect(canExportAudit(role)).toBe(expected)
  })
})

describe('rbac — role tier helpers', () => {
  test.each([
    ['CADET', false],
    ['INSTRUCTOR', true],
    ['OFFICER', true],
    ['ADMIN', true],
  ] as const)('isStaffPlus(%s) -> %s', (role, expected) => {
    expect(isStaffPlus(role)).toBe(expected)
  })

  test.each([
    ['CADET', false],
    ['INSTRUCTOR', false],
    ['OFFICER', true],
    ['ADMIN', true],
  ] as const)('isOfficerPlus(%s) -> %s', (role, expected) => {
    expect(isOfficerPlus(role)).toBe(expected)
  })
})
