-- CreateEnum
CREATE TYPE "LedgerCategory" AS ENUM ('INCOME', 'OPERATING_EXPENSE', 'PARTNER_DRAW');

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "particulars" TEXT NOT NULL,
    "category" "LedgerCategory" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "remarks" TEXT,
    "isVoided" BOOLEAN NOT NULL DEFAULT false,
    "voidedAt" TIMESTAMP(3),
    "voidedBy" TEXT,
    "voidedReason" TEXT,
    "partnerId" TEXT,
    "jobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LedgerEntry_isVoided_date_idx" ON "LedgerEntry"("isVoided", "date");

-- CreateIndex
CREATE INDEX "LedgerEntry_isVoided_category_idx" ON "LedgerEntry"("isVoided", "category");

-- CreateIndex
CREATE INDEX "LedgerEntry_partnerId_idx" ON "LedgerEntry"("partnerId");

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: add operational date to SalesTransaction for date-aligned equity reporting
ALTER TABLE "SalesTransaction" ADD COLUMN "transactionDate" TIMESTAMP(3);
