import { ChevronRight } from 'lucide-react'
import Link from 'next/link'


export interface ProfileBannerProps {
  name: string
  role?: string
  avatarUri?: string
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (!parts[0]) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  const first = parts[0].charAt(0)
  const last = parts[parts.length - 1]!.charAt(0)
  return `${first}${last}`.toUpperCase()
}

// Renders as a link to ?tab=me (matches predecessor onPress → logNav("me")).
export function ProfileBanner({ name, role, avatarUri }: ProfileBannerProps) {
  return (
    <Link
      href="/?tab=me"
      data-testid="profilebanner.pressable"
      aria-label={`${name}${role ? `, ${role}` : ''}`}
      className="flex flex-row items-center rounded-3xl bg-white border border-slate-100 p-4 shadow-sm no-underline"
    >
      {avatarUri ? (
        <img
          data-testid="profilebanner.avatar.image"
          src={avatarUri}
          alt={name}
          className="h-14 w-14 rounded-full bg-slate-200 object-cover"
        />
      ) : (
        <div
          data-testid="profilebanner.avatar.initials"
          className="h-14 w-14 flex items-center justify-center rounded-full bg-amber-100 border-2 border-amber-400"
        >
          <span className="text-base font-bold text-amber-700">{initialsFor(name)}</span>
        </div>
      )}

      <div className="ml-4 flex-1 min-w-0">
        <p className="text-base font-bold text-slate-900">{name}</p>
        {role ? <p className="mt-0.5 text-sm text-slate-500">{role}</p> : null}
      </div>

      <span data-testid="profilebanner.chevron" aria-hidden>
        <ChevronRight size={20} color="#94A3B8" strokeWidth={2.2} />
      </span>
    </Link>
  )
}
