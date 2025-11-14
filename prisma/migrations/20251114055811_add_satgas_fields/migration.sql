-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE 'RECOMMENDATION';

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "category" TEXT,
ADD COLUMN     "investigationProgress" INTEGER DEFAULT 0,
ADD COLUMN     "recommendationStatus" "RecommendationStatus" DEFAULT 'PENDING',
ADD COLUMN     "severity" TEXT;

-- CreateIndex
CREATE INDEX "Report_recommendationStatus_idx" ON "Report"("recommendationStatus");
