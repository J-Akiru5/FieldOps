"use client";

import { createCustomer } from "@/app/actions/customers";
import { Button, Input, Label, Textarea } from "@syntaxure/ui";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function NewCustomerPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("Name and phone are required");
      return;
    }
    startTransition(async () => {
      const result = await createCustomer({
        name,
        phone,
        email: email || undefined,
        address: address || undefined,
      });
      if (result.success) {
        toast.success("Customer saved successfully");
        router.push("/customers");
      } else {
        toast.error(result.error ?? "Failed to save customer");
      }
    });
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Customer</h1>
        <p className="text-sm text-muted-foreground mt-1">Add a new client to the directory</p>
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
          {isPending ? "Saving..." : "Save customer"}
        </Button>
      </form>
    </div>
  );
}
