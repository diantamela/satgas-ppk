-- AlterEnum
ALTER TYPE "ReportStatus" ADD VALUE 'SCHEDULED';

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "evidenceCount" INTEGER DEFAULT 0,
ADD COLUMN     "scheduledBy" TEXT,
ADD COLUMN     "scheduledDate" TIMESTAMP(3),
ADD COLUMN     "scheduledNotes" TEXT;
