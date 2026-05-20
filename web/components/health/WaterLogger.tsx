import { Droplets, Minus, Plus } from 'lucide-react'

export interface WaterLoggerProps {
  cups: number
  goal: number
  onAdd: () => void
  onRemove: () => void
}

export function WaterLogger({ cups, goal, onAdd, onRemove }: WaterLoggerProps) {
  return (
    <div
      data-testid="waterlogger.root"
      className="flex-1 rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex flex-col gap-3"
    >
      <span className="text-xs font-semibold text-slate-500">น้ำดื่ม</span>

      <div className="flex items-center justify-center gap-1 flex-wrap">
        {Array.from({ length: goal }).map((_, i) => (
          <Droplets
            key={i}
            size={18}
            strokeWidth={2}
            className={i < cups ? 'text-blue-400' : 'text-slate-200'}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          data-testid="waterlogger.remove"
          aria-label="ลดน้ำ"
          onClick={onRemove}
          disabled={cups <= 0}
          className="rounded-full w-8 h-8 flex items-center justify-center bg-slate-100 disabled:opacity-40"
        >
          <Minus size={14} strokeWidth={2.5} className="text-slate-700" />
        </button>

        <span data-testid="waterlogger.cups" className="text-lg font-bold text-slate-900">
          {cups}
          <span className="text-xs font-normal text-slate-400 ml-1">/ {goal} แก้ว</span>
        </span>

        <button
          type="button"
          data-testid="waterlogger.add"
          aria-label="เพิ่มน้ำ"
          onClick={onAdd}
          disabled={cups >= 12}
          className="rounded-full w-8 h-8 flex items-center justify-center bg-blue-50 disabled:opacity-40"
        >
          <Plus size={14} strokeWidth={2.5} className="text-blue-500" />
        </button>
      </div>
    </div>
  )
}
