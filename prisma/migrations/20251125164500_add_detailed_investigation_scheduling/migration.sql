-- CreateEnum
CREATE TYPE "InvestigationMethod" AS ENUM('INTERVIEW', 'WRITTEN_CLARIFICATION', 'LOCATION_OBSERVATION', 'DIGITAL_EVIDENCE_COLLECTION', 'MEDIATION', 'OTHER');

-- CreateEnum
CREATE TYPE "InvestigationParty" AS ENUM('VICTIM_SURVIVOR', 'REPORTED_PERSON', 'WITNESS', 'OTHER_PARTY');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM('TEAM_LEADER', 'NOTE_TAKER', 'PSYCHOLOGICAL_SUPPORT', 'LEGAL_SUPPORT', 'INVESTIGATOR', 'OTHER');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM('CORE_TEAM_ONLY', 'FULL_SATGAS', 'LEADERSHIP_ONLY');

-- CreateTable
CREATE TABLE "InvestigationSchedule" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "methods" "InvestigationMethod"[],
    "partiesInvolved" "InvestigationParty"[],
    "otherPartiesDetails" TEXT,
    "consentObtained" BOOLEAN NOT NULL DEFAULT false,
    "consentDocumentation" TEXT,
    "riskNotes" TEXT,
    "planSummary" TEXT,
    "followUpAction" TEXT,
    "followUpDate" TIMESTAMP(3),
    "followUpNotes" TEXT,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'CORE_TEAM_ONLY',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestigationSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestigationTeamMember" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL,
    "customRole" TEXT,

    CONSTRAINT "InvestigationTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestigationAttachment" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "description" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestigationAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvestigationSchedule_reportId_idx" ON "InvestigationSchedule"("reportId");

-- CreateIndex
CREATE INDEX "InvestigationSchedule_status_idx" ON "InvestigationSchedule"("status");

-- CreateIndex
CREATE INDEX "InvestigationSchedule_createdAt_idx" ON "InvestigationSchedule"("createdAt");

-- CreateIndex
CREATE INDEX "InvestigationTeamMember_scheduleId_idx" ON "InvestigationTeamMember"("scheduleId");

-- CreateIndex
CREATE INDEX "InvestigationTeamMember_userId_idx" ON "InvestigationTeamMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestigationTeamMember_scheduleId_userId_key" ON "InvestigationTeamMember"("scheduleId", "userId");

-- CreateIndex
CREATE INDEX "InvestigationAttachment_scheduleId_idx" ON "InvestigationAttachment"("scheduleId");

-- CreateIndex
CREATE INDEX "InvestigationAttachment_uploadedById_idx" ON "InvestigationAttachment"("uploadedById");

-- This foreign key was incorrect - removing it

-- AddForeignKey
ALTER TABLE "InvestigationSchedule" ADD CONSTRAINT "InvestigationSchedule_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationSchedule" ADD CONSTRAINT "InvestigationSchedule_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationTeamMember" ADD CONSTRAINT "InvestigationTeamMember_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "InvestigationSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationTeamMember" ADD CONSTRAINT "InvestigationTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationAttachment" ADD CONSTRAINT "InvestigationAttachment_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "InvestigationSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationAttachment" ADD CONSTRAINT "InvestigationAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;