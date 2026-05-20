export interface ProfileCardProps {
  name: string
  role: string
  unit: string
  avatarUri?: string
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ProfileCard({ name, role, unit, avatarUri }: ProfileCardProps) {
  return (
    <div data-testid="profilecard.root" className="flex flex-col items-center gap-3 py-6">
      {/* Avatar */}
      <div className="w-20 h-20 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center">
        {avatarUri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            data-testid="profilecard.avatar.image"
            src={avatarUri}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span data-testid="profilecard.avatar.initials" className="text-2xl font-bold text-white">
            {initials(name)}
          </span>
        )}
      </div>

      <div className="text-center">
        <h2 data-testid="profilecard.name" className="text-xl font-bold text-slate-900">
          {name}
        </h2>
        <p data-testid="profilecard.role" className="text-sm text-slate-500 mt-0.5">
          {role}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{unit}</p>
      </div>
    </div>
  )
}
