export interface StatsRowProps {
  gpa: number
  pftScore: number
  credits: number
}

interface StatCellProps {
  testId: string
  value: string
  label: string
}

function StatCell({ testId, value, label }: StatCellProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span data-testid={testId} className="text-xl font-bold text-slate-900">
        {value}
      </span>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  )
}

export function StatsRow({ gpa, pftScore, credits }: StatsRowProps) {
  return (
    <div
      data-testid="statsrow.root"
      className="flex items-center justify-around rounded-2xl bg-white border border-slate-100 shadow-sm py-4"
    >
      <StatCell testId="statsrow.gpa" value={gpa.toFixed(2)} label="เกรดเฉลี่ย" />
      <div className="w-px h-10 bg-slate-100" />
      <StatCell testId="statsrow.pft" value={String(pftScore)} label="คะแนน PFT" />
      <div className="w-px h-10 bg-slate-100" />
      <StatCell testId="statsrow.credits" value={String(credits)} label="หน่วยกิต" />
    </div>
  )
}
