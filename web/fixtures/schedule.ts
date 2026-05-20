// Port of predecessor fixtures/schedule.ts — i18n keys replaced with Thai.
import type { CourseType } from '@/lib/courseTypeColor'

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri'

export const DAY_SHORT: Record<DayKey, string> = {
  mon: 'จ',
  tue: 'อ',
  wed: 'พ',
  thu: 'พฤ',
  fri: 'ศ',
}

export const DAY_LONG: Record<DayKey, string> = {
  mon: 'วันจันทร์',
  tue: 'วันอังคาร',
  wed: 'วันพุธ',
  thu: 'วันพฤหัสบดี',
  fri: 'วันศุกร์',
}

export const SCHOOL_DAYS: ReadonlyArray<DayKey> = ['mon', 'tue', 'wed', 'thu', 'fri']

export interface SemesterOption {
  id: string
  label: string
}

export const semesterFixture: ReadonlyArray<SemesterOption> = [
  { id: 'sem-68-2', label: 'ภาคเรียนที่ 2/2568' },
  { id: 'sem-68-1', label: 'ภาคเรียนที่ 1/2568' },
  { id: 'sem-67-2', label: 'ภาคเรียนที่ 2/2567' },
]

export const DEFAULT_SEMESTER_ID = 'sem-68-2'

export interface ClassItem {
  id: string
  day: DayKey
  semesterId: string
  courseCode: string
  section: string
  title: string
  type: CourseType
  startMil: string
  endMil: string
}

export const classesFixture: ReadonlyArray<ClassItem> = [
  // MON
  {
    id: 'c1',
    day: 'mon',
    semesterId: 'sem-68-2',
    courseCode: 'MS201',
    section: '128A',
    title: 'วิทยาศาสตร์การทหาร',
    type: 'MIL',
    startMil: '0700',
    endMil: '0900',
  },
  {
    id: 'c2',
    day: 'mon',
    semesterId: 'sem-68-2',
    courseCode: 'PE101',
    section: '128A',
    title: 'พลศึกษาและกีฬา',
    type: 'PT',
    startMil: '1500',
    endMil: '1700',
  },
  // TUE
  {
    id: 'c3',
    day: 'tue',
    semesterId: 'sem-68-2',
    courseCode: 'GE011',
    section: '128A',
    title: 'ทักษะภาษาไทยเพื่อการสื่อสาร',
    type: 'LECT',
    startMil: '0840',
    endMil: '1100',
  },
  {
    id: 'c4',
    day: 'tue',
    semesterId: 'sem-68-2',
    courseCode: 'CS201',
    section: '128A',
    title: 'วิทยาการคอมพิวเตอร์ประยุกต์',
    type: 'LAB',
    startMil: '1300',
    endMil: '1600',
  },
  // WED — intentionally empty (empty-state demo)
  // THU
  {
    id: 'c5',
    day: 'thu',
    semesterId: 'sem-68-2',
    courseCode: 'EN201',
    section: '128A',
    title: 'ภาษาอังกฤษเพื่อการสื่อสาร',
    type: 'LECT',
    startMil: '0900',
    endMil: '1100',
  },
  {
    id: 'c6',
    day: 'thu',
    semesterId: 'sem-68-2',
    courseCode: 'FT301',
    section: '128A',
    title: 'การฝึกภาคสนาม',
    type: 'FIELD',
    startMil: '1300',
    endMil: '1700',
  },
  // FRI
  {
    id: 'c7',
    day: 'fri',
    semesterId: 'sem-68-2',
    courseCode: 'MA201',
    section: '128A',
    title: 'คณิตศาสตร์ประยุกต์',
    type: 'LECT',
    startMil: '0800',
    endMil: '1000',
  },
]

// Return today's DayKey, or 'mon' if weekend.
export function todayKey(): DayKey {
  const dow = new Date().getDay() // 0=Sun … 6=Sat
  const MAP: Partial<Record<number, DayKey>> = { 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri' }
  return MAP[dow] ?? 'mon'
}
