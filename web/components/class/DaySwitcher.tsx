'use client'

import { DAY_LONG, DAY_SHORT, type DayKey } from '@/fixtures/schedule'

export interface DaySwitcherProps {
  days: ReadonlyArray<DayKey>
  active: DayKey
  onChange: (next: DayKey) => void
}

export function DaySwitcher({ days, active, onChange }: DaySwitcherProps) {
  return (
    <div data-testid="dayswitcher.root" className="rounded-3xl bg-slate-800 px-2 py-3">
      <div className="flex justify-around">
        {days.map((day) => {
          const isActive = day === active
          return (
            <button
              key={day}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-testid={`dayswitcher.tab.${day}`}
              aria-label={DAY_LONG[day]}
              onClick={() => onChange(day)}
              className={`px-4 py-2 text-base font-bold transition-colors ${
                isActive
                  ? 'rounded-full bg-amber-400 text-slate-900'
                  : 'text-slate-400 font-semibold'
              }`}
            >
              {DAY_SHORT[day]}
            </button>
          )
        })}
      </div>
      <p
        data-testid="dayswitcher.label"
        className="mt-3 text-center text-sm font-bold tracking-widest text-white"
      >
        {DAY_LONG[active]}
      </p>
    </div>
  )
}
