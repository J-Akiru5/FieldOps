import { getLedgerEntries } from "@/lib/data/ledger";
import { calculateEquitySummary } from "@/lib/data/partnership-ledger";
import { requirePermission } from "@/lib/require-permission";
import { prisma } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { endOfMonth, startOfMonth } from "date-fns";
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

  const [entries, summary, partners, jobs] = await Promise.all([
    getLedgerEntries({
      from: defaultFrom,
      to: defaultTo,
      includeVoided: false,
    }),
    calculateEquitySummary(defaultFrom, defaultTo),
    prisma.staffMember.findMany({
      where: { role: "PARTNER" },
      select: { id: true, name: true },
    }),
    prisma.job.findMany({
      select: {
        id: true,
        type: true,
        status: true,
        customer: { select: { name: true } },
      },
      orderBy: { scheduledAt: "desc" },
      take: 200,
    }),
  ]);

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
    jobLabel: e.job ? `#${e.job.id.slice(-6)} — ${e.job.type} (${e.job.status})` : null,
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

  const serializedPartners = partners.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  const serializedJobs = jobs.map((j) => ({
    id: j.id,
    label: `#${j.id.slice(-6)} — ${j.type} (${j.customer.name})`,
  }));

  return (
    <LedgerClient
      initialEntries={serializedEntries}
      initialSummary={serializedSummary}
      partners={serializedPartners}
      jobs={serializedJobs}
    />
  );
}
