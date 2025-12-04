-- Add new enums for comprehensive investigation scheduling
CREATE TYPE "InvestigationActivityType" AS ENUM(
  'VICTIM_INTERVIEW', 
  'WITNESS_INTERVIEW', 
  'REPORTED_PERSON_INTERVIEW', 
  'EVIDENCE_COLLECTION', 
  'LOCATION_OBSERVATION', 
  'MEDIATION_SESSION', 
  'CONFRONTATION', 
  'FOLLOW_UP_INTERVIEW',
  'CASE_REVIEW',
  'OTHER'
);

CREATE TYPE "EquipmentItem" AS ENUM(
  'CAMERA_RECORDER',
  'AUDIO_RECORDER', 
  'PRINTED_FORMS',
  'PROJECTOR_SCREEN',
  'COMPUTER_LAPTOP',
  'PRINTER',
  'NOTARY_PRESENCE',
  'LEGAL_COUNSEL',
  'PSYCHOLOGICAL_SUPPORT',
  'TRANSLATOR',
  'SECURITY_PERSONNEL',
  'VIDEO_CONFERENCE_SETUP'
);

CREATE TYPE "CompanionRequirement" AS ENUM(
  'PSYCHOLOGIST',
  'COUNSELOR', 
  'LEGAL_ADVISOR',
  'RELIGIOUS_COUNSELOR',
  'FAMILY_MEMBER',
  'FRIEND_SUPPORT',
  'ADVOCATE',
  'NONE'
);

-- Add new fields to InvestigationProcess model
ALTER TABLE "InvestigationProcess" 
ADD COLUMN IF NOT EXISTS "activityTitle" TEXT,
ADD COLUMN IF NOT EXISTS "activityType" "InvestigationActivityType",
ADD COLUMN IF NOT EXISTS "caseAutoInfo" JSONB, -- Store auto-populated case info
ADD COLUMN IF NOT EXISTS "equipmentChecklist" "EquipmentItem"[],
ADD COLUMN IF NOT EXISTS "otherEquipmentDetails" TEXT,
ADD COLUMN IF NOT EXISTS "companionRequirements" "CompanionRequirement"[],
ADD COLUMN IF NOT EXISTS "companionDetails" TEXT,
ADD COLUMN IF NOT EXISTS "internalSatgasNotes" TEXT, -- OTAN-only notes
ADD COLUMN IF NOT EXISTS "nextStepsAfterCompletion" TEXT, -- Detailed follow-up planning
ADD COLUMN IF NOT EXISTS "estimatedDuration" INTEGER, -- in minutes
ADD COLUMN IF NOT EXISTS "caseSummary" TEXT; -- Auto-populated case summary

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS "InvestigationProcess_activityType_idx" ON "InvestigationProcess"("activityType");
CREATE INDEX IF NOT EXISTS "InvestigationProcess_estimatedDuration_idx" ON "InvestigationProcess"("estimatedDuration");

-- Update InvestigationTeamMember to support chairman assignments
ALTER TABLE "InvestigationTeamMember" 
ADD COLUMN IF NOT EXISTS "isChairPerson" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "responsibilityNotes" TEXT;

-- Add index for chairman assignments
CREATE INDEX IF NOT EXISTS "InvestigationTeamMember_isChairPerson_idx" ON "InvestigationTeamMember"("isChairPerson");