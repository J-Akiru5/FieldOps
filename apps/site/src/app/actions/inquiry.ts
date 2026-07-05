"use server";

import { type InquiryFormData, inquirySchema } from "@/lib/validations/inquiry";
import { InquirySource, InquiryStatus, prisma } from "@syntaxure/db";

export type InquiryActionResult =
  | { success: true; id: string }
  | { success: false; errors: Record<string, string[]> };

export async function submitInquiry(data: InquiryFormData): Promise<InquiryActionResult> {
  const parsed = inquirySchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const inquiry = await prisma.inquiry.create({
      data: {
        contactName: parsed.data.contactName,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        message: parsed.data.message,
        source: InquirySource.SITE,
        status: InquiryStatus.NEW,
      },
    });

    return { success: true, id: inquiry.id };
  } catch (error) {
    console.error("Failed to create inquiry:", error);
    return {
      success: false,
      errors: {
        root: ["Something went wrong while sending your inquiry. Please try again."],
      },
    };
  }
}
