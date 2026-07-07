"use server";

import { createNotificationAction } from "@/app/actions/notifications";
import { createJob, getTechnicians, updateJobStatus } from "@/lib/data/jobs";
import { requirePermission } from "@/lib/require-permission";
import { prisma } from "@syntaxure/db";
import type { JobStatus } from "@syntaxure/db";
import { revalidatePath } from "next/cache";

export async function createJobAction(formData: {
  customerId: string;
  applianceId?: string;
  inquiryId?: string;
  type: string;
  scheduledAt: string;
  laborFee?: number;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    await requirePermission("jobs.write");
    const result = await createJob({
      customerId: formData.customerId,
      applianceId: formData.applianceId,
      inquiryId: formData.inquiryId,
      type: formData.type,
      scheduledAt: new Date(formData.scheduledAt),
      laborFee: formData.laborFee,
    });
    revalidatePath("/jobs");
    revalidatePath("/schedule");
    revalidatePath("/dashboard");

    const owner = await prisma.staffMember.findFirst({
      where: { role: "OWNER" },
      select: { authUserId: true },
    });
    const customer = await prisma.customer.findUnique({
      where: { id: formData.customerId },
      select: { displayName: true },
    });
    if (owner && customer) {
      await createNotificationAction({
        userId: owner.authUserId,
        type: "job",
        title: "Job scheduled",
        body: `${customer.displayName} — ${formData.type} on ${new Date(formData.scheduledAt).toLocaleDateString()}`,
      });
    }
    return { success: true, id: result.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create job",
    };
  }
}

export async function updateJobStatusAction(
  id: string,
  status: JobStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission("jobs.write");
    const job = await prisma.job.findUnique({
      where: { id },
      include: { customer: { select: { displayName: true } } },
    });
    await updateJobStatus(id, status);
    revalidatePath("/jobs");
    revalidatePath("/schedule");
    revalidatePath(`/jobs/${id}`);
    revalidatePath("/dashboard");

    if (status === "COMPLETED" && job) {
      const owner = await prisma.staffMember.findFirst({
        where: { role: "OWNER" },
        select: { authUserId: true },
      });
      if (owner) {
        await createNotificationAction({
          userId: owner.authUserId,
          type: "job",
          title: "Job completed",
          body: `${job.customer.displayName} — ${job.type} marked as completed`,
        });
      }
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}

export async function getTechniciansAction() {
  try {
    await requirePermission("jobs.read");
    return getTechnicians();
  } catch {
    return [];
  }
}
