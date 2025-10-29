-- Update role field to use enum values (migrate from lowercase to uppercase)
-- First, update existing values to match the enum format
UPDATE "users" SET "role" = UPPER("role");

-- Since PostgreSQL enum requires a new type creation, we'll alter the column to ensure it only accepts the specified values
-- We'll create a check constraint to ensure data integrity
ALTER TABLE "users" ADD CONSTRAINT "users_role_check" 
CHECK ("role" IN ('USER', 'SATGAS', 'REKTOR'));

-- Update the default value to match the enum format (uppercase)
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';