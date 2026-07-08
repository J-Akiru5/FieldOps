"use server";

import { writeAuditLog } from "@/lib/data/audit-log";
import { requirePermission } from "@/lib/require-permission";
import { type StaffRole, prisma } from "@syntaxure/db";
import { revalidatePath } from "next/cache";

export async function inviteStaff(
  email: string,
  name: string,
  role: StaffRole
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId, email: actorEmail, actorName } = await requirePermission("staff.write");
    await prisma.staffMember.create({
      data: { authUserId: email, name, role },
    });
    revalidatePath("/staff");

    void writeAuditLog({
      actorId: userId,
      actorEmail: actorEmail ?? "",
      actorName,
      action: "CREATE",
      entity: "STAFF_MEMBER",
      entityLabel: `${name} (${role})`,
    });

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
    const { userId, email, actorName } = await requirePermission("staff.write");
    const staff = await prisma.staffMember.findUnique({
      where: { id: staffId },
      select: { name: true, role: true },
    });
    await prisma.staffMember.update({
      where: { id: staffId },
      data: { role },
    });
    revalidatePath("/staff");

    void writeAuditLog({
      actorId: userId,
      actorEmail: email ?? "",
      actorName,
      action: "UPDATE",
      entity: "STAFF_MEMBER",
      entityId: staffId,
      entityLabel: staff?.name ?? staffId,
      before: { role: staff?.role },
      after: { role },
    });

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
    const { userId, email, actorName } = await requirePermission("staff.write");
    const staff = await prisma.staffMember.findUnique({
      where: { id: staffId },
      select: { name: true },
    });
    await prisma.staffMember.delete({ where: { id: staffId } });
    revalidatePath("/staff");

    void writeAuditLog({
      actorId: userId,
      actorEmail: email ?? "",
      actorName,
      action: "DELETE",
      entity: "STAFF_MEMBER",
      entityId: staffId,
      entityLabel: staff?.name ?? staffId,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove staff",
    };
  }
}
