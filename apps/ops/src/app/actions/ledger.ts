"use server";

import { createLedgerEntry, updateLedgerEntry, voidLedgerEntry } from "@/lib/data/ledger";
import { requirePermission } from "@/lib/require-permission";
import { LedgerCategory } from "@syntaxure/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ledgerCategoryEnum = z.enum([
  LedgerCategory.INCOME,
  LedgerCategory.OPERATING_EXPENSE,
  LedgerCategory.PARTNER_DRAW,
]);

const createSchema = z
  .object({
    date: z.coerce.date(),
    particulars: z.string().min(1, "Particulars is required."),
    category: ledgerCategoryEnum,
    amount: z.coerce.number().positive("Amount must be greater than zero."),
    remarks: z.string().optional(),
    partnerId: z.string().optional(),
    jobId: z.string().optional(),
  })
  .refine((data) => data.category !== LedgerCategory.PARTNER_DRAW || !!data.partnerId, {
    message: "partnerId is required when category is PARTNER_DRAW.",
    path: ["partnerId"],
  })
  .refine((data) => !(data.jobId && data.category === LedgerCategory.INCOME), {
    message:
      "Cannot set jobId with category INCOME. Job revenue is tracked automatically via SalesTransaction. Use this ledger for job-related costs only (OPERATING_EXPENSE).",
    path: ["jobId"],
  });

const updateSchema = z
  .object({
    date: z.coerce.date().optional(),
    particulars: z.string().min(1, "Particulars is required.").optional(),
    category: ledgerCategoryEnum.optional(),
    amount: z.coerce.number().positive("Amount must be greater than zero.").optional(),
    remarks: z.string().optional().nullable(),
    partnerId: z.string().optional().nullable(),
    jobId: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.category === LedgerCategory.PARTNER_DRAW && data.partnerId === undefined) {
        return false;
      }
      return data.category !== LedgerCategory.PARTNER_DRAW || !!data.partnerId;
    },
    { message: "partnerId is required when category is PARTNER_DRAW.", path: ["partnerId"] }
  )
  .refine(
    (data) => {
      if (data.jobId && data.category === LedgerCategory.INCOME) {
        return false;
      }
      return !(data.jobId !== undefined && data.category === LedgerCategory.INCOME);
    },
    {
      message:
        "Cannot set jobId with category INCOME. Job revenue is tracked automatically via SalesTransaction.",
      path: ["jobId"],
    }
  );

function validationError(error: z.ZodError): string {
  return error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
}

export async function createLedgerEntryAction(
  data: z.infer<typeof createSchema>
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    await requirePermission("ledger.write");

    const parsed = createSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: validationError(parsed.error) };
    }

    const entry = await createLedgerEntry(parsed.data);
    revalidatePath("/ledger");
    return { success: true, id: entry.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create ledger entry.",
    };
  }
}

export async function updateLedgerEntryAction(
  id: string,
  data: z.infer<typeof updateSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission("ledger.write");

    const parsed = updateSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: validationError(parsed.error) };
    }

    await updateLedgerEntry(id, parsed.data);
    revalidatePath("/ledger");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update ledger entry.",
    };
  }
}

export async function voidLedgerEntryAction(
  id: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await requirePermission("ledger.write");

    const trimmed = reason.trim();
    if (!trimmed) {
      return { success: false, error: "A reason is required when voiding an entry." };
    }

    await voidLedgerEntry(id, userId, trimmed);
    revalidatePath("/ledger");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to void ledger entry.",
    };
  }
}
