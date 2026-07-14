-- AlterTable
ALTER TABLE "CadetProfile" ADD COLUMN     "yearRank" INTEGER,
ADD COLUMN     "yearRankTotal" INTEGER;

-- CreateTable
CREATE TABLE "Semester" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "id" TEXT NOT NULL,
    "cadetProfileId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseNameTh" TEXT NOT NULL,
    "courseNameEn" TEXT,
    "credits" INTEGER NOT NULL,
    "grade" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Semester_label_key" ON "Semester"("label");

-- CreateIndex
CREATE INDEX "Semester_order_idx" ON "Semester"("order");

-- CreateIndex
CREATE INDEX "Grade_cadetProfileId_idx" ON "Grade"("cadetProfileId");

-- CreateIndex
CREATE INDEX "Grade_semesterId_idx" ON "Grade"("semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_cadetProfileId_semesterId_courseCode_key" ON "Grade"("cadetProfileId", "semesterId", "courseCode");

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_cadetProfileId_fkey" FOREIGN KEY ("cadetProfileId") REFERENCES "CadetProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;
