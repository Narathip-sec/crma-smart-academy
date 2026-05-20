import type { ActivityTab } from '@/store/useActivityStore'

const TABS: { key: ActivityTab; label: string }[] = [
  { key: 'events', label: 'กิจกรรม' },
  { key: 'announcements', label: 'ประกาศ' },
]

export interface TopTabsProps {
  active: ActivityTab
  onChange: (tab: ActivityTab) => void
}

export function TopTabs({ active, onChange }: TopTabsProps) {
  return (
    <div
      data-testid="toptabs.root"
      role="tablist"
      aria-label="เลือกหมวดหมู่"
      className="flex gap-2"
    >
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          role="tab"
          data-testid={`toptabs.tab.${key}`}
          aria-selected={active === key}
          onClick={() => onChange(key)}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
            active === key
              ? 'bg-orange-500 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
