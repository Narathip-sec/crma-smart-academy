/*
  Warnings:

  - You are about to drop the `Cadet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Enrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GradeRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduleEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('draft', 'open', 'closed', 'cancelled');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "LostFoundStatus" AS ENUM ('reported', 'matched', 'claimed', 'closed');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('in_app', 'line_push');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'moderator';

-- DropForeignKey
ALTER TABLE "Cadet" DROP CONSTRAINT "Cadet_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_cadetId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "GradeRecord" DROP CONSTRAINT "GradeRecord_cadetId_fkey";

-- DropForeignKey
ALTER TABLE "GradeRecord" DROP CONSTRAINT "GradeRecord_courseId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleEntry" DROP CONSTRAINT "ScheduleEntry_courseId_fkey";

-- AlterTable
ALTER TABLE "MealItem" ADD COLUMN     "mealDayId" TEXT;

-- DropTable
DROP TABLE "Cadet";

-- DropTable
DROP TABLE "Course";

-- DropTable
DROP TABLE "Enrollment";

-- DropTable
DROP TABLE "GradeRecord";

-- DropTable
DROP TABLE "ScheduleEntry";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'cadet',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CadetProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentCode" TEXT NOT NULL,
    "thaiName" TEXT NOT NULL,
    "englishName" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "yearLevel" INTEGER NOT NULL,
    "companyId" TEXT NOT NULL,
    "battalion" TEXT NOT NULL,

    CONSTRAINT "CadetProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lineUserId" TEXT NOT NULL,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LineAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedBy" TEXT,

    CONSTRAINT "RoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "titleTh" TEXT NOT NULL,
    "titleEn" TEXT,
    "bodyTh" TEXT NOT NULL,
    "bodyEn" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "publishAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL,
    "titleTh" TEXT NOT NULL,
    "titleEn" TEXT,
    "bodyTh" TEXT NOT NULL,
    "bodyEn" TEXT,
    "imageUrl" TEXT,
    "publishAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileAsset" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "nameTh" TEXT,
    "nameEn" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "announcementId" TEXT,
    "activityEventId" TEXT,

    CONSTRAINT "FileAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealMonth" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceFile" TEXT,

    CONSTRAINT "MealMonth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealDay" (
    "id" TEXT NOT NULL,
    "mealMonthId" TEXT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "MealDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "titleTh" TEXT NOT NULL,
    "titleEn" TEXT,
    "descriptionTh" TEXT,
    "descriptionEn" TEXT,
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskCompletion" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskComment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bodyTh" TEXT NOT NULL,
    "bodyEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityCategory" (
    "id" TEXT NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT,
    "iconKey" TEXT,

    CONSTRAINT "ActivityCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityEvent" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT,
    "creatorId" TEXT NOT NULL,
    "titleTh" TEXT NOT NULL,
    "titleEn" TEXT,
    "descriptionTh" TEXT,
    "descriptionEn" TEXT,
    "location" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "maxAttendees" INTEGER,
    "status" "ActivityStatus" NOT NULL DEFAULT 'draft',
    "modStatus" "ModerationStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityAttendee" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attended" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ActivityAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityComment" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bodyTh" TEXT NOT NULL,
    "bodyEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityModerationLog" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityModerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportCategory" (
    "id" TEXT NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT,
    "iconKey" TEXT,

    CONSTRAINT "ReportCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceTeam" (
    "id" TEXT NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT,

    CONSTRAINT "MaintenanceTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportTicket" (
    "id" TEXT NOT NULL,
    "ticketNo" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "categoryId" TEXT,
    "teamId" TEXT,
    "titleTh" TEXT NOT NULL,
    "descriptionTh" TEXT NOT NULL,
    "locationId" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportLocation" (
    "id" TEXT NOT NULL,
    "nameTh" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "mapPin" TEXT,

    CONSTRAINT "ReportLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportAttachment" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,

    CONSTRAINT "ReportAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportStatusEvent" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "fromStatus" "ReportStatus",
    "toStatus" "ReportStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LostFoundCategory" (
    "id" TEXT NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT,
    "iconKey" TEXT,

    CONSTRAINT "LostFoundCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LostFoundItem" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "categoryId" TEXT,
    "titleTh" TEXT NOT NULL,
    "descriptionTh" TEXT NOT NULL,
    "foundAt" DATE,
    "foundLocation" TEXT,
    "status" "LostFoundStatus" NOT NULL DEFAULT 'reported',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LostFoundItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LostFoundClaim" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "claimantId" TEXT NOT NULL,
    "note" TEXT,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LostFoundClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LostFoundAttachment" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,

    CONSTRAINT "LostFoundAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LostFoundStatusEvent" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "fromStatus" "LostFoundStatus",
    "toStatus" "LostFoundStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LostFoundStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT,
    "iconKey" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT,
    "descriptionTh" TEXT,
    "url" TEXT,
    "iconKey" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ServiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titleTh" TEXT NOT NULL,
    "bodyTh" TEXT NOT NULL,
    "deepLink" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationDelivery" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "failReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "meta" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CadetProfile_userId_key" ON "CadetProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CadetProfile_studentCode_key" ON "CadetProfile"("studentCode");

-- CreateIndex
CREATE INDEX "CadetProfile_companyId_idx" ON "CadetProfile"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "LineAccount_userId_key" ON "LineAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LineAccount_lineUserId_key" ON "LineAccount"("lineUserId");

-- CreateIndex
CREATE UNIQUE INDEX "RoleAssignment_userId_role_key" ON "RoleAssignment"("userId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "MealMonth_year_month_key" ON "MealMonth"("year", "month");

-- CreateIndex
CREATE INDEX "MealDay_date_idx" ON "MealDay"("date");

-- CreateIndex
CREATE UNIQUE INDEX "MealDay_mealMonthId_date_key" ON "MealDay"("mealMonthId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "TaskAssignment_taskId_userId_key" ON "TaskAssignment"("taskId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskCompletion_taskId_userId_key" ON "TaskCompletion"("taskId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityCategory_nameTh_key" ON "ActivityCategory"("nameTh");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityAttendee_activityId_userId_key" ON "ActivityAttendee"("activityId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportCategory_nameTh_key" ON "ReportCategory"("nameTh");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceTeam_nameTh_key" ON "MaintenanceTeam"("nameTh");

-- CreateIndex
CREATE UNIQUE INDEX "ReportTicket_ticketNo_key" ON "ReportTicket"("ticketNo");

-- CreateIndex
CREATE INDEX "ReportTicket_reporterId_idx" ON "ReportTicket"("reporterId");

-- CreateIndex
CREATE INDEX "ReportTicket_status_idx" ON "ReportTicket"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ReportAttachment_assetId_key" ON "ReportAttachment"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "LostFoundCategory_nameTh_key" ON "LostFoundCategory"("nameTh");

-- CreateIndex
CREATE INDEX "LostFoundItem_status_idx" ON "LostFoundItem"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LostFoundClaim_itemId_claimantId_key" ON "LostFoundClaim"("itemId", "claimantId");

-- CreateIndex
CREATE UNIQUE INDEX "LostFoundAttachment_assetId_key" ON "LostFoundAttachment"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_nameTh_key" ON "ServiceCategory"("nameTh");

-- CreateIndex
CREATE INDEX "ServiceItem_categoryId_idx" ON "ServiceItem"("categoryId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDelivery_notificationId_channel_key" ON "NotificationDelivery"("notificationId", "channel");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "CadetProfile" ADD CONSTRAINT "CadetProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CadetProfile" ADD CONSTRAINT "CadetProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineAccount" ADD CONSTRAINT "LineAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAssignment" ADD CONSTRAINT "RoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_activityEventId_fkey" FOREIGN KEY ("activityEventId") REFERENCES "ActivityEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealDay" ADD CONSTRAINT "MealDay_mealMonthId_fkey" FOREIGN KEY ("mealMonthId") REFERENCES "MealMonth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealItem" ADD CONSTRAINT "MealItem_mealDayId_fkey" FOREIGN KEY ("mealDayId") REFERENCES "MealDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskCompletion" ADD CONSTRAINT "TaskCompletion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskCompletion" ADD CONSTRAINT "TaskCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ActivityCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttendee" ADD CONSTRAINT "ActivityAttendee_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "ActivityEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttendee" ADD CONSTRAINT "ActivityAttendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityComment" ADD CONSTRAINT "ActivityComment_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "ActivityEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityComment" ADD CONSTRAINT "ActivityComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityModerationLog" ADD CONSTRAINT "ActivityModerationLog_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "ActivityEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityModerationLog" ADD CONSTRAINT "ActivityModerationLog_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportTicket" ADD CONSTRAINT "ReportTicket_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportTicket" ADD CONSTRAINT "ReportTicket_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ReportCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportTicket" ADD CONSTRAINT "ReportTicket_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "MaintenanceTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportTicket" ADD CONSTRAINT "ReportTicket_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "ReportLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportAttachment" ADD CONSTRAINT "ReportAttachment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ReportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportAttachment" ADD CONSTRAINT "ReportAttachment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FileAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportStatusEvent" ADD CONSTRAINT "ReportStatusEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ReportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportStatusEvent" ADD CONSTRAINT "ReportStatusEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostFoundItem" ADD CONSTRAINT "LostFoundItem_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostFoundItem" ADD CONSTRAINT "LostFoundItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LostFoundCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostFoundClaim" ADD CONSTRAINT "LostFoundClaim_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "LostFoundItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostFoundClaim" ADD CONSTRAINT "LostFoundClaim_claimantId_fkey" FOREIGN KEY ("claimantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostFoundAttachment" ADD CONSTRAINT "LostFoundAttachment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "LostFoundItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostFoundAttachment" ADD CONSTRAINT "LostFoundAttachment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FileAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostFoundStatusEvent" ADD CONSTRAINT "LostFoundStatusEvent_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "LostFoundItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostFoundStatusEvent" ADD CONSTRAINT "LostFoundStatusEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceItem" ADD CONSTRAINT "ServiceItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
