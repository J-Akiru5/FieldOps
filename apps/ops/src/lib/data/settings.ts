import { prisma } from "@syntaxure/db";
import type { VatType } from "@syntaxure/db";

export async function getSettings() {
  return prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
}

export async function updateSettings(data: {
  companyName?: string;
  scheduleReminderHours?: number;
  lowStockThreshold?: number;
  defaultVatType?: VatType;
  workingHoursStart?: string;
  workingHoursEnd?: string;
}) {
  return prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
}
