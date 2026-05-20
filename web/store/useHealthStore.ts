'use client'

import { create } from 'zustand'

import { healthWeekFixture, TODAY_HEALTH_DATE } from '@/fixtures/health'

type HealthState = {
  selectedDate: string
  waterCups: number
  setSelectedDate: (date: string) => void
  addWaterCup: () => void
  removeWaterCup: () => void
}

const cupsForDate = (date: string): number =>
  healthWeekFixture.find((d) => d.date === date)?.waterCups ?? 0

export const useHealthStore = create<HealthState>()((set) => ({
  selectedDate: TODAY_HEALTH_DATE,
  waterCups: cupsForDate(TODAY_HEALTH_DATE),
  setSelectedDate: (date) => set({ selectedDate: date, waterCups: cupsForDate(date) }),
  addWaterCup: () => set((s) => ({ waterCups: Math.min(s.waterCups + 1, 12) })),
  removeWaterCup: () => set((s) => ({ waterCups: Math.max(s.waterCups - 1, 0) })),
}))
