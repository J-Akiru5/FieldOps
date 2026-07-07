import { prisma } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { redirect } from "next/navigation";
import { SalesListClient } from "./sales-list";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sales = await prisma.salesTransaction.findMany({
    include: { job: { include: { customer: { select: { displayName: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <SalesListClient
      sales={sales.map((s) => ({
        id: s.id,
        invoiceNumber: s.invoiceNumber,
        grossAmount: Number(s.grossAmount),
        netProfit: Number(s.netProfit),
        materialCost: Number(s.materialCost),
        vatType: s.vatType,
        paymentStatus: s.paymentStatus,
        createdAt: s.createdAt.toISOString(),
        job: {
          id: s.jobId,
          type: s.job.type,
          customer: { displayName: s.job.customer.displayName },
        },
      }))}
    />
  );
}
