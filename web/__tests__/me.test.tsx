// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { ProfileCard } from '@/components/me/ProfileCard'
import { SettingsSection } from '@/components/me/SettingsSection'
import { StatsRow } from '@/components/me/StatsRow'

// ───────────────────────── ProfileCard ───────────────────────────────────────
describe('ProfileCard', () => {
  test('renders name, role, initials when no avatarUri', () => {
    render(<ProfileCard name="Narathip Chetjai" role="นักเรียนนายร้อย ปี 3" unit="กองร้อยที่ 3" />)
    expect(screen.getByTestId('profilecard.root')).toBeInTheDocument()
    expect(screen.getByTestId('profilecard.name')).toHaveTextContent('Narathip Chetjai')
    expect(screen.getByTestId('profilecard.role')).toHaveTextContent('นักเรียนนายร้อย ปี 3')
    expect(screen.getByTestId('profilecard.avatar.initials')).toHaveTextContent('NC')
    expect(screen.queryByTestId('profilecard.avatar.image')).not.toBeInTheDocument()
  })

  test('renders image when avatarUri provided', () => {
    render(
      <ProfileCard name="A B" role="role" unit="unit" avatarUri="https://example.com/avatar.jpg" />,
    )
    expect(screen.getByTestId('profilecard.avatar.image')).toBeInTheDocument()
    expect(screen.queryByTestId('profilecard.avatar.initials')).not.toBeInTheDocument()
  })

  test('single-word name → one initial', () => {
    render(<ProfileCard name="Narathip" role="r" unit="u" />)
    expect(screen.getByTestId('profilecard.avatar.initials')).toHaveTextContent('N')
  })
})

// ───────────────────────── StatsRow ──────────────────────────────────────────
describe('StatsRow', () => {
  test('renders gpa, pft, credits values', () => {
    render(<StatsRow gpa={3.52} pftScore={87} credits={102} />)
    expect(screen.getByTestId('statsrow.root')).toBeInTheDocument()
    expect(screen.getByTestId('statsrow.gpa')).toHaveTextContent('3.52')
    expect(screen.getByTestId('statsrow.pft')).toHaveTextContent('87')
    expect(screen.getByTestId('statsrow.credits')).toHaveTextContent('102')
  })
})

// ───────────────────────── SettingsSection ───────────────────────────────────
describe('SettingsSection', () => {
  test('renders all 4 setting items', () => {
    render(<SettingsSection />)
    expect(screen.getByTestId('settings.root')).toBeInTheDocument()
    const keys = ['notifications', 'language', 'about', 'signout']
    for (const key of keys) {
      expect(screen.getByTestId(`settings.item.${key}`)).toBeInTheDocument()
    }
  })

  test('calls onPress with key on item click', () => {
    const onPress = vi.fn()
    render(<SettingsSection onPress={onPress} />)
    fireEvent.click(screen.getByTestId('settings.item.notifications'))
    expect(onPress).toHaveBeenCalledWith('notifications')
  })
})
