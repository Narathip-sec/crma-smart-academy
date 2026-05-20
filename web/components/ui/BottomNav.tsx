'use client'

import { useRouter } from 'next/navigation'

import { NAV_TABS, useTabStore, type TabKey } from '@/store/useTabStore'

import { NAV_ICON_MAP } from './NavIcons'

// LIFF quirk: 100dvh accounts for LINE in-app webview chrome.
// env(safe-area-inset-bottom) adds iPhone home-indicator padding.
export function BottomNav() {
  const activeTab = useTabStore((s) => s.activeTab)
  const setTab = useTabStore((s) => s.setTab)
  const router = useRouter()

  function navigate(key: TabKey) {
    setTab(key)
    router.replace(`/?tab=${key}`)
  }

  return (
    <nav
      aria-label="แถบนำทางหลัก"
      data-testid="bottom-nav"
      className="fixed bottom-0 inset-x-0 z-40 flex items-stretch bg-white border-t border-slate-200 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV_TABS.map((tab) => {
        const Icon = NAV_ICON_MAP[tab.icon as keyof typeof NAV_ICON_MAP]
        const active = activeTab === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => navigate(tab.key)}
            data-testid={`bottom-nav-${tab.key}`}
            aria-label={tab.labelTh}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
              active ? 'text-emerald-600' : 'text-slate-500'
            }`}
          >
            {Icon ? <Icon className="h-5 w-5" /> : null}
            <span>{tab.labelTh}</span>
          </button>
        )
      })}
    </nav>
  )
}
