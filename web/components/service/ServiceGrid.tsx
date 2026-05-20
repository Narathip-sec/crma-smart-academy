import { Activity, BookOpen, GraduationCap, IdCard, Search, Wrench } from 'lucide-react'

import type { ServiceItem, ServiceKey } from '@/fixtures/service'

function ServiceIcon({ serviceKey }: { serviceKey: ServiceKey }) {
  const cls = 'text-orange-500'
  const props = { size: 28, strokeWidth: 1.5, className: cls, 'aria-hidden': true } as const
  switch (serviceKey) {
    case 'ebook':
      return <BookOpen {...props} />
    case 'opac':
      return <Search {...props} />
    case 'moodle':
      return <GraduationCap {...props} />
    case 'pft':
      return <Activity {...props} />
    case 'maintenance':
      return <Wrench {...props} />
    case 'cadet_id':
      return <IdCard {...props} />
  }
}

export interface ServiceGridProps {
  items: ReadonlyArray<ServiceItem>
  onPress: (url: string) => void
}

export function ServiceGrid({ items, onPress }: ServiceGridProps) {
  return (
    <div data-testid="servicegrid.root" className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          data-testid={`servicegrid.tile.${item.key}`}
          aria-label={item.label}
          onClick={() => onPress(item.url)}
          className="flex flex-col items-start gap-2 rounded-2xl bg-white border border-slate-100 shadow-sm p-4 text-left active:scale-95 transition-transform"
        >
          <ServiceIcon serviceKey={item.key} />
          <div>
            <p className="text-sm font-bold text-slate-900 leading-snug">{item.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
