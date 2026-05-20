import { Clock } from 'lucide-react'

import { COURSE_TYPE_LABEL, courseTypeColor } from '@/lib/courseTypeColor'
import { formatMilTime } from '@/lib/formatMilTime'

import type { ClassItem } from '@/fixtures/schedule'

export interface ClassCardProps {
  item: ClassItem
  onPress?: (item: ClassItem) => void
}

export function ClassCard({ item, onPress }: ClassCardProps) {
  const { courseCode, section, title, type, startMil, endMil } = item
  const colors = courseTypeColor(type)
  const timeRange = `${formatMilTime(startMil)}-${formatMilTime(endMil)}`

  return (
    <button
      type="button"
      data-testid={`classcard.${courseCode}`}
      aria-label={`${courseCode} ${title}`}
      onClick={() => onPress?.(item)}
      className="relative w-full mb-3 overflow-hidden rounded-2xl bg-white border border-slate-100 p-4 shadow-sm text-left"
    >
      {/* Colour bar */}
      <div
        data-testid={`classcard.${courseCode}.bar`}
        className={`absolute left-0 top-0 bottom-0 w-2 ${colors.bar}`}
      />

      <div className="flex items-center justify-between pl-2">
        <div className="flex items-baseline gap-1">
          <span className="text-base font-bold text-orange-500">{courseCode}</span>
          <span className="text-base text-slate-400">/ {section}</span>
        </div>
        <div
          data-testid={`classcard.${courseCode}.time`}
          className="flex items-center rounded-full bg-slate-100 px-3 py-1 gap-1"
        >
          <Clock size={14} strokeWidth={2} className="text-slate-900" />
          <span className="text-xs font-semibold text-slate-900">{timeRange}</span>
        </div>
      </div>

      <div className="mt-2 pl-2">
        <p className="text-base font-bold text-slate-900 line-clamp-2">
          {title}{' '}
          <span className={`text-sm font-normal ${colors.badge}`}>({COURSE_TYPE_LABEL[type]})</span>
        </p>
      </div>
    </button>
  )
}
