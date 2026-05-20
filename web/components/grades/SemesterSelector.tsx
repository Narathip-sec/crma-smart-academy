import type { SemesterGrade } from '@/fixtures/grades'

export interface SemesterSelectorProps {
  options: ReadonlyArray<Pick<SemesterGrade, 'semesterId' | 'label'>>
  activeId: string
  onChange: (id: string) => void
}

export function SemesterSelector({ options, activeId, onChange }: SemesterSelectorProps) {
  return (
    <div data-testid="semesterselector.root" className="relative inline-flex items-center">
      <span
        data-testid="semesterselector.label"
        className="pointer-events-none absolute left-4 text-sm font-semibold text-slate-900"
      >
        {options.find((o) => o.semesterId === activeId)?.label ?? ''}
      </span>
      <select
        data-testid="semesterselector.select"
        value={activeId}
        onChange={(e) => onChange(e.target.value)}
        aria-label="เลือกภาคเรียน"
        className="appearance-none bg-slate-100 rounded-full pl-4 pr-8 py-2 text-sm font-semibold text-transparent cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.semesterId} value={o.semesterId}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-slate-500 text-xs">▾</span>
    </div>
  )
}
