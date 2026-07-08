import {
  getCustomerReport,
  getInventoryReport,
  getJobReport,
  getRevenueReport,
} from "@/lib/data/reports";
import { createServerClient } from "@syntaxure/db/server";
import { endOfMonth, startOfMonth } from "date-fns";
import { redirect } from "next/navigation";
import { ReportsClient } from "./reports-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; tab?: string }>;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const now = new Date();
  const defaultFrom = startOfMonth(now);
  const defaultTo = endOfMonth(now);

  const from = params.from ? new Date(params.from) : defaultFrom;
  const to = params.to ? new Date(params.to) : defaultTo;
  const period = { from, to };

  const [jobReport, revenueReport, inventoryItems, customerReport] = await Promise.all([
    getJobReport(period),
    getRevenueReport(period),
    getInventoryReport(),
    getCustomerReport(period),
  ]);

  return (
    <ReportsClient
      jobReport={jobReport}
      revenueReport={revenueReport}
      inventoryItems={inventoryItems}
      customerReport={customerReport}
      period={{
        from: from.toISOString(),
        to: to.toISOString(),
      }}
      activeTab={params.tab ?? "jobs"}
    />
  );
}
