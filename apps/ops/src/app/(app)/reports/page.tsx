import { prisma } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { redirect } from "next/navigation";
import { ReportsClient } from "./reports-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [jobs, inquiries, revenue, lowStock] = await Promise.all([
    prisma.job.groupBy({ by: ["status"], _count: true }),
    prisma.inquiry.count(),
    prisma.salesTransaction.aggregate({
      _sum: { grossAmount: true, netProfit: true },
      where: { paymentStatus: "PAID" },
    }),
    prisma.inventoryItem.count({ where: { quantityOnHand: { lte: 0 } } }),
  ]);

  return (
    <ReportsClient
      jobsByStatus={jobs.map((j) => ({ status: j.status, count: j._count }))}
      totalInquiries={inquiries}
      totalRevenue={Number(revenue._sum.grossAmount ?? 0)}
      totalProfit={Number(revenue._sum.netProfit ?? 0)}
      lowStockItems={lowStock}
    />
  );
}
