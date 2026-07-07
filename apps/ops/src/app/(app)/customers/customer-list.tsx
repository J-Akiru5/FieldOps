"use client";

import { Button } from "@syntaxure/ui";
import { Phone, Plus, User } from "lucide-react";
import Link from "next/link";

interface Customer {
  id: string;
  displayName: string;
  contactPhone: string;
  contactEmail: string | null;
  address: string | null;
  createdAt: string;
}

export function CustomerListClient({ customers }: { customers: Customer[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">Directory of all clients</p>
        </div>
        <Link href="/customers/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add customer
          </Button>
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No customers yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add your first customer to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">
                  <Phone className="h-3.5 w-3.5 inline mr-1" />
                  Phone
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Details</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{customer.displayName}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {customer.contactPhone}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {customer.contactEmail || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      More
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
