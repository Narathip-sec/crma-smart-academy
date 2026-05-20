import type { Attendee } from '@/fixtures/activity'

const AVATAR_BG = [
  'bg-orange-400',
  'bg-blue-400',
  'bg-green-400',
  'bg-purple-400',
  'bg-rose-400',
] as const

const MAX_SHOWN = 3

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export interface AttendeesStackProps {
  attendees: ReadonlyArray<Attendee>
  totalAttendees: number
}

export function AttendeesStack({ attendees, totalAttendees }: AttendeesStackProps) {
  const shown = attendees.slice(0, MAX_SHOWN)
  const overflow = totalAttendees - shown.length

  return (
    <div
      data-testid="attendeesstack.root"
      className="flex items-center gap-1"
      aria-label={`${totalAttendees} คนเข้าร่วม`}
    >
      <div className="flex -space-x-2">
        {shown.map((att, i) => (
          <div
            key={att.id}
            data-testid={`attendeesstack.avatar.${att.id}`}
            className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold ${AVATAR_BG[i % AVATAR_BG.length]}`}
            aria-label={att.name}
          >
            {att.avatarUri ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={att.avatarUri}
                alt={att.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              initials(att.name)
            )}
          </div>
        ))}
      </div>

      {overflow > 0 && (
        <span data-testid="attendeesstack.overflow" className="text-xs text-slate-500 font-medium">
          +{overflow}
        </span>
      )}
    </div>
  )
}
