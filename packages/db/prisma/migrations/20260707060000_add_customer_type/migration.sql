-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('INDIVIDUAL', 'BUSINESS', 'GOVERNMENT');

-- DropIndex (clean up indices lost due to prior db push)
DROP INDEX IF EXISTS "Notification_createdAt_idx";
DROP INDEX IF EXISTS "Notification_userId_idx";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "contactPersonName" TEXT;
ALTER TABLE "Customer" ADD COLUMN "notes" TEXT;
ALTER TABLE "Customer" ADD COLUMN "type" "CustomerType" NOT NULL DEFAULT 'INDIVIDUAL';

-- CreateIndex
CREATE INDEX "Customer_type_idx" ON "Customer"("type");
CREATE INDEX "Customer_name_idx" ON "Customer"("name");
