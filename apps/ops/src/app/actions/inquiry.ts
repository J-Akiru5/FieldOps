"use server";

import { requirePermission } from "@/lib/require-permission";
import { prisma } from "@syntaxure/db";
import { type InquirySource, InquiryStatus } from "@syntaxure/db";
import { revalidatePath } from "next/cache";

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission("inquiries.write");
    await prisma.inquiry.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/inquiries");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update inquiry status",
    };
  }
}

export async function createInquiry(data: {
  contactName: string;
  phone: string;
  email?: string;
  message: string;
  source: InquirySource;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission("inquiries.write");
    await prisma.inquiry.create({
      data: {
        contactName: data.contactName,
        phone: data.phone,
        email: data.email || null,
        message: data.message,
        source: data.source,
        status: InquiryStatus.NEW,
      },
    });
    revalidatePath("/inquiries");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create inquiry",
    };
  }
}
