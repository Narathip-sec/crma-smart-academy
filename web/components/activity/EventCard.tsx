import { CalendarDays, MapPin } from 'lucide-react'

import { EVENT_CATEGORY_COLOR, EVENT_CATEGORY_LABEL, type ActivityEvent } from '@/fixtures/activity'

import { AttendeesStack } from './AttendeesStack'

export interface EventCardProps {
  event: ActivityEvent
  isAttending: boolean
  onToggleRsvp?: (eventId: string) => void
}

export function EventCard({ event, isAttending, onToggleRsvp }: EventCardProps) {
  const { id, title, dateISO, timeStart, location, category, attendees, totalAttendees } = event
  const colors = EVENT_CATEGORY_COLOR[category]

  return (
    <div
      data-testid={`eventcard.${id}`}
      className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex flex-col gap-3"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <h3
          data-testid={`eventcard.${id}.title`}
          className="text-base font-bold text-slate-900 leading-snug flex-1"
        >
          {title}
        </h3>
        <span
          data-testid={`eventcard.${id}.badge`}
          className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}
        >
          {EVENT_CATEGORY_LABEL[category]}
        </span>
      </div>

      {/* Meta row */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays size={13} strokeWidth={2} aria-hidden="true" />
          <span data-testid={`eventcard.${id}.date`}>
            {dateISO} · {timeStart}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin size={13} strokeWidth={2} aria-hidden="true" />
          <span data-testid={`eventcard.${id}.location`}>{location}</span>
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <AttendeesStack attendees={attendees} totalAttendees={totalAttendees} />

        <button
          type="button"
          data-testid={`eventcard.${id}.rsvp`}
          aria-pressed={isAttending}
          onClick={() => onToggleRsvp?.(id)}
          className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-colors ${
            isAttending
              ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {isAttending ? 'ออกจากกิจกรรม' : 'เข้าร่วม'}
        </button>
      </div>
    </div>
  )
}
