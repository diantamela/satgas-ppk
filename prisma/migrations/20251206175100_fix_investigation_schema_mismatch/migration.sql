-- Fix schema mismatch: Rename InvestigationSchedule to InvestigationProcess
-- This migration addresses the discrepancy between the Prisma schema (InvestigationProcess) 
-- and the actual database table (InvestigationSchedule)

-- First, let's drop the existing foreign key constraints that reference the wrong table
ALTER TABLE "InvestigationTeamMember" DROP CONSTRAINT IF EXISTS "InvestigationTeamMember_scheduleId_fkey";
ALTER TABLE "InvestigationAttachment" DROP CONSTRAINT IF EXISTS "InvestigationAttachment_scheduleId_fkey";

-- Rename the main table from InvestigationSchedule to InvestigationProcess
ALTER TABLE "InvestigationSchedule" RENAME TO "InvestigationProcess";

-- Update the foreign key column names to match Prisma schema
ALTER TABLE "InvestigationTeamMember" RENAME COLUMN "scheduleId" TO "processId";
ALTER TABLE "InvestigationAttachment" RENAME COLUMN "scheduleId" TO "processId";

-- Add missing columns that exist in Prisma schema but not in database
ALTER TABLE "InvestigationProcess" 
ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'IN_PROGRESS',
ADD COLUMN IF NOT EXISTS "createdById" TEXT,
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- Update the foreign key constraints with new names
ALTER TABLE "InvestigationTeamMember" 
ADD CONSTRAINT "InvestigationTeamMember_processId_fkey" 
FOREIGN KEY ("processId") REFERENCES "InvestigationProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InvestigationAttachment" 
ADD CONSTRAINT "InvestigationAttachment_processId_fkey" 
FOREIGN KEY ("processId") REFERENCES "InvestigationProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS "InvestigationProcess_status_idx" ON "InvestigationProcess"("status");
CREATE INDEX IF NOT EXISTS "InvestigationProcess_createdAt_idx" ON "InvestigationProcess"("createdAt");

-- Create unique constraint that Prisma expects
ALTER TABLE "InvestigationTeamMember" 
ADD CONSTRAINT "InvestigationTeamMember_processId_userId_key" 
UNIQUE ("processId", "userId");

-- Drop the old unique constraint if it exists
ALTER TABLE "InvestigationTeamMember" DROP CONSTRAINT IF EXISTS "InvestigationTeamMember_scheduleId_userId_key";

-- Update foreign key for InvestigationProcess -> Report
ALTER TABLE "InvestigationProcess" 
ADD CONSTRAINT "InvestigationProcess_reportId_fkey" 
FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update foreign key for InvestigationProcess -> User (createdBy)
ALTER TABLE "InvestigationProcess" 
ADD CONSTRAINT "InvestigationProcess_createdById_fkey" 
FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add InvestigationResult table if it doesn't exist
CREATE TABLE IF NOT EXISTS "InvestigationResult" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "processId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    
    -- Auto-populated metadata from scheduling
    "schedulingId" TEXT,
    "schedulingTitle" TEXT,
    "schedulingDateTime" TIMESTAMP WITH TIME ZONE,
    "schedulingLocation" TEXT,
    "caseTitle" TEXT,
    "reportNumber" TEXT,
    
    -- Attendance tracking
    "satgasMembersPresent" JSONB, -- Array of satgas members who attended
    "partiesPresent" JSONB, -- Array of parties involved with attendance status
    "identityVerified" BOOLEAN DEFAULT false,
    "attendanceNotes" TEXT,
    
    -- Key investigation notes
    "partiesStatementSummary" TEXT, -- Ringkasan keterangan pihak
    "newPhysicalEvidence" TEXT, -- Temuan bukti fisik/digital baru
    "evidenceFiles" JSONB, -- Uploaded evidence files
    "statementConsistency" TEXT, -- Konsistensi keterangan
    
    -- Interim conclusions and recommendations
    "sessionInterimConclusion" TEXT,
    "recommendedImmediateActions" JSONB, -- Array of recommended actions
    "caseStatusAfterResult" TEXT DEFAULT 'UNDER_INVESTIGATION',
    "statusChangeReason" TEXT,
    
    -- Digital authentication
    "dataVerificationConfirmed" BOOLEAN DEFAULT false,
    "creatorDigitalSignature" TEXT,
    "creatorSignatureDate" TIMESTAMP WITH TIME ZONE,
    "chairpersonDigitalSignature" TEXT,
    "chairpersonSignatureDate" TIMESTAMP WITH TIME ZONE,
    
    -- Additional fields
    "partiesDetailedAttendance" JSONB,
    "recommendedActionsDetails" JSONB,
    "documentHash" TEXT,
    "internalSatgasNotes" TEXT,
    
    -- Timestamps
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Relations
    FOREIGN KEY ("processId") REFERENCES "InvestigationProcess"("id") ON DELETE CASCADE,
    FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE
);

-- Create indexes for InvestigationResult
CREATE INDEX IF NOT EXISTS "InvestigationResult_processId_idx" ON "InvestigationResult"("processId");
CREATE INDEX IF NOT EXISTS "InvestigationResult_reportId_idx" ON "InvestigationResult"("reportId");
CREATE INDEX IF NOT EXISTS "InvestigationResult_createdAt_idx" ON "InvestigationResult"("createdAt");
CREATE INDEX IF NOT EXISTS "InvestigationResult_schedulingDateTime_idx" ON "InvestigationResult"("schedulingDateTime");