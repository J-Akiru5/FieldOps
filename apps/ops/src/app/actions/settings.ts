"use server";

import { writeAuditLog } from "@/lib/data/audit-log";
import { updateSettings as dbUpdateSettings } from "@/lib/data/settings";
import { requirePermission } from "@/lib/require-permission";
import type { VatType } from "@syntaxure/db";
import { revalidatePath } from "next/cache";

export async function saveSettings(data: {
  companyName?: string;
  scheduleReminderHours?: number;
  lowStockThreshold?: number;
  defaultVatType?: string;
  workingHoursStart?: string;
  workingHoursEnd?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId, email, actorName } = await requirePermission("settings.write");
    await dbUpdateSettings({ ...data, defaultVatType: data.defaultVatType as VatType | undefined });
    revalidatePath("/settings");

    void writeAuditLog({
      actorId: userId,
      actorEmail: email ?? "",
      actorName,
      action: "UPDATE",
      entity: "SETTINGS",
      entityLabel: "App Settings",
      after: data as Record<string, unknown>,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save settings",
    };
  }
}
