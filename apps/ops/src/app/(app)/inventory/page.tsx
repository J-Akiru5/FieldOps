import { getInventoryItems } from "@/lib/data/inventory";
import { createServerClient } from "@syntaxure/db/server";
import { redirect } from "next/navigation";
import { InventoryClient } from "./inventory-client";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const items = await getInventoryItems();

  const serializedItems = items.map((item) => ({
    id: item.id,
    sku: item.sku,
    name: item.name,
    unit: item.unit,
    quantityOnHand: Number(item.quantityOnHand),
    safetyStockThreshold: Number(item.safetyStockThreshold),
    unitCost: Number(item.unitCost),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return <InventoryClient initialItems={serializedItems} />;
}
