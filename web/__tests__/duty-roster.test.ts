// @vitest-environment node
import { describe, expect, test } from 'vitest'

import { getDutyCadetsForDate } from '@/lib/duty-roster'

describe('getDutyCadetsForDate', () => {
  test('returns 4 fixture cadets', async () => {
    const cadets = await getDutyCadetsForDate('2026-05-20')
    expect(cadets).toHaveLength(4)
  })

  test('each cadet has cadetId, lineUserId, displayName, shift', async () => {
    const cadets = await getDutyCadetsForDate('2026-05-20')
    for (const c of cadets) {
      expect(c.cadetId).toMatch(/^CDT-/)
      expect(c.lineUserId).toMatch(/^U/)
      expect(c.displayName.length).toBeGreaterThan(0)
      expect(['00-06', '06-12', '12-18', '18-24']).toContain(c.shift)
    }
  })

  test('covers all 4 shifts', async () => {
    const cadets = await getDutyCadetsForDate('2026-05-20')
    const shifts = new Set(cadets.map((c) => c.shift))
    expect(shifts.size).toBe(4)
  })
})
