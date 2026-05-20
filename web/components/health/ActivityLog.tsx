import { Activity, Dumbbell, Footprints, Trophy, Users, Waves } from 'lucide-react'

import { ACTIVITY_LABEL, type ActivityEntry, type ActivityType } from '@/fixtures/health'

function ActivityIcon({ type }: { type: ActivityType }) {
  const cls = 'text-orange-500'
  const props = { size: 18, strokeWidth: 2, className: cls, 'aria-hidden': true } as const
  switch (type) {
    case 'RUN':
      return <Footprints {...props} />
    case 'WALK':
      return <Footprints {...props} className="text-blue-400" />
    case 'PT':
      return <Dumbbell {...props} />
    case 'SWIM':
      return <Waves {...props} className="text-blue-500" />
    case 'SPORT':
      return <Trophy {...props} className="text-amber-500" />
    case 'DRILL':
      return <Users {...props} className="text-slate-600" />
    default:
      return <Activity {...props} />
  }
}

export interface ActivityLogProps {
  activities: ReadonlyArray<ActivityEntry>
}

export function ActivityLog({ activities }: ActivityLogProps) {
  if (activities.length === 0) {
    return (
      <div
        data-testid="activitylog.empty"
        className="flex items-center justify-center h-20 rounded-2xl bg-white border border-slate-100 text-slate-400"
      >
        <span className="text-sm">ไม่มีกิจกรรมวันนี้</span>
      </div>
    )
  }

  return (
    <div data-testid="activitylog.root" className="flex flex-col gap-2">
      {activities.map((act) => (
        <div
          key={act.id}
          data-testid={`activitylog.item.${act.id}`}
          className="flex items-center gap-3 rounded-2xl bg-white border border-slate-100 shadow-sm p-3"
        >
          <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
            <ActivityIcon type={act.type} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{act.label}</p>
            <p className="text-xs text-slate-400">
              {act.time} · {act.durationMin} นาที · {ACTIVITY_LABEL[act.type]}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-orange-500">{act.caloriesBurned}</p>
            <p className="text-xs text-slate-400">กขล.</p>
          </div>
        </div>
      ))}
    </div>
  )
}
