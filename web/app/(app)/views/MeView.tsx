'use client'

import { ProfileCard } from '@/components/me/ProfileCard'
import { SettingsSection } from '@/components/me/SettingsSection'
import { StatsRow } from '@/components/me/StatsRow'

const CADET_PROFILE = {
  name: 'Narathip Chetjai',
  role: 'นักเรียนนายร้อย ชั้นปีที่ 3',
  unit: 'กองร้อยที่ 3 กองพันที่ 1',
  avatarUri: undefined as string | undefined,
  gpa: 3.52,
  pftScore: 87,
  credits: 102,
}

export default function MeView() {
  return (
    <div data-testid="me.root" className="bg-slate-50">
      <div className="px-4 pt-2 pb-28 flex flex-col gap-4">
        <h1 data-testid="me.title" className="text-3xl font-bold text-slate-900">
          ฉัน
        </h1>

        <section data-testid="me.section.profile">
          <ProfileCard
            name={CADET_PROFILE.name}
            role={CADET_PROFILE.role}
            unit={CADET_PROFILE.unit}
            avatarUri={CADET_PROFILE.avatarUri}
          />
        </section>

        <section data-testid="me.section.stats">
          <StatsRow
            gpa={CADET_PROFILE.gpa}
            pftScore={CADET_PROFILE.pftScore}
            credits={CADET_PROFILE.credits}
          />
        </section>

        <section data-testid="me.section.settings">
          <SettingsSection />
        </section>
      </div>
    </div>
  )
}
