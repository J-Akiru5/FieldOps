"use server";

import { prisma } from "@syntaxure/db";
import { type InquirySource, InquiryStatus } from "@syntaxure/db";
import { revalidatePath } from "next/cache";

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  await prisma.inquiry.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/inquiries");
  revalidatePath("/dashboard");
}

export async function createInquiry(data: {
  contactName: string;
  phone: string;
  email?: string;
  message: string;
  source: InquirySource;
}) {
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
}
