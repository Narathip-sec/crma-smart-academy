// Port 1:1 from predecessor app/src/lib/courseTypeColor.ts
export type CourseType = 'LECT' | 'LAB' | 'MIL' | 'PT' | 'FIELD'

export interface CourseTypeColor {
  bar: string
  badge: string
}

const MAP: Record<CourseType, CourseTypeColor> = {
  LECT: { bar: 'bg-blue-500', badge: 'text-blue-500' },
  LAB: { bar: 'bg-green-500', badge: 'text-green-500' },
  MIL: { bar: 'bg-red-500', badge: 'text-red-500' },
  PT: { bar: 'bg-orange-500', badge: 'text-orange-500' },
  FIELD: { bar: 'bg-amber-500', badge: 'text-amber-500' },
}

export function courseTypeColor(type: CourseType): CourseTypeColor {
  return MAP[type]
}

// Thai label per type — used instead of i18n in Phase 5
export const COURSE_TYPE_LABEL: Record<CourseType, string> = {
  LECT: 'บรรยาย',
  LAB: 'ปฏิบัติ',
  MIL: 'ทหาร',
  PT: 'พลศึกษา',
  FIELD: 'ภาคสนาม',
}
