'use client'

import { create } from 'zustand'

export const TAB_KEYS = [
  'home',
  'class_schedule',
  'health',
  'activity',
  'service',
  'grades',
  'me',
] as const
export type TabKey = (typeof TAB_KEYS)[number]

export const DEFAULT_TAB: TabKey = 'home'

// Bottom nav items (phone). Service/grades reachable via URL or within views.
export const NAV_TABS = [
  { key: 'home' as TabKey, labelTh: 'หน้าหลัก', icon: 'home' },
  { key: 'class_schedule' as TabKey, labelTh: 'ตารางเรียน', icon: 'calendar' },
  { key: 'health' as TabKey, labelTh: 'สุขภาพ', icon: 'heart' },
  { key: 'activity' as TabKey, labelTh: 'กิจกรรม', icon: 'bolt' },
  { key: 'me' as TabKey, labelTh: 'ฉัน', icon: 'user' },
]

type TabState = {
  activeTab: TabKey
  setTab: (tab: TabKey) => void
}

export const useTabStore = create<TabState>()((set) => ({
  activeTab: DEFAULT_TAB,
  setTab: (tab) => set({ activeTab: tab }),
}))

export function isValidTab(v: unknown): v is TabKey {
  return TAB_KEYS.includes(v as TabKey)
}
