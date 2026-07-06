"use server";

import { createJob, getTechnicians, updateJobStatus } from "@/lib/data/jobs";
import { requirePermission } from "@/lib/require-permission";
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
    revalidatePath("/dashboard");
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
    await updateJobStatus(id, status);
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${id}`);
    revalidatePath("/dashboard");
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
