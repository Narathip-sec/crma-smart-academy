'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

import { DEFAULT_TAB, isValidTab, useTabStore, type TabKey } from '@/store/useTabStore'

import ActivityView from './views/ActivityView'
import ClassScheduleView from './views/ClassScheduleView'
import GradesView from './views/GradesView'
import HealthView from './views/HealthView'
import HomeView from './views/HomeView'
import MeView from './views/MeView'
import ServiceView from './views/ServiceView'

const VIEWS: Record<TabKey, React.ComponentType> = {
  home: HomeView,
  class_schedule: ClassScheduleView,
  health: HealthView,
  activity: ActivityView,
  service: ServiceView,
  grades: GradesView,
  me: MeView,
}

// TabStoreSync reads ?tab= on mount and keeps store + URL in lockstep.
// Lives inside a Suspense boundary so useSearchParams doesn't block SSR.
function TabStoreSync() {
  const params = useSearchParams()
  const router = useRouter()
  const { activeTab, setTab } = useTabStore()

  // On mount: hydrate store from URL.
  useEffect(() => {
    const raw = params.get('tab')
    const tab = isValidTab(raw) ? raw : DEFAULT_TAB
    setTab(tab)
    // Normalise URL if param was missing or invalid.
    if (raw !== tab) {
      router.replace(`/?tab=${tab}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When store changes (nav click), push to URL.
  useEffect(() => {
    const current = params.get('tab')
    if (current !== activeTab) {
      router.replace(`/?tab=${activeTab}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  return null
}

export default function AppPage() {
  const activeTab = useTabStore((s) => s.activeTab)
  const View = VIEWS[activeTab] ?? HomeView

  return (
    <>
      <Suspense>
        <TabStoreSync />
      </Suspense>
      <View />
    </>
  )
}
