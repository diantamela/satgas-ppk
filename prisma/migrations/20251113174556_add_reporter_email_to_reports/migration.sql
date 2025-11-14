/*
  Warnings:

  - You are about to drop the `ContactInquiry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ContactInquiry" DROP CONSTRAINT "ContactInquiry_userId_fkey";

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "reporterEmail" TEXT;

-- DropTable
DROP TABLE "public"."ContactInquiry";

-- DropEnum
DROP TYPE "public"."InquiryStatus";
