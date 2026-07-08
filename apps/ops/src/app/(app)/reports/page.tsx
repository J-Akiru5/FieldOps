import { getReportMetrics } from "@/lib/data/reports";
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

  const metrics = await getReportMetrics();

  return (
    <ReportsClient
      jobsByStatus={metrics.jobsByStatus}
      totalInquiries={metrics.totalInquiries}
      totalRevenue={metrics.totalRevenue}
      totalProfit={metrics.totalProfit}
      lowStockItems={metrics.lowStockItems}
    />
  );
}
