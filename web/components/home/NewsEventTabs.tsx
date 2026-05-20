'use client'

import { useState } from 'react'

import type { FeedItem } from '@/fixtures/home'

export type FeedTab = 'news' | 'event'

export interface NewsEventTabsProps {
  news: FeedItem[]
  events: FeedItem[]
  initialTab?: FeedTab
  onViewAll?: (tab: FeedTab) => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <div
      data-testid={`newsevent.card.${item.id}`}
      className="mt-4 rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm"
    >
      <img
        src={item.imageUri}
        alt={item.title}
        className="h-44 w-full object-cover bg-slate-200"
        loading="lazy"
      />
      <div className="p-4">
        <p className="text-base font-bold text-slate-900 line-clamp-2">{item.title}</p>
        <p className="mt-1 text-xs text-slate-500">{formatDate(item.dateISO)}</p>
        <button
          type="button"
          aria-label={`อ่านเพิ่มเติม: ${item.title}`}
          className="mt-3 text-xs font-bold text-amber-600"
        >
          อ่านเพิ่มเติม
        </button>
      </div>
    </div>
  )
}

export function NewsEventTabs({
  news,
  events,
  initialTab = 'news',
  onViewAll,
}: NewsEventTabsProps) {
  const [active, setActive] = useState<FeedTab>(initialTab)
  const items = active === 'news' ? news : events

  return (
    <div>
      <div className="flex border-b border-slate-100">
        {(['news', 'event'] as const).map((tab) => {
          const isActive = active === tab
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-testid={`newsevent.tab.${tab}`}
              onClick={() => setActive(tab)}
              className="pb-2 mr-6"
            >
              <span
                className={`text-base font-bold ${isActive ? 'text-slate-900' : 'text-slate-400'}`}
              >
                {tab === 'news' ? 'ข่าว' : 'กิจกรรม'}
              </span>
              {isActive ? <div className="mt-0.5 h-0.5 w-full rounded-full bg-slate-900" /> : null}
            </button>
          )
        })}
      </div>

      {items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-900 flex-1 mr-3 truncate">ความรู้นอกห้องเรียน</p>
        <button
          type="button"
          data-testid="newsevent.view_all"
          onClick={() => onViewAll?.(active)}
          className="text-sm font-bold text-amber-600 shrink-0"
        >
          ดูทั้งหมด
        </button>
      </div>
    </div>
  )
}
