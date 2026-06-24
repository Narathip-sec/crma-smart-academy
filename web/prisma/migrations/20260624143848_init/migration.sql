-- CreateEnum
CREATE TYPE "Role" AS ENUM ('cadet', 'instructor', 'command');

-- CreateEnum
CREATE TYPE "ClassCategory" AS ENUM ('academic', 'military', 'pe', 'advisory', 'self_study');

-- CreateEnum
CREATE TYPE "CalendarCategory" AS ENUM ('academic', 'exam', 'military', 'activity', 'holiday', 'deadline');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('breakfast', 'lunch', 'dinner');

-- CreateTable
CREATE TABLE "Cadet" (
    "id" TEXT NOT NULL,
    "lineUserId" TEXT,
    "email" TEXT NOT NULL,
    "thaiName" TEXT NOT NULL,
    "englishName" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "yearLevel" INTEGER NOT NULL,
    "studentCode" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "battalion" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'cadet',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cadet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "thaiName" TEXT NOT NULL,
    "englishName" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "cadetId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeRecord" (
    "id" TEXT NOT NULL,
    "cadetId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GradeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleEntry" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "ScheduleEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassPeriod" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "dayTh" TEXT NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "courseCode" TEXT,
    "courseName" TEXT NOT NULL,
    "section" TEXT,
    "instructor" TEXT,
    "room" TEXT,
    "remarks" TEXT,
    "category" "ClassCategory" NOT NULL DEFAULT 'academic',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicCalendarEvent" (
    "id" TEXT NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "thaiDateLabel" TEXT,
    "dayOfWeekTh" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "titleTh" TEXT NOT NULL,
    "titleEn" TEXT,
    "category" "CalendarCategory" NOT NULL DEFAULT 'academic',
    "note" TEXT,
    "sourcePage" INTEGER,
    "sourceRow" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicCalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealItem" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mealType" "MealType" NOT NULL,
    "menuTh" TEXT NOT NULL,
    "menuEn" TEXT,
    "note" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cadet_lineUserId_key" ON "Cadet"("lineUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Cadet_email_key" ON "Cadet"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cadet_studentCode_key" ON "Cadet"("studentCode");

-- CreateIndex
CREATE INDEX "Cadet_companyId_idx" ON "Cadet"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_semester_year_key" ON "Course"("code", "semester", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_cadetId_courseId_semester_year_key" ON "Enrollment"("cadetId", "courseId", "semester", "year");

-- CreateIndex
CREATE UNIQUE INDEX "GradeRecord_cadetId_courseId_semester_year_key" ON "GradeRecord"("cadetId", "courseId", "semester", "year");

-- CreateIndex
CREATE INDEX "ScheduleEntry_courseId_dayOfWeek_idx" ON "ScheduleEntry"("courseId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "ClassPeriod_date_idx" ON "ClassPeriod"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ClassPeriod_date_periodLabel_courseName_key" ON "ClassPeriod"("date", "periodLabel", "courseName");

-- CreateIndex
CREATE INDEX "AcademicCalendarEvent_academicYear_date_idx" ON "AcademicCalendarEvent"("academicYear", "date");

-- CreateIndex
CREATE INDEX "AcademicCalendarEvent_academicYear_category_idx" ON "AcademicCalendarEvent"("academicYear", "category");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicCalendarEvent_academicYear_date_titleTh_key" ON "AcademicCalendarEvent"("academicYear", "date", "titleTh");

-- CreateIndex
CREATE INDEX "MealItem_date_idx" ON "MealItem"("date");

-- CreateIndex
CREATE UNIQUE INDEX "MealItem_date_mealType_key" ON "MealItem"("date", "mealType");

-- AddForeignKey
ALTER TABLE "Cadet" ADD CONSTRAINT "Cadet_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_cadetId_fkey" FOREIGN KEY ("cadetId") REFERENCES "Cadet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeRecord" ADD CONSTRAINT "GradeRecord_cadetId_fkey" FOREIGN KEY ("cadetId") REFERENCES "Cadet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeRecord" ADD CONSTRAINT "GradeRecord_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
