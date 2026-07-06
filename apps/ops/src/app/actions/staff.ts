"use server";

import { requirePermission } from "@/lib/require-permission";
import { type StaffRole, prisma } from "@syntaxure/db";
import { revalidatePath } from "next/cache";

export async function inviteStaff(
  email: string,
  name: string,
  role: StaffRole
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission("staff.write");
    await prisma.staffMember.create({
      data: { authUserId: email, name, role },
    });
    revalidatePath("/staff");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to invite staff",
    };
  }
}

export async function updateStaffRole(
  staffId: string,
  role: StaffRole
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission("staff.write");
    await prisma.staffMember.update({
      where: { id: staffId },
      data: { role },
    });
    revalidatePath("/staff");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update role",
    };
  }
}

export async function removeStaff(staffId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission("staff.write");
    await prisma.staffMember.delete({ where: { id: staffId } });
    revalidatePath("/staff");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove staff",
    };
  }
}
