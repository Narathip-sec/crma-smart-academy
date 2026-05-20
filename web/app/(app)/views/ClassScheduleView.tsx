'use client'

import { useMemo } from 'react'

import { ClassCard } from '@/components/class/ClassCard'
import { DaySwitcher } from '@/components/class/DaySwitcher'
import { SemesterPill } from '@/components/class/SemesterPill'
import { ProfileBanner } from '@/components/home/ProfileBanner'
import { profileFixture } from '@/fixtures/home'
import { classesFixture, SCHOOL_DAYS, semesterFixture } from '@/fixtures/schedule'
import { useScheduleStore } from '@/store/useScheduleStore'

export default function ClassScheduleView() {
  const { activeSemesterId, activeDay, setSemester, setDay } = useScheduleStore()

  const classesForDay = useMemo(
    () => classesFixture.filter((c) => c.semesterId === activeSemesterId && c.day === activeDay),
    [activeSemesterId, activeDay],
  )

  return (
    <div data-testid="class.root" className="bg-slate-50">
      <div className="px-4 pt-2 pb-28">
        <h1 data-testid="class.title" className="text-3xl font-bold text-slate-900">
          ตารางเรียน
        </h1>

        <div data-testid="class.section.greeting" className="mt-4">
          <ProfileBanner
            name={profileFixture.name}
            role={`สวัสดี, ${profileFixture.name.split(' ')[0] ?? profileFixture.name}`}
          />
        </div>

        <div data-testid="class.section.semester" className="mt-5 flex items-center gap-3">
          <SemesterPill
            options={semesterFixture}
            activeId={activeSemesterId}
            onChange={setSemester}
          />
        </div>

        <div data-testid="class.section.days" className="mt-4">
          <DaySwitcher days={SCHOOL_DAYS} active={activeDay} onChange={setDay} />
        </div>

        <div data-testid="class.section.cards" className="mt-5">
          {classesForDay.length === 0 ? (
            <div
              data-testid="class.empty"
              className="flex items-center justify-center h-32 rounded-2xl bg-white border border-slate-100 text-slate-400"
            >
              <span className="text-sm">ไม่มีคาบเรียนวันนี้</span>
            </div>
          ) : (
            classesForDay.map((item) => <ClassCard key={item.id} item={item} />)
          )}
        </div>
      </div>
    </div>
  )
}
