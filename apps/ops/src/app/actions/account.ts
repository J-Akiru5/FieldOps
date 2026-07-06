"use server";

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@syntaxure/db";
import { StaffRole } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { revalidatePath } from "next/cache";

export async function updateStaffName(name: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await requireAuth();
    await prisma.staffMember.upsert({
      where: { authUserId: userId },
      update: { name },
      create: { authUserId: userId, name, role: StaffRole.TECHNICIAN },
    });
    revalidatePath("/account");
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update name",
    };
  }
}

export async function changePassword(): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return { success: false, error: "No email address found" };

    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/ops/update-password`,
    });

    return { success: true, message: "Password reset email sent. Check your inbox." };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send reset email",
    };
  }
}
