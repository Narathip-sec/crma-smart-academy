// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { AnnouncementCard } from '@/components/activity/AnnouncementCard'
import { AttendeesStack } from '@/components/activity/AttendeesStack'
import { EventCard } from '@/components/activity/EventCard'
import { TopTabs } from '@/components/activity/TopTabs'
import {
  activityEventsFixture,
  ANNOUNCEMENT_LEVEL_LABEL,
  announcementsFixture,
  EVENT_CATEGORY_LABEL,
} from '@/fixtures/activity'
import { useActivityStore } from '@/store/useActivityStore'

// ───────────────────────── fixtures/activity ──────────────────────────────────
describe('activity fixtures', () => {
  test('activityEventsFixture has at least one event', () => {
    expect(activityEventsFixture.length).toBeGreaterThan(0)
  })

  test('announcementsFixture has at least one announcement', () => {
    expect(announcementsFixture.length).toBeGreaterThan(0)
  })

  test('EVENT_CATEGORY_LABEL covers all 5 categories', () => {
    const cats = ['SPORT', 'ACADEMIC', 'MILITARY', 'SOCIAL', 'CEREMONY'] as const
    for (const c of cats) {
      expect(EVENT_CATEGORY_LABEL[c].length).toBeGreaterThan(0)
    }
  })

  test('ANNOUNCEMENT_LEVEL_LABEL covers all 3 levels', () => {
    const levels = ['INFO', 'URGENT', 'REMINDER'] as const
    for (const l of levels) {
      expect(ANNOUNCEMENT_LEVEL_LABEL[l].length).toBeGreaterThan(0)
    }
  })
})

// ───────────────────────── store/useActivityStore ─────────────────────────────
describe('useActivityStore', () => {
  test('initializes with activeTab=events and empty rsvpSet', () => {
    const { activeTab, rsvpSet } = useActivityStore.getState()
    expect(activeTab).toBe('events')
    expect(rsvpSet.size).toBe(0)
  })

  test('setTab switches active tab', () => {
    act(() => useActivityStore.getState().setTab('announcements'))
    expect(useActivityStore.getState().activeTab).toBe('announcements')
    act(() => useActivityStore.getState().setTab('events'))
  })

  test('toggleRsvp adds eventId to rsvpSet', () => {
    useActivityStore.setState({ rsvpSet: new Set() })
    act(() => useActivityStore.getState().toggleRsvp('ev1'))
    expect(useActivityStore.getState().rsvpSet.has('ev1')).toBe(true)
  })

  test('toggleRsvp removes eventId on second call', () => {
    useActivityStore.setState({ rsvpSet: new Set(['ev1']) })
    act(() => useActivityStore.getState().toggleRsvp('ev1'))
    expect(useActivityStore.getState().rsvpSet.has('ev1')).toBe(false)
  })
})

// ───────────────────────── TopTabs ────────────────────────────────────────────
describe('TopTabs', () => {
  test('renders both tab buttons', () => {
    render(<TopTabs active="events" onChange={() => {}} />)
    expect(screen.getByTestId('toptabs.root')).toBeInTheDocument()
    expect(screen.getByTestId('toptabs.tab.events')).toBeInTheDocument()
    expect(screen.getByTestId('toptabs.tab.announcements')).toBeInTheDocument()
  })

  test('active tab has aria-selected=true', () => {
    render(<TopTabs active="announcements" onChange={() => {}} />)
    expect(screen.getByTestId('toptabs.tab.announcements').getAttribute('aria-selected')).toBe(
      'true',
    )
    expect(screen.getByTestId('toptabs.tab.events').getAttribute('aria-selected')).toBe('false')
  })

  test('calls onChange with tab key on click', () => {
    const onChange = vi.fn()
    render(<TopTabs active="events" onChange={onChange} />)
    fireEvent.click(screen.getByTestId('toptabs.tab.announcements'))
    expect(onChange).toHaveBeenCalledWith('announcements')
  })
})

// ───────────────────────── AttendeesStack ────────────────────────────────────
describe('AttendeesStack', () => {
  const ev1 = activityEventsFixture.find((e) => e.id === 'ev1')!

  test('renders shown avatar circles', () => {
    render(<AttendeesStack attendees={ev1.attendees} totalAttendees={ev1.totalAttendees} />)
    expect(screen.getByTestId('attendeesstack.root')).toBeInTheDocument()
    // Up to 3 shown
    expect(screen.getByTestId(`attendeesstack.avatar.${ev1.attendees[0]!.id}`)).toBeInTheDocument()
  })

  test('shows overflow count when totalAttendees > shown', () => {
    render(<AttendeesStack attendees={ev1.attendees} totalAttendees={ev1.totalAttendees} />)
    // ev1 has 3 attendees shown, 28 total → overflow = 28 - 3 = 25
    expect(screen.getByTestId('attendeesstack.overflow')).toHaveTextContent('+25')
  })

  test('no overflow when all fit', () => {
    const small = [{ id: 'x1', name: 'Alice Bob' }]
    render(<AttendeesStack attendees={small} totalAttendees={1} />)
    expect(screen.queryByTestId('attendeesstack.overflow')).not.toBeInTheDocument()
  })
})

// ───────────────────────── EventCard ─────────────────────────────────────────
describe('EventCard', () => {
  const ev1 = activityEventsFixture.find((e) => e.id === 'ev1')!

  test('renders title, date, location, category badge', () => {
    render(<EventCard event={ev1} isAttending={false} />)
    expect(screen.getByTestId(`eventcard.${ev1.id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`eventcard.${ev1.id}.title`)).toHaveTextContent(ev1.title)
    expect(screen.getByTestId(`eventcard.${ev1.id}.date`)).toBeInTheDocument()
    expect(screen.getByTestId(`eventcard.${ev1.id}.location`)).toHaveTextContent(ev1.location)
    expect(screen.getByTestId(`eventcard.${ev1.id}.badge`)).toHaveTextContent(
      EVENT_CATEGORY_LABEL[ev1.category],
    )
  })

  test('shows "เข้าร่วม" when not attending', () => {
    render(<EventCard event={ev1} isAttending={false} />)
    expect(screen.getByTestId(`eventcard.${ev1.id}.rsvp`)).toHaveTextContent('เข้าร่วม')
    expect(screen.getByTestId(`eventcard.${ev1.id}.rsvp`).getAttribute('aria-pressed')).toBe(
      'false',
    )
  })

  test('shows "ออกจากกิจกรรม" when attending', () => {
    render(<EventCard event={ev1} isAttending={true} />)
    expect(screen.getByTestId(`eventcard.${ev1.id}.rsvp`)).toHaveTextContent('ออกจากกิจกรรม')
    expect(screen.getByTestId(`eventcard.${ev1.id}.rsvp`).getAttribute('aria-pressed')).toBe('true')
  })

  test('calls onToggleRsvp with eventId on click', () => {
    const onToggle = vi.fn()
    render(<EventCard event={ev1} isAttending={false} onToggleRsvp={onToggle} />)
    fireEvent.click(screen.getByTestId(`eventcard.${ev1.id}.rsvp`))
    expect(onToggle).toHaveBeenCalledWith(ev1.id)
  })
})

// ───────────────────────── AnnouncementCard ───────────────────────────────────
describe('AnnouncementCard', () => {
  const ann1 = announcementsFixture.find((a) => a.id === 'ann1')!

  test('renders title, body, level badge', () => {
    render(<AnnouncementCard item={ann1} />)
    expect(screen.getByTestId(`announcementcard.${ann1.id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`announcementcard.${ann1.id}.title`)).toHaveTextContent(ann1.title)
    expect(screen.getByTestId(`announcementcard.${ann1.id}.body`)).toHaveTextContent(ann1.body)
    expect(screen.getByTestId(`announcementcard.${ann1.id}.badge`)).toHaveTextContent(
      ANNOUNCEMENT_LEVEL_LABEL[ann1.level],
    )
  })
})
