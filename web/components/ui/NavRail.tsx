'use client'

import { useRouter } from 'next/navigation'

import { NAV_TABS, useTabStore, type TabKey } from '@/store/useTabStore'

import { NAV_ICON_MAP } from './NavIcons'

// md–xl: icon-only rail (64 px wide).
// xl+: icon + label (220 px wide).
export function NavRail() {
  const activeTab = useTabStore((s) => s.activeTab)
  const setTab = useTabStore((s) => s.setTab)
  const router = useRouter()

  function navigate(key: TabKey) {
    setTab(key)
    router.replace(`/?tab=${key}`)
  }

  return (
    <nav
      aria-label="แถบนำทางด้านข้าง"
      data-testid="nav-rail"
      className="hidden md:flex flex-col items-start gap-1 pt-4 px-2 w-16 xl:w-[220px] shrink-0 border-r border-slate-200 bg-white"
    >
      {NAV_TABS.map((tab) => {
        const Icon = NAV_ICON_MAP[tab.icon as keyof typeof NAV_ICON_MAP]
        const active = activeTab === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => navigate(tab.key)}
            data-testid={`nav-rail-${tab.key}`}
            aria-label={tab.labelTh}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 w-full rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
              active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {Icon ? <Icon className="h-5 w-5 shrink-0" /> : null}
            <span className="hidden xl:block truncate">{tab.labelTh}</span>
          </button>
        )
      })}
    </nav>
  )
}
