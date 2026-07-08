"use server";

import { writeAuditLog } from "@/lib/data/audit-log";
import { requirePermission } from "@/lib/require-permission";
import { type CustomerType, prisma } from "@syntaxure/db";
import { revalidatePath } from "next/cache";

export interface CustomerFormData {
  type?: CustomerType;
  displayName: string;
  contactPersonName?: string;
  contactPhone: string;
  contactEmail?: string;
  address?: string;
}

export interface CustomerQuickInput {
  type: CustomerType;
  displayName: string;
  contactPersonName?: string;
  contactPhone: string;
}

export async function createCustomer(
  data: CustomerFormData
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const { userId, email, actorName } = await requirePermission("customers.write");
    const result = await prisma.customer.create({
      data: {
        type: data.type ?? "INDIVIDUAL",
        displayName: data.displayName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        address: data.address,
      },
      select: { id: true },
    });
    revalidatePath("/customers");

    void writeAuditLog({
      actorId: userId,
      actorEmail: email ?? "",
      actorName,
      action: "CREATE",
      entity: "CUSTOMER",
      entityId: result.id,
      entityLabel: data.displayName,
    });

    return { success: true, id: result.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create customer",
    };
  }
}

export async function createCustomerQuick(data: CustomerQuickInput): Promise<{
  success: boolean;
  error?: string;
  customer?: { id: string; displayName: string; contactPhone: string };
  duplicateOf?: { id: string; displayName: string; contactPhone: string };
}> {
  try {
    const { userId, email, actorName } = await requirePermission("customers.write");

    const existing = await prisma.customer.findFirst({
      where: { contactPhone: data.contactPhone },
      select: { id: true, displayName: true, contactPhone: true },
    });

    if (existing) {
      return {
        success: true,
        customer: existing,
        duplicateOf: existing,
      };
    }

    const result = await prisma.customer.create({
      data: {
        type: data.type,
        displayName: data.displayName,
        contactPersonName: data.contactPersonName,
        contactPhone: data.contactPhone,
      },
      select: { id: true, displayName: true, contactPhone: true },
    });

    revalidatePath("/customers");
    revalidatePath("/schedule");

    void writeAuditLog({
      actorId: userId,
      actorEmail: email ?? "",
      actorName,
      action: "CREATE",
      entity: "CUSTOMER",
      entityId: result.id,
      entityLabel: data.displayName,
    });

    return { success: true, customer: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create customer",
    };
  }
}

export async function updateCustomer(
  id: string,
  data: CustomerFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId, email, actorName } = await requirePermission("customers.write");
    await prisma.customer.update({
      where: { id },
      data: {
        type: data.type,
        displayName: data.displayName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        address: data.address,
      },
    });
    revalidatePath("/customers");

    void writeAuditLog({
      actorId: userId,
      actorEmail: email ?? "",
      actorName,
      action: "UPDATE",
      entity: "CUSTOMER",
      entityId: id,
      entityLabel: data.displayName,
      after: data as unknown as Record<string, unknown>,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update customer",
    };
  }
}

export async function deleteCustomer(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId, email, actorName } = await requirePermission("customers.write");
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: { displayName: true },
    });
    await prisma.customer.delete({ where: { id } });
    revalidatePath("/customers");

    void writeAuditLog({
      actorId: userId,
      actorEmail: email ?? "",
      actorName,
      action: "DELETE",
      entity: "CUSTOMER",
      entityId: id,
      entityLabel: customer?.displayName ?? id,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete customer",
    };
  }
}
