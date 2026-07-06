"use server";

import { markAsRead as dbMarkAsRead } from "@/lib/data/notifications";
import { requirePermission } from "@/lib/require-permission";
import { revalidatePath } from "next/cache";

export async function markNotificationRead(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission("notifications.read");
    await dbMarkAsRead(id);
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark as read",
    };
  }
}
