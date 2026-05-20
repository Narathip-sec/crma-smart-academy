import { HeroCarousel } from '@/components/home/HeroCarousel'
import { NewsEventTabs } from '@/components/home/NewsEventTabs'
import { ProfileBanner } from '@/components/home/ProfileBanner'
import { QuickServicesGrid } from '@/components/home/QuickServicesGrid'
import { SmartInsightsRow } from '@/components/home/SmartInsightsRow'
import {
  eventsFixture,
  heroSlidesFixture,
  insightsFixture,
  newsFixture,
  profileFixture,
  quickServicesFixture,
} from '@/fixtures/home'

export default function HomeView() {
  return (
    <div data-testid="home.root" className="bg-slate-50">
      <div className="px-4 pt-2 pb-28">
        <div data-testid="home.section.profile">
          <ProfileBanner
            name={profileFixture.name}
            role={profileFixture.role}
            avatarUri={profileFixture.avatarUri}
          />
        </div>

        <div data-testid="home.section.hero" className="mt-5">
          <HeroCarousel slides={heroSlidesFixture} />
        </div>

        <div data-testid="home.section.quick" className="mt-6">
          <p className="mb-3 text-base font-bold text-slate-900">Quick Services</p>
          <QuickServicesGrid items={quickServicesFixture} />
        </div>

        <div data-testid="home.section.news_events" className="mt-6">
          <NewsEventTabs news={newsFixture} events={eventsFixture} />
        </div>

        <div data-testid="home.section.insights" className="mt-5">
          <SmartInsightsRow insights={insightsFixture} />
        </div>
      </div>
    </div>
  )
}
