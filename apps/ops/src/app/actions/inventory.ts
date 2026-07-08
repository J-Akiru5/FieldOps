"use server";

import { writeAuditLog } from "@/lib/data/audit-log";
import { requirePermission } from "@/lib/require-permission";
import { type StockMovementType, prisma } from "@syntaxure/db";
import { revalidatePath } from "next/cache";

export interface InventoryItemFormData {
  sku: string;
  name: string;
  unit: string;
  unitCost: number;
  quantityOnHand: number;
  safetyStockThreshold: number;
}

export interface InventoryItemUpdateData {
  sku: string;
  name: string;
  unit: string;
  unitCost: number;
  safetyStockThreshold: number;
}

function toDecimalString(value: number): string {
  return Number(value).toFixed(4);
}

export async function createInventoryItemAction(data: InventoryItemFormData): Promise<{
  success: boolean;
  error?: string;
  id?: string;
}> {
  try {
    const { userId, email, actorName } = await requirePermission("inventory.write");

    if (!data.sku.trim() || !data.name.trim() || !data.unit.trim()) {
      return { success: false, error: "SKU, name, and unit are required." };
    }
    if (
      Number(data.unitCost) < 0 ||
      Number(data.quantityOnHand) < 0 ||
      Number(data.safetyStockThreshold) < 0
    ) {
      return { success: false, error: "Numeric values must be zero or positive." };
    }

    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.create({
        data: {
          sku: data.sku.trim(),
          name: data.name.trim(),
          unit: data.unit.trim(),
          unitCost: toDecimalString(data.unitCost),
          quantityOnHand: toDecimalString(data.quantityOnHand),
          safetyStockThreshold: toDecimalString(data.safetyStockThreshold),
        },
      });

      if (Number(data.quantityOnHand) > 0) {
        await tx.stockMovement.create({
          data: {
            inventoryItemId: item.id,
            type: "RESTOCK",
            quantity: toDecimalString(data.quantityOnHand),
            resultingQuantity: toDecimalString(data.quantityOnHand),
          },
        });
      }

      return item;
    });

    revalidatePath("/inventory");
    revalidatePath("/reports");

    void writeAuditLog({
      actorId: userId,
      actorEmail: email ?? "",
      actorName,
      action: "CREATE",
      entity: "INVENTORY_ITEM",
      entityId: result.id,
      entityLabel: `${data.sku.trim()} — ${data.name.trim()}`,
    });

    return { success: true, id: result.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create inventory item",
    };
  }
}

export async function updateInventoryItemAction(
  id: string,
  data: InventoryItemUpdateData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId, email, actorName } = await requirePermission("inventory.write");

    if (!data.sku.trim() || !data.name.trim() || !data.unit.trim()) {
      return { success: false, error: "SKU, name, and unit are required." };
    }
    if (Number(data.unitCost) < 0 || Number(data.safetyStockThreshold) < 0) {
      return { success: false, error: "Numeric values must be zero or positive." };
    }

    const existing = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Inventory item not found." };
    }

    await prisma.inventoryItem.update({
      where: { id },
      data: {
        sku: data.sku.trim(),
        name: data.name.trim(),
        unit: data.unit.trim(),
        unitCost: toDecimalString(data.unitCost),
        safetyStockThreshold: toDecimalString(data.safetyStockThreshold),
      },
    });

    revalidatePath("/inventory");
    revalidatePath("/reports");

    void writeAuditLog({
      actorId: userId,
      actorEmail: email ?? "",
      actorName,
      action: "UPDATE",
      entity: "INVENTORY_ITEM",
      entityId: id,
      entityLabel: data.name.trim(),
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update inventory item",
    };
  }
}

export async function adjustStockAction(
  id: string,
  quantity: number,
  type: StockMovementType
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId, email, actorName } = await requirePermission("inventory.write");

    if (!id) return { success: false, error: "Item ID is required." };
    if (Number(quantity) <= 0)
      return { success: false, error: "Quantity must be greater than zero." };
    if (!["RESTOCK", "DEDUCTION", "ADJUSTMENT"].includes(type)) {
      return { success: false, error: "Invalid stock movement type." };
    }

    const item = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) return { success: false, error: "Inventory item not found." };

    const currentQty = Number(item.quantityOnHand);
    let newQty = currentQty;

    if (type === "RESTOCK") {
      newQty = currentQty + Number(quantity);
    } else if (type === "DEDUCTION") {
      newQty = currentQty - Number(quantity);
      if (newQty < 0) {
        return { success: false, error: "Insufficient stock for this deduction." };
      }
    } else if (type === "ADJUSTMENT") {
      newQty = Number(quantity);
    }

    await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id },
        data: { quantityOnHand: toDecimalString(newQty) },
      }),
      prisma.stockMovement.create({
        data: {
          inventoryItemId: id,
          type,
          quantity:
            type === "DEDUCTION"
              ? toDecimalString(-Number(quantity))
              : type === "RESTOCK"
                ? toDecimalString(Number(quantity))
                : toDecimalString(Number(quantity)),
          resultingQuantity: toDecimalString(newQty),
        },
      }),
    ]);

    revalidatePath("/inventory");
    revalidatePath("/reports");

    void writeAuditLog({
      actorId: userId,
      actorEmail: email ?? "",
      actorName,
      action: "UPDATE",
      entity: "STOCK_MOVEMENT",
      entityId: id,
      entityLabel: `${type} ×${quantity} on item ${id}`,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to adjust stock",
    };
  }
}

export async function deleteInventoryItemAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId, email, actorName } = await requirePermission("inventory.write");

    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: { lineItems: { take: 1 } },
    });
    if (!item) {
      return { success: false, error: "Inventory item not found." };
    }
    if (item.lineItems.length > 0) {
      return {
        success: false,
        error: "Cannot delete item that has been used on jobs.",
      };
    }

    await prisma.$transaction([
      prisma.stockMovement.deleteMany({ where: { inventoryItemId: id } }),
      prisma.inventoryItem.delete({ where: { id } }),
    ]);

    revalidatePath("/inventory");
    revalidatePath("/reports");

    void writeAuditLog({
      actorId: userId,
      actorEmail: email ?? "",
      actorName,
      action: "DELETE",
      entity: "INVENTORY_ITEM",
      entityId: id,
      entityLabel: item.name,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete inventory item",
    };
  }
}
