'use client'

import { AnnouncementCard } from '@/components/activity/AnnouncementCard'
import { EventCard } from '@/components/activity/EventCard'
import { TopTabs } from '@/components/activity/TopTabs'
import { activityEventsFixture, announcementsFixture } from '@/fixtures/activity'
import { useActivityStore } from '@/store/useActivityStore'

export default function ActivityView() {
  const { activeTab, rsvpSet, setTab, toggleRsvp } = useActivityStore()

  return (
    <div data-testid="activity.root" className="bg-slate-50">
      <div className="px-4 pt-2 pb-28 flex flex-col gap-4">
        <h1 data-testid="activity.title" className="text-3xl font-bold text-slate-900">
          กิจกรรม
        </h1>

        <section data-testid="activity.section.tabs">
          <TopTabs active={activeTab} onChange={setTab} />
        </section>

        {activeTab === 'events' ? (
          <section data-testid="activity.section.events" className="flex flex-col gap-3">
            {activityEventsFixture.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isAttending={rsvpSet.has(event.id)}
                onToggleRsvp={toggleRsvp}
              />
            ))}
          </section>
        ) : (
          <section data-testid="activity.section.announcements" className="flex flex-col gap-3">
            {announcementsFixture.map((ann) => (
              <AnnouncementCard key={ann.id} item={ann} />
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
