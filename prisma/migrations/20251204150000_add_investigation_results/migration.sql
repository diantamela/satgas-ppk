-- Create InvestigationResult model for recording investigation results/Berita Acara
CREATE TABLE "InvestigationResult" (
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
    "caseStatusChange" TEXT, -- New status after this session
    "statusChangeReason" TEXT, -- Reason for status change
    
    -- Digital authentication
    "dataVerificationConfirmed" BOOLEAN DEFAULT false,
    "creatorDigitalSignature" TEXT,
    "creatorSignatureDate" TIMESTAMP WITH TIME ZONE,
    "chairpersonDigitalSignature" TEXT,
    "chairpersonSignatureDate" TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Relations
    FOREIGN KEY ("processId") REFERENCES "InvestigationProcess"("id") ON DELETE CASCADE,
    FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX "InvestigationResult_processId_idx" ON "InvestigationResult"("processId");
-- Add InvestigationResult relation to InvestigationProcess model
ALTER TABLE "InvestigationProcess" 
ADD COLUMN IF NOT EXISTS "resultId" TEXT;

-- Add relation constraint
ALTER TABLE "InvestigationProcess" 
ADD CONSTRAINT "InvestigationProcess_resultId_fkey" 
FOREIGN KEY ("resultId") REFERENCES "InvestigationResult"("id") ON DELETE SET NULL;

-- Create index for the relation
CREATE INDEX "InvestigationProcess_resultId_idx" ON "InvestigationProcess"("resultId");

-- Create enums for recommendations and status changes
CREATE TYPE "RecommendedAction" AS ENUM(
    'SCHEDULE_NEXT_SESSION',
    'CALL_OTHER_PARTY',
    'REQUIRE_PSYCHOLOGICAL_SUPPORT',
    'REQUIRE_LEGAL_SUPPORT',
    'CASE_TERMINATED',
    'FORWARD_TO_REKTORAT',
    'MEDIATION_SESSION',
    'EVIDENCE_ANALYSIS',
    'WITNESS_REINTERVIEW',
    'OTHER'
);

CREATE TYPE "CaseStatusAfterResult" AS ENUM(
    'UNDER_INVESTIGATION',
    'EVIDENCE_COLLECTION',
    'STATEMENT_ANALYSIS',
    'PENDING_EXTERNAL_INPUT',
    'READY_FOR_RECOMMENDATION',
    'CLOSED_TERMINATED',
    'FORWARDED_TO_REKTORAT'
);

-- Add new fields to InvestigationResult table
ALTER TABLE "InvestigationResult" 
ADD COLUMN IF NOT EXISTS "caseStatusAfterResult" "CaseStatusAfterResult" DEFAULT 'UNDER_INVESTIGATION';

-- Create composite type for attendance tracking
CREATE TYPE "AttendanceStatus" AS ENUM(
    'PRESENT',
    'ABSENT_NO_REASON',
    'ABSENT_WITH_REASON'
);

CREATE TYPE "PartyType" AS ENUM(
    'REPORTER',
    'REPORTED_PERSON',
    'WITNESS_A',
    'WITNESS_B',
    'ACCOMPANIER',
    'LEGAL_COUNSEL',
    'PSYCHOLOGICAL_SUPPORT',
    'FAMILY_MEMBER',
    'OTHER'
);

-- Create JSONB columns for structured data
ALTER TABLE "InvestigationResult" 
ADD COLUMN IF NOT EXISTS "partiesDetailedAttendance" JSONB;

ALTER TABLE "InvestigationResult" 
ADD COLUMN IF NOT EXISTS "recommendedActionsDetails" JSONB;

-- Add hash for document integrity
ALTER TABLE "InvestigationResult" 
ADD COLUMN IF NOT EXISTS "documentHash" TEXT;

-- Add notes for internal satgas use
ALTER TABLE "InvestigationResult" 
ADD COLUMN IF NOT EXISTS "internalSatgasNotes" TEXT;
CREATE INDEX "InvestigationResult_reportId_idx" ON "InvestigationResult"("reportId");
CREATE INDEX "InvestigationResult_createdAt_idx" ON "InvestigationResult"("createdAt");
CREATE INDEX "InvestigationResult_schedulingDateTime_idx" ON "InvestigationResult"("schedulingDateTime");