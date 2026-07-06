"use server";

import { requireAuth } from "@/lib/auth-guard";
import { markAsRead as dbMarkAsRead } from "@/lib/data/notifications";
import { revalidatePath } from "next/cache";

export async function markNotificationRead(id: string): Promise<{ success: boolean }> {
  try {
    await requireAuth();
    await dbMarkAsRead(id);
    revalidatePath("/notifications");
    return { success: true };
  } catch {
    return { success: false };
  }
}
