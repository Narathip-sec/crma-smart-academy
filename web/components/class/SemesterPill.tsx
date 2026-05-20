'use client'

import { ChevronDown } from 'lucide-react'

import type { SemesterOption } from '@/fixtures/schedule'

export interface SemesterPillProps {
  options: ReadonlyArray<SemesterOption>
  activeId: string
  onChange: (id: string) => void
}

// Web port of predecessor's ActionSheet-based SemesterPill.
// Uses a native <select> overlaid on the amber pill for zero-dep
// mobile-friendly semester picking (ActionSheet → native select).
export function SemesterPill({ options, activeId, onChange }: SemesterPillProps) {
  const active = options.find((o) => o.id === activeId) ?? options[0]

  return (
    <div className="relative flex-1">
      {/* Visible pill */}
      <div
        data-testid="semesterpill.pressable"
        className="flex items-center justify-between rounded-2xl bg-amber-400 px-4 py-3 cursor-pointer"
      >
        <span className="text-base font-bold text-slate-900">{active?.label ?? ''}</span>
        <span data-testid="semesterpill.chevron">
          <ChevronDown size={20} strokeWidth={2.4} className="text-slate-900" />
        </span>
      </div>
      {/* Transparent native select overlaid — receives the click */}
      <select
        aria-label="เลือกภาคเรียน"
        value={activeId}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
