import { Activity, BookOpen } from 'lucide-react'

import type { InsightItem, InsightKind } from '@/fixtures/home'

const ICON: Record<
  InsightKind,
  React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>
> = {
  fitness: Activity,
  academic: BookOpen,
}

const ICON_BG: Record<InsightKind, string> = {
  fitness: 'bg-blue-100',
  academic: 'bg-amber-100',
}

const ICON_COLOR: Record<InsightKind, string> = {
  fitness: '#2563EB', // blue-600
  academic: '#B45309', // amber-700
}

export interface SmartInsightsRowProps {
  insights: InsightItem[]
}

export function SmartInsightsRow({ insights }: SmartInsightsRowProps) {
  return (
    <div className="flex gap-3">
      {insights.map(({ id, kind, title, body }) => {
        const Icon = ICON[kind]
        return (
          <div
            key={id}
            data-testid={`insight.card.${id}`}
            className="flex-1 rounded-2xl bg-white border border-slate-100 p-4 shadow-sm"
          >
            <div
              data-testid={`insight.icon.${id}`}
              className={`h-9 w-9 flex items-center justify-center rounded-xl ${ICON_BG[kind]}`}
            >
              <Icon size={18} strokeWidth={2.2} color={ICON_COLOR[kind]} />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-900">{title}</p>
            <p className="mt-1 text-xs text-slate-500 line-clamp-2">{body}</p>
          </div>
        )
      })}
    </div>
  )
}
