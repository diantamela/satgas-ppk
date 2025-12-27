-- CreateFinalReport
CREATE TYPE "FinalReportStatus" AS ENUM ('DRAFT', 'COMPLETED', 'ARCHIVED');

-- Add columns to Report table
ALTER TABLE "Report" 
ADD COLUMN IF NOT EXISTS "investigationStartedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "investigationCompletedAt" TIMESTAMP(3);

-- Create FinalReport table
CREATE TABLE "FinalReport" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "FinalReportStatus" NOT NULL DEFAULT 'COMPLETED',
    "completedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "investigator" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileSize" TEXT,
    "caseSummary" TEXT,
    "actionTaken" JSONB,
    "recommendations" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "FinalReport_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX "FinalReport_investigationId_key" ON "FinalReport"("investigationId");

CREATE INDEX "FinalReport_investigationId_idx" ON "FinalReport"("investigationId");

CREATE INDEX "FinalReport_status_idx" ON "FinalReport"("status");

CREATE INDEX "FinalReport_completedDate_idx" ON "FinalReport"("completedDate");

CREATE INDEX "FinalReport_createdAt_idx" ON "FinalReport"("createdAt");

-- Add foreign key constraint
ALTER TABLE "FinalReport" ADD CONSTRAINT "FinalReport_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add relation to Report model (this will be handled by Prisma)
-- Note: The relation field in Report model is already added in schema.prisma