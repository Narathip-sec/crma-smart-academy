// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { ActivityLog } from '@/components/health/ActivityLog'
import { CaloriesCard } from '@/components/health/CaloriesCard'
import { StepsCard } from '@/components/health/StepsCard'
import { WaterLogger } from '@/components/health/WaterLogger'
import { WeekCalendarStrip } from '@/components/health/WeekCalendarStrip'
import {
  ACTIVITY_LABEL,
  activitiesFixture,
  healthWeekFixture,
  TODAY_HEALTH_DATE,
  WEEK_DAYS,
} from '@/fixtures/health'
import { useHealthStore } from '@/store/useHealthStore'

// ───────────────────────── fixtures/health ────────────────────────────────────
describe('health fixtures', () => {
  test('healthWeekFixture has exactly 7 days', () => {
    expect(healthWeekFixture).toHaveLength(7)
  })

  test('each day covers all WEEK_DAYS in order', () => {
    const keys = healthWeekFixture.map((d) => d.dayKey)
    expect(keys).toEqual(WEEK_DAYS)
  })

  test('activitiesFixture has at least one entry', () => {
    expect(activitiesFixture.length).toBeGreaterThan(0)
  })

  test('ACTIVITY_LABEL covers all 6 activity types', () => {
    const types = ['RUN', 'WALK', 'PT', 'SWIM', 'SPORT', 'DRILL'] as const
    for (const t of types) {
      expect(ACTIVITY_LABEL[t].length).toBeGreaterThan(0)
    }
  })
})

// ───────────────────────── store/useHealthStore ───────────────────────────────
describe('useHealthStore', () => {
  test('initializes selectedDate = TODAY_HEALTH_DATE', () => {
    const { selectedDate } = useHealthStore.getState()
    expect(selectedDate).toBe(TODAY_HEALTH_DATE)
  })

  test('initializes waterCups from today fixture', () => {
    const todayCups = healthWeekFixture.find((d) => d.date === TODAY_HEALTH_DATE)?.waterCups ?? 0
    expect(useHealthStore.getState().waterCups).toBe(todayCups)
  })

  test('addWaterCup increments cups', () => {
    useHealthStore.setState({ waterCups: 3 })
    act(() => useHealthStore.getState().addWaterCup())
    expect(useHealthStore.getState().waterCups).toBe(4)
  })

  test('removeWaterCup decrements cups', () => {
    useHealthStore.setState({ waterCups: 3 })
    act(() => useHealthStore.getState().removeWaterCup())
    expect(useHealthStore.getState().waterCups).toBe(2)
  })

  test('addWaterCup caps at 12', () => {
    useHealthStore.setState({ waterCups: 12 })
    act(() => useHealthStore.getState().addWaterCup())
    expect(useHealthStore.getState().waterCups).toBe(12)
  })

  test('removeWaterCup floors at 0', () => {
    useHealthStore.setState({ waterCups: 0 })
    act(() => useHealthStore.getState().removeWaterCup())
    expect(useHealthStore.getState().waterCups).toBe(0)
  })

  test('setSelectedDate resets waterCups from fixture', () => {
    const monDate = '2026-05-18'
    const monCups = healthWeekFixture.find((d) => d.date === monDate)?.waterCups ?? 0
    act(() => useHealthStore.getState().setSelectedDate(monDate))
    const state = useHealthStore.getState()
    expect(state.selectedDate).toBe(monDate)
    expect(state.waterCups).toBe(monCups)
  })
})

// ───────────────────────── WeekCalendarStrip ──────────────────────────────────
describe('WeekCalendarStrip', () => {
  test('renders 7 day buttons', () => {
    render(
      <WeekCalendarStrip
        days={healthWeekFixture}
        selectedDate={TODAY_HEALTH_DATE}
        onSelectDate={() => {}}
      />,
    )
    expect(screen.getByTestId('weekstrip.root')).toBeInTheDocument()
    for (const day of WEEK_DAYS) {
      expect(screen.getByTestId(`weekstrip.day.${day}`)).toBeInTheDocument()
    }
  })

  test('selected day has aria-selected=true, others false', () => {
    render(
      <WeekCalendarStrip
        days={healthWeekFixture}
        selectedDate={TODAY_HEALTH_DATE}
        onSelectDate={() => {}}
      />,
    )
    const wed = screen.getByTestId('weekstrip.day.wed')
    expect(wed.getAttribute('aria-selected')).toBe('true')
    const mon = screen.getByTestId('weekstrip.day.mon')
    expect(mon.getAttribute('aria-selected')).toBe('false')
  })

  test('calls onSelectDate with date string on click', () => {
    const onSelect = vi.fn()
    render(
      <WeekCalendarStrip
        days={healthWeekFixture}
        selectedDate={TODAY_HEALTH_DATE}
        onSelectDate={onSelect}
      />,
    )
    fireEvent.click(screen.getByTestId('weekstrip.day.mon'))
    expect(onSelect).toHaveBeenCalledWith('2026-05-18')
  })
})

// ───────────────────────── StepsCard ─────────────────────────────────────────
describe('StepsCard', () => {
  test('renders steps count and goal in SVG', () => {
    render(<StepsCard steps={4100} goal={10000} />)
    expect(screen.getByTestId('stepscard.root')).toBeInTheDocument()
    expect(screen.getByTestId('stepscard.ring')).toBeInTheDocument()
    expect(screen.getByTestId('stepscard.steps')).toHaveTextContent('4,100')
    expect(screen.getByTestId('stepscard.goal')).toHaveTextContent('10,000')
  })

  test('shows goal-reached label when steps >= goal', () => {
    render(<StepsCard steps={10000} goal={10000} />)
    expect(screen.getByText('บรรลุเป้าหมาย!')).toBeInTheDocument()
  })
})

// ───────────────────────── WaterLogger ───────────────────────────────────────
describe('WaterLogger', () => {
  test('renders cup count, add/remove buttons', () => {
    render(<WaterLogger cups={3} goal={8} onAdd={() => {}} onRemove={() => {}} />)
    expect(screen.getByTestId('waterlogger.root')).toBeInTheDocument()
    expect(screen.getByTestId('waterlogger.cups')).toBeInTheDocument()
    expect(screen.getByTestId('waterlogger.add')).toBeInTheDocument()
    expect(screen.getByTestId('waterlogger.remove')).toBeInTheDocument()
  })

  test('onAdd and onRemove called on click', () => {
    const onAdd = vi.fn()
    const onRemove = vi.fn()
    render(<WaterLogger cups={3} goal={8} onAdd={onAdd} onRemove={onRemove} />)
    fireEvent.click(screen.getByTestId('waterlogger.add'))
    expect(onAdd).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByTestId('waterlogger.remove'))
    expect(onRemove).toHaveBeenCalledOnce()
  })

  test('add button disabled at cups=12', () => {
    render(<WaterLogger cups={12} goal={8} onAdd={() => {}} onRemove={() => {}} />)
    expect(screen.getByTestId('waterlogger.add')).toBeDisabled()
  })

  test('remove button disabled at cups=0', () => {
    render(<WaterLogger cups={0} goal={8} onAdd={() => {}} onRemove={() => {}} />)
    expect(screen.getByTestId('waterlogger.remove')).toBeDisabled()
  })
})

// ───────────────────────── CaloriesCard ──────────────────────────────────────
describe('CaloriesCard', () => {
  test('renders consumed, burned, goal values', () => {
    render(<CaloriesCard consumed={1200} burned={210} goal={2200} />)
    expect(screen.getByTestId('caloriescard.root')).toBeInTheDocument()
    expect(screen.getByTestId('caloriescard.consumed')).toHaveTextContent('1,200')
    expect(screen.getByTestId('caloriescard.burned')).toHaveTextContent('210')
    expect(screen.getByTestId('caloriescard.goal')).toHaveTextContent('2,200')
  })
})

// ───────────────────────── ActivityLog ───────────────────────────────────────
describe('ActivityLog', () => {
  test('renders activity items', () => {
    const todayActs = activitiesFixture.filter((a) => a.date === TODAY_HEALTH_DATE)
    render(<ActivityLog activities={todayActs} />)
    expect(screen.getByTestId('activitylog.root')).toBeInTheDocument()
    for (const act of todayActs) {
      expect(screen.getByTestId(`activitylog.item.${act.id}`)).toBeInTheDocument()
      expect(screen.getByText(act.label)).toBeInTheDocument()
    }
  })

  test('shows empty state when no activities', () => {
    render(<ActivityLog activities={[]} />)
    expect(screen.getByTestId('activitylog.empty')).toBeInTheDocument()
    expect(screen.queryByTestId('activitylog.root')).not.toBeInTheDocument()
  })
})
