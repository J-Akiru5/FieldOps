"use client";

import {
  adjustStockAction,
  createInventoryItemAction,
  deleteInventoryItemAction,
  updateInventoryItemAction,
} from "@/app/actions/inventory";
import type { StockMovementType } from "@syntaxure/db";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@syntaxure/ui";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Boxes,
  Edit3,
  MinusCircle,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface SerializedInventoryItem {
  id: string;
  sku: string;
  name: string;
  unit: string;
  quantityOnHand: number;
  safetyStockThreshold: number;
  unitCost: number;
  createdAt: string;
  updatedAt: string;
}

interface InventoryClientProps {
  initialItems: SerializedInventoryItem[];
}

type DialogMode = "add" | "edit" | "adjust" | "delete" | null;

const EMPTY_FORM = {
  sku: "",
  name: "",
  unit: "",
  unitCost: "",
  quantityOnHand: "",
  safetyStockThreshold: "",
};

function formatCurrency(n: number): string {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function isLowStock(item: SerializedInventoryItem): boolean {
  return item.quantityOnHand <= item.safetyStockThreshold;
}

export function InventoryClient({ initialItems }: InventoryClientProps) {
  const [items, setItems] = useState<SerializedInventoryItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedItem, setSelectedItem] = useState<SerializedInventoryItem | null>(null);

  // Form state
  const [form, setForm] = useState(EMPTY_FORM);
  const [adjustQuantity, setAdjustQuantity] = useState("");
  const [adjustType, setAdjustType] = useState<StockMovementType>("RESTOCK");
  const [pending, setPending] = useState(false);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.unit.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const lowStockCount = useMemo(() => items.filter(isLowStock).length, [items]);

  function openAddDialog() {
    setSelectedItem(null);
    setForm(EMPTY_FORM);
    setDialogMode("add");
  }

  function openEditDialog(item: SerializedInventoryItem) {
    setSelectedItem(item);
    setForm({
      sku: item.sku,
      name: item.name,
      unit: item.unit,
      unitCost: String(item.unitCost),
      quantityOnHand: String(item.quantityOnHand),
      safetyStockThreshold: String(item.safetyStockThreshold),
    });
    setDialogMode("edit");
  }

  function openAdjustDialog(item: SerializedInventoryItem) {
    setSelectedItem(item);
    setAdjustQuantity("");
    setAdjustType("RESTOCK");
    setDialogMode("adjust");
  }

  function openDeleteDialog(item: SerializedInventoryItem) {
    setSelectedItem(item);
    setDialogMode("delete");
  }

  function closeDialog() {
    setDialogMode(null);
    setSelectedItem(null);
    setForm(EMPTY_FORM);
    setAdjustQuantity("");
    setAdjustType("RESTOCK");
  }

  function updateForm(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const result = await createInventoryItemAction({
        sku: form.sku,
        name: form.name,
        unit: form.unit,
        unitCost: Number(form.unitCost) || 0,
        quantityOnHand: Number(form.quantityOnHand) || 0,
        safetyStockThreshold: Number(form.safetyStockThreshold) || 0,
      });

      if (result.success && result.id) {
        toast.success("Inventory item created");
        const newItem: SerializedInventoryItem = {
          id: result.id,
          sku: form.sku,
          name: form.name,
          unit: form.unit,
          quantityOnHand: Number(form.quantityOnHand) || 0,
          safetyStockThreshold: Number(form.safetyStockThreshold) || 0,
          unitCost: Number(form.unitCost) || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setItems((prev) => [...prev, newItem]);
        closeDialog();
      } else {
        toast.error(result.error ?? "Failed to create item");
      }
    } finally {
      setPending(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) return;
    setPending(true);
    try {
      const result = await updateInventoryItemAction(selectedItem.id, {
        sku: form.sku,
        name: form.name,
        unit: form.unit,
        unitCost: Number(form.unitCost) || 0,
        safetyStockThreshold: Number(form.safetyStockThreshold) || 0,
      });

      if (result.success) {
        toast.success("Inventory item updated");
        setItems((prev) =>
          prev.map((item) =>
            item.id === selectedItem.id
              ? {
                  ...item,
                  sku: form.sku,
                  name: form.name,
                  unit: form.unit,
                  unitCost: Number(form.unitCost) || 0,
                  safetyStockThreshold: Number(form.safetyStockThreshold) || 0,
                  updatedAt: new Date().toISOString(),
                }
              : item
          )
        );
        closeDialog();
      } else {
        toast.error(result.error ?? "Failed to update item");
      }
    } finally {
      setPending(false);
    }
  }

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) return;
    setPending(true);
    try {
      const result = await adjustStockAction(selectedItem.id, Number(adjustQuantity), adjustType);

      if (result.success) {
        toast.success("Stock adjusted");
        const qty = Number(adjustQuantity);
        let newQty = selectedItem.quantityOnHand;
        if (adjustType === "RESTOCK") newQty += qty;
        else if (adjustType === "DEDUCTION") newQty -= qty;
        else if (adjustType === "ADJUSTMENT") newQty = qty;

        setItems((prev) =>
          prev.map((item) =>
            item.id === selectedItem.id
              ? { ...item, quantityOnHand: newQty, updatedAt: new Date().toISOString() }
              : item
          )
        );
        closeDialog();
      } else {
        toast.error(result.error ?? "Failed to adjust stock");
      }
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!selectedItem) return;
    setPending(true);
    try {
      const result = await deleteInventoryItemAction(selectedItem.id);
      if (result.success) {
        toast.success("Inventory item deleted");
        setItems((prev) => prev.filter((item) => item.id !== selectedItem.id));
        closeDialog();
      } else {
        toast.error(result.error ?? "Failed to delete item");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage stock, supplies, and equipment
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* ─── Stats & search ─── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs text-muted-foreground">Total Items</p>
          <p className="text-2xl font-bold">{items.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs text-muted-foreground">Low Stock Items</p>
          <p className={`text-2xl font-bold ${lowStockCount > 0 ? "text-destructive" : ""}`}>
            {lowStockCount}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5 sm:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU, or unit…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* ─── Items table ─── */}
      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">SKU</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Unit</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Qty</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Safety</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Cost</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground w-40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <Package className="mx-auto h-8 w-8 mb-2 opacity-30" />
                    {searchQuery ? "No items match your search." : "No inventory items yet."}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium">{item.sku}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.name}
                        {isLowStock(item) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                            <AlertTriangle className="h-3 w-3" />
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.unit}</td>
                    <td className="px-4 py-3 text-right font-medium">{item.quantityOnHand}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {item.safetyStockThreshold}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatCurrency(item.unitCost)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openAdjustDialog(item)}
                          title="Adjust stock"
                        >
                          <Boxes className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditDialog(item)}
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => openDeleteDialog(item)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Add/Edit Dialog ─── */}
      <Dialog open={dialogMode === "add" || dialogMode === "edit"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add Inventory Item" : "Edit Item"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Create a new stock item. Initial quantity will be recorded as a restock movement."
                : "Update item details and safety stock threshold."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={dialogMode === "add" ? handleCreate : handleUpdate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => updateForm("sku", e.target.value)}
                  placeholder="e.g. AC-001"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  value={form.unit}
                  onChange={(e) => updateForm("unit", e.target.value)}
                  placeholder="pc, kg, tank"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder="e.g. R32 Refrigerant Gas"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="unitCost">Unit Cost (₱) *</Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.unitCost}
                  onChange={(e) => updateForm("unitCost", e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="safetyStockThreshold">Safety Stock *</Label>
                <Input
                  id="safetyStockThreshold"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.safetyStockThreshold}
                  onChange={(e) => updateForm("safetyStockThreshold", e.target.value)}
                  placeholder="Minimum acceptable quantity"
                  required
                />
              </div>
            </div>
            {dialogMode === "add" && (
              <div className="space-y-1.5">
                <Label htmlFor="quantityOnHand">Initial Quantity *</Label>
                <Input
                  id="quantityOnHand"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.quantityOnHand}
                  onChange={(e) => updateForm("quantityOnHand", e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : dialogMode === "add" ? "Create Item" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Adjust Stock Dialog ─── */}
      <Dialog open={dialogMode === "adjust"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              {selectedItem ? (
                <>
                  Update quantity for <span className="font-medium">{selectedItem.name}</span>.
                  Current stock: <span className="font-medium">{selectedItem.quantityOnHand}</span>{" "}
                  {selectedItem.unit}.
                </>
              ) : (
                "Update quantity on hand."
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjust} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="adjustType">Movement Type</Label>
              <Select
                value={adjustType}
                onValueChange={(v) => setAdjustType(v as StockMovementType)}
              >
                <SelectTrigger id="adjustType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RESTOCK">
                    <span className="flex items-center gap-2">
                      <ArrowUpCircle className="h-4 w-4 text-green-500" />
                      Restock (+)
                    </span>
                  </SelectItem>
                  <SelectItem value="DEDUCTION">
                    <span className="flex items-center gap-2">
                      <ArrowDownCircle className="h-4 w-4 text-amber-500" />
                      Deduction (-)
                    </span>
                  </SelectItem>
                  <SelectItem value="ADJUSTMENT">
                    <span className="flex items-center gap-2">
                      <MinusCircle className="h-4 w-4 text-blue-500" />
                      Adjustment (=)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {adjustType === "RESTOCK" && "Adds the entered quantity to current stock."}
                {adjustType === "DEDUCTION" && "Subtracts the entered quantity from current stock."}
                {adjustType === "ADJUSTMENT" && "Sets the current stock to the entered quantity."}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adjustQuantity">
                Quantity ({adjustType === "ADJUSTMENT" ? "new total" : "amount"}) *
              </Label>
              <Input
                id="adjustQuantity"
                type="number"
                step="0.01"
                min="0.01"
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Record Movement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Dialog ─── */}
      <Dialog open={dialogMode === "delete"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete Item?</DialogTitle>
            <DialogDescription>
              This will permanently remove <span className="font-medium">{selectedItem?.name}</span>{" "}
              from inventory. Items used on jobs cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={pending}>
              {pending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
