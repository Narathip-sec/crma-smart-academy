// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

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
  quickServicesFixture,
} from '@/fixtures/home'

// ───────────────────────── ProfileBanner ──────────────────────────────────────
describe('ProfileBanner', () => {
  test('renders name + role + initials', () => {
    render(<ProfileBanner name="Narathip Chetjai" role="นักเรียนนายร้อย ปี 3" />)
    expect(screen.getByTestId('profilebanner.pressable')).toBeInTheDocument()
    expect(screen.getByTestId('profilebanner.avatar.initials')).toBeInTheDocument()
    expect(screen.getByText('NC')).toBeInTheDocument()
    expect(screen.getByText('Narathip Chetjai')).toBeInTheDocument()
    expect(screen.getByText('นักเรียนนายร้อย ปี 3')).toBeInTheDocument()
    expect(screen.getByTestId('profilebanner.chevron')).toBeInTheDocument()
  })

  test('renders img when avatarUri provided', () => {
    render(<ProfileBanner name="A B" avatarUri="https://example.com/a.jpg" />)
    expect(screen.getByTestId('profilebanner.avatar.image')).toBeInTheDocument()
    expect(screen.queryByTestId('profilebanner.avatar.initials')).not.toBeInTheDocument()
  })

  test('single-word name → first letter only', () => {
    render(<ProfileBanner name="Narathip" />)
    expect(screen.getByText('N')).toBeInTheDocument()
  })
})

// ───────────────────────── HeroCarousel ───────────────────────────────────────
describe('HeroCarousel', () => {
  test('renders first slide content', () => {
    render(<HeroCarousel slides={heroSlidesFixture} />)
    expect(screen.getByText(heroSlidesFixture[0]!.title)).toBeInTheDocument()
    expect(screen.getByTestId('hero.cta')).toBeInTheDocument()
  })

  test('renders one dot per slide', () => {
    render(<HeroCarousel slides={heroSlidesFixture} />)
    for (const slide of heroSlidesFixture) {
      expect(screen.getByTestId(`hero.dot.${slide.id}`)).toBeInTheDocument()
    }
  })

  test('first dot is active (aria-selected)', () => {
    render(<HeroCarousel slides={heroSlidesFixture} />)
    const firstDot = screen.getByTestId(`hero.dot.${heroSlidesFixture[0]!.id}`)
    expect(firstDot.getAttribute('aria-selected')).toBe('true')
  })

  test('returns null for empty slides', () => {
    const { container } = render(<HeroCarousel slides={[]} />)
    expect(container.firstChild).toBeNull()
  })
})

// ───────────────────────── QuickServicesGrid ──────────────────────────────────
describe('QuickServicesGrid', () => {
  test('renders all 4 tiles from fixture', () => {
    render(<QuickServicesGrid items={quickServicesFixture} />)
    for (const item of quickServicesFixture) {
      expect(screen.getByTestId(`quick.tile.${item.key}`)).toBeInTheDocument()
      expect(screen.getByLabelText(item.label)).toBeInTheDocument()
    }
  })

  test('calls onPress with key on click', () => {
    const onPress = vi.fn()
    render(<QuickServicesGrid items={quickServicesFixture} onPress={onPress} />)
    fireEvent.click(screen.getByTestId('quick.tile.class'))
    expect(onPress).toHaveBeenCalledWith('class')
  })
})

// ───────────────────────── SmartInsightsRow ───────────────────────────────────
describe('SmartInsightsRow', () => {
  test('renders each insight card + icon', () => {
    render(<SmartInsightsRow insights={insightsFixture} />)
    for (const insight of insightsFixture) {
      expect(screen.getByTestId(`insight.card.${insight.id}`)).toBeInTheDocument()
      expect(screen.getByTestId(`insight.icon.${insight.id}`)).toBeInTheDocument()
      expect(screen.getByText(insight.title)).toBeInTheDocument()
    }
  })
})

// ───────────────────────── NewsEventTabs ──────────────────────────────────────
describe('NewsEventTabs', () => {
  test('defaults to news tab', () => {
    render(<NewsEventTabs news={newsFixture} events={eventsFixture} />)
    const newsTab = screen.getByTestId('newsevent.tab.news')
    expect(newsTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByTestId(`newsevent.card.${newsFixture[0]!.id}`)).toBeInTheDocument()
    expect(screen.queryByTestId(`newsevent.card.${eventsFixture[0]!.id}`)).not.toBeInTheDocument()
  })

  test('switching to events tab shows event cards', () => {
    render(<NewsEventTabs news={newsFixture} events={eventsFixture} />)
    fireEvent.click(screen.getByTestId('newsevent.tab.event'))
    expect(screen.getByTestId(`newsevent.card.${eventsFixture[0]!.id}`)).toBeInTheDocument()
    expect(screen.queryByTestId(`newsevent.card.${newsFixture[0]!.id}`)).not.toBeInTheDocument()
  })

  test('view_all button calls onViewAll with active tab', () => {
    const onViewAll = vi.fn()
    render(<NewsEventTabs news={newsFixture} events={eventsFixture} onViewAll={onViewAll} />)
    fireEvent.click(screen.getByTestId('newsevent.view_all'))
    expect(onViewAll).toHaveBeenCalledWith('news')
  })
})
