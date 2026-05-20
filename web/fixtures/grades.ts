// Grades fixture — mirrors Prisma Semester.isLocked gate (423 enforced server-side).
// Frontend shows lock notice for isLocked=true semesters.

export type GradeValue = 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F' | 'S' | 'U' | 'W'

export const GRADE_COLOR: Record<GradeValue, string> = {
  A: 'text-green-600',
  'B+': 'text-blue-500',
  B: 'text-blue-400',
  'C+': 'text-amber-500',
  C: 'text-amber-400',
  'D+': 'text-orange-500',
  D: 'text-orange-400',
  F: 'text-red-500',
  S: 'text-green-500',
  U: 'text-red-400',
  W: 'text-slate-400',
}

export interface CourseGrade {
  courseCode: string
  title: string
  credits: number
  grade: GradeValue
}

export interface SemesterGrade {
  semesterId: string
  label: string
  isLocked: boolean
  gpa: number
  totalCredits: number
  courses: ReadonlyArray<CourseGrade>
}

export const semesterGradesFixture: ReadonlyArray<SemesterGrade> = [
  {
    semesterId: 'sem-68-2',
    label: 'ภาคเรียนที่ 2/2568',
    isLocked: true, // current semester — grades not released
    gpa: 0,
    totalCredits: 0,
    courses: [],
  },
  {
    semesterId: 'sem-68-1',
    label: 'ภาคเรียนที่ 1/2568',
    isLocked: false,
    gpa: 3.52,
    totalCredits: 18,
    courses: [
      { courseCode: 'MS201', title: 'วิทยาศาสตร์การทหาร', credits: 3, grade: 'A' },
      { courseCode: 'EN201', title: 'ภาษาอังกฤษเพื่อการสื่อสาร', credits: 3, grade: 'B+' },
      { courseCode: 'MA201', title: 'คณิตศาสตร์ประยุกต์', credits: 3, grade: 'A' },
      { courseCode: 'CS201', title: 'วิทยาการคอมพิวเตอร์ประยุกต์', credits: 3, grade: 'B' },
      { courseCode: 'GE011', title: 'ทักษะภาษาไทยเพื่อการสื่อสาร', credits: 3, grade: 'B+' },
      { courseCode: 'PE101', title: 'พลศึกษาและกีฬา', credits: 3, grade: 'S' },
    ],
  },
  {
    semesterId: 'sem-67-2',
    label: 'ภาคเรียนที่ 2/2567',
    isLocked: false,
    gpa: 3.41,
    totalCredits: 21,
    courses: [
      { courseCode: 'FT301', title: 'การฝึกภาคสนาม', credits: 3, grade: 'A' },
      { courseCode: 'LD101', title: 'ภาวะผู้นำทางทหาร', credits: 3, grade: 'B+' },
      { courseCode: 'PH201', title: 'ฟิสิกส์ประยุกต์', credits: 3, grade: 'B' },
      { courseCode: 'HI201', title: 'ประวัติศาสตร์การทหาร', credits: 3, grade: 'A' },
      { courseCode: 'EN202', title: 'ภาษาอังกฤษเพื่อวิชาชีพทหาร', credits: 3, grade: 'B+' },
      { courseCode: 'SW101', title: 'ว่ายน้ำ', credits: 1, grade: 'S' },
      { courseCode: 'PE102', title: 'กรีฑา', credits: 2, grade: 'S' },
    ],
  },
]
