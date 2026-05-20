// Duty roster lookup. Phase 9 returns a hardcoded fixture so the cron
// reminder route + LINE multicast push can be exercised end-to-end
// without the Prisma DutyShift model (Phase 10 wires the real table +
// RBAC-gated mutations per CLAUDE.md hard constraints).

export type DutyShift = '00-06' | '06-12' | '12-18' | '18-24'

export interface DutyCadet {
  cadetId: string
  lineUserId: string
  displayName: string
  shift: DutyShift
}

const FIXTURE: ReadonlyArray<DutyCadet> = [
  { cadetId: 'CDT-001', lineUserId: 'Uabc001', displayName: 'Narathip Chetjai', shift: '00-06' },
  { cadetId: 'CDT-002', lineUserId: 'Uabc002', displayName: 'Krit Siriporn', shift: '06-12' },
  { cadetId: 'CDT-003', lineUserId: 'Uabc003', displayName: 'Wichai Boonmak', shift: '12-18' },
  { cadetId: 'CDT-004', lineUserId: 'Uabc004', displayName: 'Panya Rodjan', shift: '18-24' },
]

export async function getDutyCadetsForDate(_date: string): Promise<ReadonlyArray<DutyCadet>> {
  return FIXTURE
}
