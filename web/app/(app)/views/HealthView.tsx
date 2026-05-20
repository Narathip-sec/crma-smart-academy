'use client'

import { useMemo } from 'react'

import { ActivityLog } from '@/components/health/ActivityLog'
import { CaloriesCard } from '@/components/health/CaloriesCard'
import { StepsCard } from '@/components/health/StepsCard'
import { WaterLogger } from '@/components/health/WaterLogger'
import { WeekCalendarStrip } from '@/components/health/WeekCalendarStrip'
import { activitiesFixture, healthWeekFixture } from '@/fixtures/health'
import { useHealthStore } from '@/store/useHealthStore'

export default function HealthView() {
  const { selectedDate, waterCups, setSelectedDate, addWaterCup, removeWaterCup } = useHealthStore()

  const dayData = useMemo(
    () => healthWeekFixture.find((d) => d.date === selectedDate) ?? healthWeekFixture[2]!,
    [selectedDate],
  )

  const dayActivities = useMemo(
    () => activitiesFixture.filter((a) => a.date === selectedDate),
    [selectedDate],
  )

  return (
    <div data-testid="health.root" className="bg-slate-50">
      <div className="px-4 pt-2 pb-28 flex flex-col gap-4">
        <h1 data-testid="health.title" className="text-3xl font-bold text-slate-900">
          สุขภาพ
        </h1>

        {/* Week strip */}
        <section data-testid="health.section.week">
          <WeekCalendarStrip
            days={healthWeekFixture}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </section>

        {/* Steps + Water row */}
        <section data-testid="health.section.metrics" className="flex gap-3">
          <StepsCard steps={dayData.steps} goal={dayData.stepsGoal} />
          <WaterLogger
            cups={waterCups}
            goal={dayData.waterGoal}
            onAdd={addWaterCup}
            onRemove={removeWaterCup}
          />
        </section>

        {/* Calories */}
        <section data-testid="health.section.calories">
          <CaloriesCard
            consumed={dayData.caloriesConsumed}
            burned={dayData.caloriesBurned}
            goal={dayData.caloriesGoal}
          />
        </section>

        {/* Activity log */}
        <section data-testid="health.section.activity">
          <h2 className="text-sm font-semibold text-slate-500 mb-2">กิจกรรม</h2>
          <ActivityLog activities={dayActivities} />
        </section>
      </div>
    </div>
  )
}
