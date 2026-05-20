'use client'

import { ServiceGrid } from '@/components/service/ServiceGrid'
import { serviceItemsFixture } from '@/fixtures/service'
import { liffOpen } from '@/lib/liffOpen'

export default function ServiceView() {
  return (
    <div data-testid="service.root" className="bg-slate-50">
      <div className="px-4 pt-2 pb-28 flex flex-col gap-4">
        <h1 data-testid="service.title" className="text-3xl font-bold text-slate-900">
          บริการ
        </h1>

        <p className="text-sm text-slate-500">บริการและระบบภายนอกของโรงเรียนนายร้อย</p>

        <section data-testid="service.section.grid">
          <ServiceGrid items={serviceItemsFixture} onPress={liffOpen} />
        </section>
      </div>
    </div>
  )
}
