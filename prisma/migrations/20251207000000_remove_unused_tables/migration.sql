-- Remove unused tables
DROP TABLE IF EXISTS "ActivityLog" CASCADE;
DROP TABLE IF EXISTS "InvestigationAttachment" CASCADE;
DROP TABLE IF EXISTS "InvestigationActivityAttachment" CASCADE;
DROP TABLE IF EXISTS "Article" CASCADE;
DROP TABLE IF EXISTS "Gallery" CASCADE;

-- Drop related indexes
DROP INDEX IF EXISTS "ActivityLog_userId_idx";
DROP INDEX IF EXISTS "ActivityLog_reportId_idx";
DROP INDEX IF EXISTS "ActivityLog_timestamp_idx";
DROP INDEX IF EXISTS "ActivityLog_action_idx";
DROP INDEX IF EXISTS "InvestigationAttachment_uploadedById_idx";
DROP INDEX IF EXISTS "InvestigationActivityAttachment_activityId_idx";
DROP INDEX IF EXISTS "InvestigationActivityAttachment_uploadedById_idx";
DROP INDEX IF EXISTS "Article_authorId_idx";
DROP INDEX IF EXISTS "Article_status_idx";
DROP INDEX IF EXISTS "Article_publishedAt_idx";
DROP INDEX IF EXISTS "Gallery_uploadedById_idx";
DROP INDEX IF EXISTS "Gallery_createdAt_idx";

-- Drop unused enums
DROP TYPE IF EXISTS "ArticleStatus";