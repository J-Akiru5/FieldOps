import { Package } from "lucide-react";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage stock, supplies, and equipment</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No inventory items yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Contact your admin to add stock items and supplies.
        </p>
      </div>
    </div>
  );
}
