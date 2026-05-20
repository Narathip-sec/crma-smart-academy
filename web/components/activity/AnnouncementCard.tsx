import {
  ANNOUNCEMENT_LEVEL_COLOR,
  ANNOUNCEMENT_LEVEL_LABEL,
  type Announcement,
} from '@/fixtures/activity'

export interface AnnouncementCardProps {
  item: Announcement
}

export function AnnouncementCard({ item }: AnnouncementCardProps) {
  const { id, title, body, dateISO, level } = item
  const colors = ANNOUNCEMENT_LEVEL_COLOR[level]

  return (
    <div
      data-testid={`announcementcard.${id}`}
      className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex flex-col gap-2"
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          data-testid={`announcementcard.${id}.title`}
          className="text-base font-bold text-slate-900 leading-snug flex-1"
        >
          {title}
        </h3>
        <span
          data-testid={`announcementcard.${id}.badge`}
          className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}
        >
          {ANNOUNCEMENT_LEVEL_LABEL[level]}
        </span>
      </div>

      <p
        data-testid={`announcementcard.${id}.body`}
        className="text-sm text-slate-600 leading-relaxed"
      >
        {body}
      </p>

      <span className="text-xs text-slate-400">{dateISO}</span>
    </div>
  )
}
