"use client";

import { deleteCustomer } from "@/app/actions/customers";
import { Button } from "@syntaxure/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@syntaxure/ui";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteCustomerButtonProps {
  customerId: string;
  customerName: string;
}

export function DeleteCustomerButton({ customerId, customerName }: DeleteCustomerButtonProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteCustomer(customerId);
    if (result.success) {
      toast.success("Customer deleted");
      window.location.href = "/customers";
    } else {
      toast.error(result.error ?? "Failed to delete customer");
      setDeleting(false);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="destructive" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" /> Delete
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete customer?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{customerName}</strong>? This will also remove
            all their appliances and service history. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Yes, delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
