-- Create Gallery table manually since migration wasn't applied
CREATE TABLE IF NOT EXISTS "Gallery" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Gallery_uploadedById_idx" ON "Gallery"("uploadedById");
CREATE INDEX IF NOT EXISTS "Gallery_createdAt_idx" ON "Gallery"("createdAt");

-- Add foreign key constraint (only if User table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'User') THEN
        ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_uploadedById_fkey" 
        FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END
$$;