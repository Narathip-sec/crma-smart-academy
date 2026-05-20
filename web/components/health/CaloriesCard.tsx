import { Flame } from 'lucide-react'

export interface CaloriesCardProps {
  consumed: number
  burned: number
  goal: number
}

export function CaloriesCard({ consumed, burned, goal }: CaloriesCardProps) {
  const net = consumed - burned
  const progress = goal > 0 ? Math.min(consumed / goal, 1) : 0
  const progressPct = Math.round(progress * 100)

  return (
    <div
      data-testid="caloriescard.root"
      className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Flame size={16} strokeWidth={2} className="text-orange-500" aria-hidden="true" />
        <span className="text-xs font-semibold text-slate-500">แคลอรี</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-slate-100 mb-4">
        <div
          className="h-2 rounded-full bg-orange-400 transition-all"
          style={{ width: `${progressPct}%` }}
          role="progressbar"
          aria-valuenow={consumed}
          aria-valuemax={goal}
        />
      </div>

      <div className="flex justify-between text-center">
        <div>
          <p data-testid="caloriescard.consumed" className="text-lg font-bold text-slate-900">
            {consumed.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400">รับ (กขล.)</p>
        </div>

        <div>
          <p data-testid="caloriescard.burned" className="text-lg font-bold text-orange-500">
            {burned.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400">เผาผลาญ</p>
        </div>

        <div>
          <p data-testid="caloriescard.goal" className="text-lg font-bold text-slate-400">
            {goal.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400">เป้าหมาย</p>
        </div>

        <div>
          <p className={`text-lg font-bold ${net > goal ? 'text-red-500' : 'text-slate-900'}`}>
            {net.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400">สุทธิ</p>
        </div>
      </div>
    </div>
  )
}
