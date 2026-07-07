-- AlterTable
ALTER TABLE "Job" ADD COLUMN "description" TEXT;
ALTER TABLE "Job" ADD COLUMN "serviceCategory" TEXT;
ALTER TABLE "Job" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "Job" ADD COLUMN "estimatedDuration" INTEGER;
