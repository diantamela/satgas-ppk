-- Add signer name columns to InvestigationResult table
ALTER TABLE "InvestigationResult" 
ADD COLUMN "creatorSignerName" TEXT,
ADD COLUMN "chairpersonSignerName" TEXT;