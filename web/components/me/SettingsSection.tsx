import { Bell, ChevronRight, Globe, Info, LogOut } from 'lucide-react'

export type SettingKey = 'notifications' | 'language' | 'about' | 'signout'

interface SettingItem {
  key: SettingKey
  label: string
  icon: React.ReactNode
  destructive?: boolean
}

const SETTINGS: SettingItem[] = [
  {
    key: 'notifications',
    label: 'การแจ้งเตือน',
    icon: <Bell size={18} strokeWidth={1.5} className="text-slate-500" aria-hidden="true" />,
  },
  {
    key: 'language',
    label: 'ภาษา',
    icon: <Globe size={18} strokeWidth={1.5} className="text-slate-500" aria-hidden="true" />,
  },
  {
    key: 'about',
    label: 'เกี่ยวกับแอปพลิเคชัน',
    icon: <Info size={18} strokeWidth={1.5} className="text-slate-500" aria-hidden="true" />,
  },
  {
    key: 'signout',
    label: 'ออกจากระบบ',
    icon: <LogOut size={18} strokeWidth={1.5} className="text-red-400" aria-hidden="true" />,
    destructive: true,
  },
]

export interface SettingsSectionProps {
  onPress?: (key: SettingKey) => void
}

export function SettingsSection({ onPress }: SettingsSectionProps) {
  return (
    <div
      data-testid="settings.root"
      className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden"
    >
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 pt-3 pb-2">
        ตั้งค่า
      </h3>
      {SETTINGS.map((item, i) => (
        <button
          key={item.key}
          type="button"
          data-testid={`settings.item.${item.key}`}
          aria-label={item.label}
          onClick={() => onPress?.(item.key)}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
            i < SETTINGS.length - 1 ? 'border-b border-slate-100' : ''
          }`}
        >
          {item.icon}
          <span
            className={`flex-1 text-sm font-medium ${item.destructive ? 'text-red-500' : 'text-slate-800'}`}
          >
            {item.label}
          </span>
          {!item.destructive && (
            <ChevronRight size={16} strokeWidth={2} className="text-slate-300" aria-hidden="true" />
          )}
        </button>
      ))}
    </div>
  )
}
