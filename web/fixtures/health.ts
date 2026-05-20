// Port of predecessor fixtures/health.ts — i18n keys replaced with Thai.

export type WeekDayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export const DAY_SHORT_HEALTH: Record<WeekDayKey, string> = {
  mon: 'จ',
  tue: 'อ',
  wed: 'พ',
  thu: 'พฤ',
  fri: 'ศ',
  sat: 'ส',
  sun: 'อา',
}

export const WEEK_DAYS: ReadonlyArray<WeekDayKey> = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
]

export interface HealthDay {
  dayKey: WeekDayKey
  date: string // 'YYYY-MM-DD'
  steps: number
  stepsGoal: number
  waterCups: number
  waterGoal: number
  caloriesConsumed: number
  caloriesBurned: number
  caloriesGoal: number
}

export type ActivityType = 'RUN' | 'WALK' | 'PT' | 'SWIM' | 'SPORT' | 'DRILL'

export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  RUN: 'วิ่ง',
  WALK: 'เดิน',
  PT: 'ฝึกกาย',
  SWIM: 'ว่ายน้ำ',
  SPORT: 'กีฬา',
  DRILL: 'ฝึกแถว',
}

export interface ActivityEntry {
  id: string
  date: string // 'YYYY-MM-DD'
  time: string // 'HH:mm'
  type: ActivityType
  label: string
  durationMin: number
  caloriesBurned: number
}

// Reference date: 2026-05-20 (Wednesday = wed)
export const TODAY_HEALTH_DATE = '2026-05-20'

export const healthWeekFixture: ReadonlyArray<HealthDay> = [
  {
    dayKey: 'mon',
    date: '2026-05-18',
    steps: 8200,
    stepsGoal: 10000,
    waterCups: 6,
    waterGoal: 8,
    caloriesConsumed: 1800,
    caloriesBurned: 420,
    caloriesGoal: 2200,
  },
  {
    dayKey: 'tue',
    date: '2026-05-19',
    steps: 9500,
    stepsGoal: 10000,
    waterCups: 7,
    waterGoal: 8,
    caloriesConsumed: 2100,
    caloriesBurned: 580,
    caloriesGoal: 2200,
  },
  {
    dayKey: 'wed',
    date: '2026-05-20',
    steps: 4100,
    stepsGoal: 10000,
    waterCups: 3,
    waterGoal: 8,
    caloriesConsumed: 1200,
    caloriesBurned: 210,
    caloriesGoal: 2200,
  },
  {
    dayKey: 'thu',
    date: '2026-05-21',
    steps: 0,
    stepsGoal: 10000,
    waterCups: 0,
    waterGoal: 8,
    caloriesConsumed: 0,
    caloriesBurned: 0,
    caloriesGoal: 2200,
  },
  {
    dayKey: 'fri',
    date: '2026-05-22',
    steps: 0,
    stepsGoal: 10000,
    waterCups: 0,
    waterGoal: 8,
    caloriesConsumed: 0,
    caloriesBurned: 0,
    caloriesGoal: 2200,
  },
  {
    dayKey: 'sat',
    date: '2026-05-23',
    steps: 0,
    stepsGoal: 10000,
    waterCups: 0,
    waterGoal: 8,
    caloriesConsumed: 0,
    caloriesBurned: 0,
    caloriesGoal: 2200,
  },
  {
    dayKey: 'sun',
    date: '2026-05-24',
    steps: 0,
    stepsGoal: 10000,
    waterCups: 0,
    waterGoal: 8,
    caloriesConsumed: 0,
    caloriesBurned: 0,
    caloriesGoal: 2200,
  },
]

export const activitiesFixture: ReadonlyArray<ActivityEntry> = [
  {
    id: 'act1',
    date: '2026-05-20',
    time: '06:00',
    type: 'PT',
    label: 'ฝึกกายบริหาร',
    durationMin: 45,
    caloriesBurned: 180,
  },
  {
    id: 'act2',
    date: '2026-05-19',
    time: '17:30',
    type: 'RUN',
    label: 'วิ่งสนามฝึก',
    durationMin: 30,
    caloriesBurned: 280,
  },
  {
    id: 'act3',
    date: '2026-05-18',
    time: '07:00',
    type: 'DRILL',
    label: 'ฝึกแถวสนาม',
    durationMin: 60,
    caloriesBurned: 200,
  },
]
