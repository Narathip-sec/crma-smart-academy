const R = 40
const CX = 50
const CY = 50
const STROKE = 8
const CIRCUMFERENCE = 2 * Math.PI * R // ~251.33

export interface StepsCardProps {
  steps: number
  goal: number
}

export function StepsCard({ steps, goal }: StepsCardProps) {
  const progress = goal > 0 ? Math.min(steps / goal, 1) : 0
  const strokeDash = progress * CIRCUMFERENCE
  const isGoalReached = steps >= goal

  return (
    <div
      data-testid="stepscard.root"
      className="flex-1 rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex flex-col items-center gap-2"
    >
      <span className="text-xs font-semibold text-slate-500 self-start">ก้าวเดิน</span>

      <svg
        data-testid="stepscard.ring"
        width={100}
        height={100}
        viewBox="0 0 100 100"
        aria-label={`ก้าวเดิน ${steps} จาก ${goal}`}
      >
        {/* Track */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e2e8f0" strokeWidth={STROKE} />
        {/* Progress */}
        {progress > 0 && (
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={isGoalReached ? '#22c55e' : '#f97316'}
            strokeWidth={STROKE}
            strokeDasharray={`${strokeDash} ${CIRCUMFERENCE}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${CX} ${CY})`}
          />
        )}
        {/* Center count */}
        <text
          x={CX}
          y={CY - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-slate-900 font-bold text-lg"
          fontSize={16}
          fontWeight={700}
          fill="#0f172a"
          data-testid="stepscard.steps"
        >
          {steps.toLocaleString()}
        </text>
        <text
          x={CX}
          y={CY + 14}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fill="#94a3b8"
          data-testid="stepscard.goal"
        >
          {`/ ${goal.toLocaleString()}`}
        </text>
      </svg>

      <span
        className={`text-xs font-semibold ${isGoalReached ? 'text-green-500' : 'text-slate-400'}`}
      >
        {isGoalReached ? 'บรรลุเป้าหมาย!' : `เหลือ ${(goal - steps).toLocaleString()} ก้าว`}
      </span>
    </div>
  )
}
