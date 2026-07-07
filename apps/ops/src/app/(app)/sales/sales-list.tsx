"use client";

import { recordPayment } from "@/app/actions/sales";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@syntaxure/ui";
import { ShoppingCart } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

interface SaleRow {
  id: string;
  invoiceNumber: string | null;
  grossAmount: number;
  netProfit: number;
  materialCost: number;
  vatType: string;
  paymentStatus: string;
  createdAt: string;
  job: { id: string; type: string; customer: { name: string } };
}

const statuses = ["UNPAID", "PARTIAL", "PAID"];

export function SalesListClient({ sales }: { sales: SaleRow[] }) {
  const [, startTransition] = useTransition();

  function handlePayment(saleId: string, s: string) {
    startTransition(async () => {
      const result = await recordPayment(saleId, s as "PARTIAL" | "PAID");
      if (result.success) toast.success("Payment recorded");
      else toast.error(result.error ?? "Failed to record payment");
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
        <p className="text-sm text-muted-foreground mt-1">Invoices and payments</p>
      </div>
      {sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No invoices yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Complete a job to generate an invoice.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">
                  Invoice
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr
                  key={s.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    {s.job.customer.name}
                    <span className="text-muted-foreground text-xs block sm:hidden">
                      {s.job.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {s.invoiceNumber ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">₱{s.grossAmount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Select value={s.paymentStatus} onValueChange={(v) => handlePayment(s.id, v)}>
                      <SelectTrigger className="h-7 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((st) => (
                          <SelectItem key={st} value={st}>
                            {st}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
