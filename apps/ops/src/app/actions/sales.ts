"use server";

import { requirePermission } from "@/lib/require-permission";
import { prisma } from "@syntaxure/db";
import { revalidatePath } from "next/cache";

export async function recordPayment(
  saleId: string,
  status: "PARTIAL" | "PAID"
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission("sales.write");
    await prisma.salesTransaction.update({
      where: { id: saleId },
      data: { paymentStatus: status },
    });
    revalidatePath("/sales");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record payment",
    };
  }
}
