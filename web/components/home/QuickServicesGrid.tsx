'use client'

import { GraduationCap, HeartPulse, IdCard, UtensilsCrossed } from 'lucide-react'

import type { QuickServiceItem, QuickServiceKey } from '@/fixtures/home'

const ICON: Record<
  QuickServiceKey,
  React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>
> = {
  class: GraduationCap,
  meal: UtensilsCrossed,
  health: HeartPulse,
  cadet_id: IdCard,
}

export interface QuickServicesGridProps {
  items: QuickServiceItem[]
  onPress?: (key: QuickServiceKey) => void
}

export function QuickServicesGrid({ items, onPress }: QuickServicesGridProps) {
  return (
    <div className="flex justify-between">
      {items.map(({ key, label }) => {
        const Icon = ICON[key]
        return (
          <div key={key} className="flex flex-col items-center" style={{ width: '23%' }}>
            <button
              type="button"
              data-testid={`quick.tile.${key}`}
              aria-label={label}
              onClick={() => onPress?.(key)}
              className="aspect-square w-full flex items-center justify-center rounded-2xl bg-slate-900"
            >
              <Icon size={22} strokeWidth={2.2} color="#FFFFFF" />
            </button>
            <span className="mt-2 text-xs font-medium text-slate-700 text-center">{label}</span>
          </div>
        )
      })}
    </div>
  )
}
