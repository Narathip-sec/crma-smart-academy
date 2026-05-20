'use client'

import { create } from 'zustand'

import { DEFAULT_SEMESTER_ID, todayKey, type DayKey } from '@/fixtures/schedule'

type ScheduleState = {
  activeSemesterId: string
  activeDay: DayKey
  setSemester: (id: string) => void
  setDay: (day: DayKey) => void
}

export const useScheduleStore = create<ScheduleState>()((set) => ({
  activeSemesterId: DEFAULT_SEMESTER_ID,
  activeDay: todayKey(),
  setSemester: (id) => set({ activeSemesterId: id }),
  setDay: (day) => set({ activeDay: day }),
}))
