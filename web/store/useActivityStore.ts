'use client'

import { create } from 'zustand'

export type ActivityTab = 'events' | 'announcements'

type ActivityState = {
  activeTab: ActivityTab
  rsvpSet: Set<string>
  setTab: (tab: ActivityTab) => void
  toggleRsvp: (eventId: string) => void
}

export const useActivityStore = create<ActivityState>()((set) => ({
  activeTab: 'events',
  rsvpSet: new Set<string>(),
  setTab: (tab) => set({ activeTab: tab }),
  toggleRsvp: (eventId) =>
    set((s) => {
      const next = new Set(s.rsvpSet)
      if (next.has(eventId)) next.delete(eventId)
      else next.add(eventId)
      return { rsvpSet: next }
    }),
}))
