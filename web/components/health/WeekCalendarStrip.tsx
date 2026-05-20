import { DAY_SHORT_HEALTH, type HealthDay } from '@/fixtures/health'

const R = 16
const CX = 22
const CY = 22
const STROKE = 3
const CIRCUMFERENCE = 2 * Math.PI * R // ~100.53

function stepRingColor(steps: number, goal: number): string {
  if (steps === 0) return 'text-slate-300'
  if (steps >= goal) return 'text-green-500'
  return 'text-orange-400'
}

export interface WeekCalendarStripProps {
  days: ReadonlyArray<HealthDay>
  selectedDate: string
  onSelectDate: (date: string) => void
}

export function WeekCalendarStrip({ days, selectedDate, onSelectDate }: WeekCalendarStripProps) {
  return (
    <div
      data-testid="weekstrip.root"
      className="flex items-center justify-between overflow-x-auto gap-1"
      role="tablist"
      aria-label="เลือกวัน"
    >
      {days.map((day) => {
        const isSelected = day.date === selectedDate
        const progress = day.stepsGoal > 0 ? Math.min(day.steps / day.stepsGoal, 1) : 0
        const strokeDash = progress * CIRCUMFERENCE
        const ringColor = stepRingColor(day.steps, day.stepsGoal)

        return (
          <button
            key={day.dayKey}
            type="button"
            role="tab"
            data-testid={`weekstrip.day.${day.dayKey}`}
            aria-selected={isSelected}
            aria-label={day.dayKey}
            onClick={() => onSelectDate(day.date)}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <span
              className={`text-xs font-semibold ${isSelected ? 'text-orange-500' : 'text-slate-400'}`}
            >
              {DAY_SHORT_HEALTH[day.dayKey]}
            </span>

            <svg
              data-testid={`weekstrip.day.${day.dayKey}.ring`}
              width={44}
              height={44}
              viewBox="0 0 44 44"
              aria-hidden="true"
            >
              {/* Track */}
              <circle
                cx={CX}
                cy={CY}
                r={R}
                fill={isSelected ? '#fff7ed' : 'transparent'}
                stroke="#e2e8f0"
                strokeWidth={STROKE}
              />
              {/* Progress arc */}
              {progress > 0 && (
                <circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  fill="none"
                  className={ringColor}
                  stroke="currentColor"
                  strokeWidth={STROKE}
                  strokeDasharray={`${strokeDash} ${CIRCUMFERENCE}`}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${CX} ${CY})`}
                />
              )}
              {/* Selected indicator dot */}
              {isSelected && <circle cx={CX} cy={CY + R + STROKE + 3} r={2.5} fill="#f97316" />}
            </svg>
          </button>
        )
      })}
    </div>
  )
}
