import { prisma } from "@syntaxure/db";

export async function getInventoryItems() {
  return prisma.inventoryItem.findMany({
    orderBy: { name: "asc" },
    take: 100,
  });
}

export async function getInventoryItemById(id: string) {
  return prisma.inventoryItem.findUnique({
    where: { id },
    include: {
      movements: { orderBy: { createdAt: "desc" }, take: 20 },
      lineItems: {
        include: {
          job: { select: { id: true, type: true, customer: { select: { displayName: true } } } },
        },
        take: 20,
      },
    },
  });
}

export async function getLowStockItems() {
  const items = await prisma.inventoryItem.findMany({
    orderBy: { quantityOnHand: "asc" },
  });
  return items.filter((item) => Number(item.quantityOnHand) <= Number(item.safetyStockThreshold));
}
