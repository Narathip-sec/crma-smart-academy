import { GRADE_COLOR, type CourseGrade } from '@/fixtures/grades'

export interface CourseGradeRowProps {
  item: CourseGrade
}

export function CourseGradeRow({ item }: CourseGradeRowProps) {
  const { courseCode, title, credits, grade } = item

  return (
    <div
      data-testid={`graderow.${courseCode}`}
      className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
    >
      <div className="flex-1 min-w-0 pr-3">
        <p className="text-sm font-bold text-slate-900 truncate">{courseCode}</p>
        <p className="text-xs text-slate-400 truncate">{title}</p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span data-testid={`graderow.${courseCode}.credits`} className="text-xs text-slate-400">
          {credits} หน่วยกิต
        </span>
        <span
          data-testid={`graderow.${courseCode}.grade`}
          className={`text-base font-bold w-8 text-right ${GRADE_COLOR[grade]}`}
        >
          {grade}
        </span>
      </div>
    </div>
  )
}
