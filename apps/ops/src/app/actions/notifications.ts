"use server";

import {
  createNotification as dbCreateNotification,
  getUnreadCount as dbGetUnreadCount,
  markAsRead as dbMarkAsRead,
} from "@/lib/data/notifications";
import { requirePermission } from "@/lib/require-permission";
import { revalidatePath } from "next/cache";

export async function markNotificationRead(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission("notifications.read");
    await dbMarkAsRead(id);
    revalidatePath("/notifications");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark as read",
    };
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<{ count: number }> {
  try {
    await requirePermission("notifications.read");
    const count = await dbGetUnreadCount(userId);
    return { count };
  } catch {
    return { count: 0 };
  }
}

export async function createNotificationAction(data: {
  userId: string;
  type: string;
  title: string;
  body: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission("notifications.write");
    await dbCreateNotification(data);
    revalidatePath("/notifications");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create notification",
    };
  }
}
