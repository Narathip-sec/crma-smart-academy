// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { ClassCard } from '@/components/class/ClassCard'
import { DaySwitcher } from '@/components/class/DaySwitcher'
import { SemesterPill } from '@/components/class/SemesterPill'
import {
  classesFixture,
  DAY_LONG,
  DAY_SHORT,
  SCHOOL_DAYS,
  semesterFixture,
} from '@/fixtures/schedule'
import { courseTypeColor, COURSE_TYPE_LABEL } from '@/lib/courseTypeColor'
import { formatMilTime } from '@/lib/formatMilTime'

// ───────────────────────── lib/formatMilTime ──────────────────────────────────
describe('formatMilTime', () => {
  test('returns valid military time as-is', () => {
    expect(formatMilTime('0700')).toBe('0700')
    expect(formatMilTime('1300')).toBe('1300')
    expect(formatMilTime('2359')).toBe('2359')
  })

  test('throws on invalid input', () => {
    expect(() => formatMilTime('abc')).toThrow()
    expect(() => formatMilTime('2400')).toThrow()
  })
})

// ───────────────────────── lib/courseTypeColor ────────────────────────────────
describe('courseTypeColor', () => {
  test('each type returns bar + badge classes', () => {
    const types = ['LECT', 'LAB', 'MIL', 'PT', 'FIELD'] as const
    for (const type of types) {
      const { bar, badge } = courseTypeColor(type)
      expect(bar).toMatch(/^bg-/)
      expect(badge).toMatch(/^text-/)
      expect(COURSE_TYPE_LABEL[type].length).toBeGreaterThan(0)
    }
  })
})

// ───────────────────────── fixtures/schedule ──────────────────────────────────
describe('schedule fixtures', () => {
  test('classesFixture has 7 items across 4 days (WED empty)', () => {
    expect(classesFixture).toHaveLength(7)
    const wedClasses = classesFixture.filter((c) => c.day === 'wed')
    expect(wedClasses).toHaveLength(0)
  })

  test('DAY_SHORT + DAY_LONG exist for all school days', () => {
    for (const day of SCHOOL_DAYS) {
      expect(DAY_SHORT[day].length).toBeGreaterThan(0)
      expect(DAY_LONG[day].length).toBeGreaterThan(0)
    }
  })

  test('semesterFixture has 3 options', () => {
    expect(semesterFixture).toHaveLength(3)
  })
})

// ───────────────────────── DaySwitcher ────────────────────────────────────────
describe('DaySwitcher', () => {
  test('renders all school-day tabs', () => {
    render(<DaySwitcher days={SCHOOL_DAYS} active="mon" onChange={() => {}} />)
    expect(screen.getByTestId('dayswitcher.root')).toBeInTheDocument()
    for (const day of SCHOOL_DAYS) {
      expect(screen.getByTestId(`dayswitcher.tab.${day}`)).toBeInTheDocument()
    }
  })

  test('active tab has aria-selected=true', () => {
    render(<DaySwitcher days={SCHOOL_DAYS} active="tue" onChange={() => {}} />)
    const tue = screen.getByTestId('dayswitcher.tab.tue')
    expect(tue.getAttribute('aria-selected')).toBe('true')
    const mon = screen.getByTestId('dayswitcher.tab.mon')
    expect(mon.getAttribute('aria-selected')).toBe('false')
  })

  test('shows full day name in label', () => {
    render(<DaySwitcher days={SCHOOL_DAYS} active="thu" onChange={() => {}} />)
    expect(screen.getByTestId('dayswitcher.label')).toHaveTextContent(DAY_LONG.thu)
  })

  test('calls onChange on click', () => {
    const onChange = vi.fn()
    render(<DaySwitcher days={SCHOOL_DAYS} active="mon" onChange={onChange} />)
    fireEvent.click(screen.getByTestId('dayswitcher.tab.fri'))
    expect(onChange).toHaveBeenCalledWith('fri')
  })
})

// ───────────────────────── SemesterPill ───────────────────────────────────────
describe('SemesterPill', () => {
  test('renders active semester label', () => {
    render(<SemesterPill options={semesterFixture} activeId="sem-68-2" onChange={() => {}} />)
    expect(screen.getByTestId('semesterpill.pressable')).toBeInTheDocument()
    // Label appears twice (visible span + option) — confirm at least one exists
    expect(screen.getAllByText('ภาคเรียนที่ 2/2568').length).toBeGreaterThanOrEqual(1)
  })

  test('calls onChange when native select changes', () => {
    const onChange = vi.fn()
    render(<SemesterPill options={semesterFixture} activeId="sem-68-2" onChange={onChange} />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'sem-68-1' } })
    expect(onChange).toHaveBeenCalledWith('sem-68-1')
  })
})

// ───────────────────────── ClassCard ──────────────────────────────────────────
describe('ClassCard', () => {
  const mon1 = classesFixture.find((c) => c.id === 'c1')!

  test('renders course code, time, title, type badge', () => {
    render(<ClassCard item={mon1} />)
    expect(screen.getByTestId(`classcard.${mon1.courseCode}`)).toBeInTheDocument()
    expect(screen.getByTestId(`classcard.${mon1.courseCode}.bar`)).toBeInTheDocument()
    expect(screen.getByTestId(`classcard.${mon1.courseCode}.time`)).toBeInTheDocument()
    expect(screen.getByText(mon1.courseCode)).toBeInTheDocument()
    expect(screen.getByText(mon1.title, { exact: false })).toBeInTheDocument()
    // Type badge "(ทหาร)" is inside the card — use exact match with parens
    expect(screen.getByText(`(${COURSE_TYPE_LABEL[mon1.type]})`)).toBeInTheDocument()
  })

  test('calls onPress when clicked', () => {
    const onPress = vi.fn()
    render(<ClassCard item={mon1} onPress={onPress} />)
    fireEvent.click(screen.getByTestId(`classcard.${mon1.courseCode}`))
    expect(onPress).toHaveBeenCalledWith(mon1)
  })
})
