import { Lock } from 'lucide-react'

export function LockedNotice() {
  return (
    <div
      data-testid="lockednotice.root"
      className="flex flex-col items-center justify-center gap-3 py-12 rounded-2xl bg-white border border-slate-100 shadow-sm"
    >
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
        <Lock size={28} strokeWidth={1.5} className="text-slate-400" aria-hidden="true" />
      </div>
      <div className="text-center">
        <p data-testid="lockednotice.message" className="text-sm font-semibold text-slate-700">
          ผลการเรียนยังไม่เปิดเผย
        </p>
        <p className="text-xs text-slate-400 mt-1">รอประกาศเกรดอย่างเป็นทางการ</p>
      </div>
    </div>
  )
}
