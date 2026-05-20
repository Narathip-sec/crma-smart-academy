'use client'

import { useState } from 'react'

import { CourseGradeRow } from '@/components/grades/CourseGradeRow'
import { LockedNotice } from '@/components/grades/LockedNotice'
import { SemesterSelector } from '@/components/grades/SemesterSelector'
import { semesterGradesFixture } from '@/fixtures/grades'

export default function GradesView() {
  const [selectedId, setSelectedId] = useState(semesterGradesFixture[0]!.semesterId)

  const semester =
    semesterGradesFixture.find((s) => s.semesterId === selectedId) ?? semesterGradesFixture[0]!

  return (
    <div data-testid="grades.root" className="bg-slate-50">
      <div className="px-4 pt-2 pb-28 flex flex-col gap-4">
        <h1 data-testid="grades.title" className="text-3xl font-bold text-slate-900">
          ผลการเรียน
        </h1>

        <section data-testid="grades.section.selector">
          <SemesterSelector
            options={semesterGradesFixture}
            activeId={selectedId}
            onChange={setSelectedId}
          />
        </section>

        {semester.isLocked ? (
          <section data-testid="grades.section.locked">
            <LockedNotice />
          </section>
        ) : (
          <section data-testid="grades.section.results" className="flex flex-col gap-3">
            {/* GPA summary */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">เกรดเฉลี่ยภาคเรียน</p>
                <p data-testid="grades.gpa" className="text-3xl font-bold text-orange-500">
                  {semester.gpa.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">หน่วยกิตรวม</p>
                <p className="text-lg font-bold text-slate-700">{semester.totalCredits}</p>
              </div>
            </div>

            {/* Course rows */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-4 py-1">
              {semester.courses.map((course) => (
                <CourseGradeRow key={course.courseCode} item={course} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
