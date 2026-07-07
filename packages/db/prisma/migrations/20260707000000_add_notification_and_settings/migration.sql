-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "companyName" TEXT NOT NULL DEFAULT 'J.R.R. Aircon & Electronics',
    "scheduleReminderHours" INTEGER NOT NULL DEFAULT 24,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "defaultVatType" "VatType" NOT NULL DEFAULT 'VAT_INCLUSIVE',
    "workingHoursStart" TEXT NOT NULL DEFAULT '08:00',
    "workingHoursEnd" TEXT NOT NULL DEFAULT '17:00',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
