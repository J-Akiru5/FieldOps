import { getLedgerEntries, getRecentActivity } from "@/lib/data/ledger";
import { calculateEquitySummary } from "@/lib/data/partnership-ledger";
import { requirePermission } from "@/lib/require-permission";
import { prisma } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { redirect } from "next/navigation";
import { LedgerClient } from "./ledger-client";

export const dynamic = "force-dynamic";

export default async function LedgerPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await requirePermission("ledger.read");

  const now = new Date();
  const defaultFrom = startOfMonth(now);
  const defaultTo = endOfMonth(now);
  const prevFrom = startOfMonth(subMonths(now, 1));
  const prevTo = endOfMonth(subMonths(now, 1));

  const [entriesRes, summaryRes, prevSummaryRes, partnersRes, jobsRes, recentRes] =
    await Promise.allSettled([
      getLedgerEntries({ from: defaultFrom, to: defaultTo, includeVoided: false }),
      calculateEquitySummary(defaultFrom, defaultTo),
      calculateEquitySummary(prevFrom, prevTo),
      prisma.staffMember.findMany({
        where: { role: "PARTNER" },
        select: { id: true, name: true },
      }),
      prisma.job.findMany({
        select: {
          id: true,
          type: true,
          status: true,
          customer: { select: { displayName: true } },
        },
        orderBy: { scheduledAt: "desc" },
        take: 200,
      }),
      getRecentActivity(10),
    ]);

  const entries = entriesRes.status === "fulfilled" ? entriesRes.value : [];
  const summary =
    summaryRes.status === "fulfilled"
      ? summaryRes.value
      : {
          dateRange: { from: defaultFrom, to: defaultTo },
          totalIncome: 0,
          totalOperatingExpense: 0,
          netOperatingProfit: 0,
          profitSharePerPartner: 0,
          partnerBalances: [],
        };
  const previousSummary =
    prevSummaryRes.status === "fulfilled"
      ? {
          totalIncome: prevSummaryRes.value.totalIncome,
          totalOperatingExpense: prevSummaryRes.value.totalOperatingExpense,
          netOperatingProfit: prevSummaryRes.value.netOperatingProfit,
          profitSharePerPartner: prevSummaryRes.value.profitSharePerPartner,
        }
      : {
          totalIncome: 0,
          totalOperatingExpense: 0,
          netOperatingProfit: 0,
          profitSharePerPartner: 0,
        };
  const partners = partnersRes.status === "fulfilled" ? partnersRes.value : [];
  const jobs = jobsRes.status === "fulfilled" ? jobsRes.value : [];
  const recentActivity = recentRes.status === "fulfilled" ? recentRes.value : [];

  const serializedEntries = entries.map((e) => ({
    id: e.id,
    date: e.date.toISOString(),
    particulars: e.particulars,
    category: e.category,
    amount: Number(e.amount),
    remarks: e.remarks,
    isVoided: e.isVoided,
    voidedAt: e.voidedAt?.toISOString() ?? null,
    voidedBy: e.voidedBy,
    voidedReason: e.voidedReason,
    partnerId: e.partnerId,
    partnerName: e.partner?.name ?? null,
    jobId: e.jobId,
    jobLabel: e.job
      ? `#${e.job.id.slice(-6)} — ${e.job.type} (${e.job.customer.displayName})`
      : null,
    createdAt: e.createdAt.toISOString(),
  }));

  const serializedSummary = {
    dateRange: {
      from: summary.dateRange.from.toISOString(),
      to: summary.dateRange.to.toISOString(),
    },
    totalIncome: summary.totalIncome,
    totalOperatingExpense: summary.totalOperatingExpense,
    netOperatingProfit: summary.netOperatingProfit,
    profitSharePerPartner: summary.profitSharePerPartner,
    partnerBalances: summary.partnerBalances,
  };

  const serializedPartners = partners.map((p) => ({ id: p.id, name: p.name }));

  const serializedJobs = jobs.map((j) => ({
    id: j.id,
    label: `#${j.id.slice(-6)} — ${j.type} (${j.customer.displayName})`,
  }));

  const serializedRecent = recentActivity.map((a) => ({
    id: a.id,
    particulars: a.particulars,
    category: a.category,
    amount: Number(a.amount),
    createdAt: a.createdAt.toISOString(),
    partnerName: a.partner?.name ?? null,
    jobLabel: a.job
      ? `#${a.job.id.slice(-6)} — ${a.job.type} (${a.job.customer.displayName})`
      : null,
  }));

  return (
    <LedgerClient
      initialEntries={serializedEntries}
      initialSummary={serializedSummary}
      previousSummary={previousSummary}
      partners={serializedPartners}
      jobs={serializedJobs}
      recentActivity={serializedRecent}
    />
  );
}
