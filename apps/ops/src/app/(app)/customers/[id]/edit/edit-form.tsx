"use client";

import { updateCustomer } from "@/app/actions/customers";
import { Button, Input, Label, Textarea } from "@syntaxure/ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface EditCustomerFormProps {
  id: string;
  initialName: string;
  initialPhone: string;
  initialEmail: string;
  initialAddress: string;
}

export function EditCustomerForm({
  id,
  initialName,
  initialPhone,
  initialEmail,
  initialAddress,
}: EditCustomerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState(initialEmail);
  const [address, setAddress] = useState(initialAddress);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("Name and phone are required");
      return;
    }
    startTransition(async () => {
      const result = await updateCustomer(id, {
        name,
        phone,
        email: email || undefined,
        address: address || undefined,
      });
      if (result.success) {
        toast.success("Customer updated successfully");
        router.push(`/customers/${id}`);
      } else {
        toast.error(result.error ?? "Failed to update customer");
      }
    });
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/customers/${id}`} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Customer</h1>
          <p className="text-sm text-muted-foreground">Update contact details</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6">
        <div>
          <Label htmlFor="name">Full name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1.5"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1.5"
            rows={3}
          />
        </div>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
