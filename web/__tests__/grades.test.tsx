// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { CourseGradeRow } from '@/components/grades/CourseGradeRow'
import { LockedNotice } from '@/components/grades/LockedNotice'
import { SemesterSelector } from '@/components/grades/SemesterSelector'
import { semesterGradesFixture } from '@/fixtures/grades'

// ───────────────────────── fixtures/grades ────────────────────────────────────
describe('grades fixtures', () => {
  test('semesterGradesFixture has 3 semesters', () => {
    expect(semesterGradesFixture).toHaveLength(3)
  })

  test('first semester (current) is locked', () => {
    const current = semesterGradesFixture[0]!
    expect(current.isLocked).toBe(true)
    expect(current.courses).toHaveLength(0)
  })

  test('past semesters have course grades', () => {
    const past = semesterGradesFixture.filter((s) => !s.isLocked)
    for (const sem of past) {
      expect(sem.courses.length).toBeGreaterThan(0)
      expect(sem.gpa).toBeGreaterThan(0)
    }
  })
})

// ───────────────────────── SemesterSelector ──────────────────────────────────
describe('SemesterSelector', () => {
  test('renders label for active semester', () => {
    render(
      <SemesterSelector
        options={semesterGradesFixture}
        activeId={semesterGradesFixture[0]!.semesterId}
        onChange={() => {}}
      />,
    )
    expect(screen.getByTestId('semesterselector.root')).toBeInTheDocument()
    expect(screen.getByTestId('semesterselector.label')).toHaveTextContent(
      semesterGradesFixture[0]!.label,
    )
  })

  test('calls onChange when select changes', () => {
    const onChange = vi.fn()
    render(
      <SemesterSelector
        options={semesterGradesFixture}
        activeId={semesterGradesFixture[0]!.semesterId}
        onChange={onChange}
      />,
    )
    const select = screen.getByTestId('semesterselector.select')
    fireEvent.change(select, { target: { value: semesterGradesFixture[1]!.semesterId } })
    expect(onChange).toHaveBeenCalledWith(semesterGradesFixture[1]!.semesterId)
  })
})

// ───────────────────────── CourseGradeRow ────────────────────────────────────
describe('CourseGradeRow', () => {
  const course = semesterGradesFixture[1]!.courses[0]!

  test('renders courseCode, title, credits, grade', () => {
    render(<CourseGradeRow item={course} />)
    expect(screen.getByTestId(`graderow.${course.courseCode}`)).toBeInTheDocument()
    expect(screen.getByText(course.courseCode)).toBeInTheDocument()
    expect(screen.getByText(course.title, { exact: false })).toBeInTheDocument()
    expect(screen.getByTestId(`graderow.${course.courseCode}.credits`)).toBeInTheDocument()
    expect(screen.getByTestId(`graderow.${course.courseCode}.grade`)).toHaveTextContent(
      course.grade,
    )
  })
})

// ───────────────────────── LockedNotice ──────────────────────────────────────
describe('LockedNotice', () => {
  test('renders lock message', () => {
    render(<LockedNotice />)
    expect(screen.getByTestId('lockednotice.root')).toBeInTheDocument()
    expect(screen.getByTestId('lockednotice.message')).toBeInTheDocument()
    expect(screen.getByText('ผลการเรียนยังไม่เปิดเผย')).toBeInTheDocument()
  })
})
