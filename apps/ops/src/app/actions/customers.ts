"use server";

import { requirePermission } from "@/lib/require-permission";
import { prisma } from "@syntaxure/db";
import { revalidatePath } from "next/cache";

export interface CustomerFormData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export async function createCustomer(
  data: CustomerFormData
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    await requirePermission("customers.write");
    const result = await prisma.customer.create({
      data: { name: data.name, phone: data.phone, email: data.email, address: data.address },
      select: { id: true },
    });
    revalidatePath("/customers");
    return { success: true, id: result.id };
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
    await requirePermission("customers.write");
    await prisma.customer.update({
      where: { id },
      data: { name: data.name, phone: data.phone, email: data.email, address: data.address },
    });
    revalidatePath("/customers");
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
    await requirePermission("customers.write");
    await prisma.customer.delete({ where: { id } });
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete customer",
    };
  }
}
