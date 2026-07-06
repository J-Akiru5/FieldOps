import { prisma } from "@syntaxure/db";
import { StatusBadge } from "@syntaxure/ui";
import { formatDistanceToNow } from "date-fns";
import { BarChart2, Briefcase, DollarSign, Lock, MessageSquare, PieChart } from "lucide-react";

export const dynamic = "force-dynamic";

async function getInquiryStats() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [count, recent] = await Promise.all([
      prisma.inquiry.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.inquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          contactName: true,
          phone: true,
          message: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return { count, recent };
  } catch {
    // DB unreachable (e.g., env var missing, connection error) — degrade gracefully
    return { count: 0, recent: [] };
  }
}

export default async function DashboardPage() {
  const { count, recent } = await getInquiryStats();

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your field operations</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Real stat — Inquiries */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Inquiries — Last 7 Days</p>
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <p className="text-3xl font-bold">{count}</p>
          <p className="text-xs text-muted-foreground mt-1">Live from database</p>
        </div>

        {/* Coming Soon — Jobs Scheduled */}
        <div className="rounded-xl border bg-muted/40 p-5 shadow-sm opacity-70">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Jobs Scheduled</p>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold text-muted-foreground">—</p>
          <p className="text-xs text-muted-foreground mt-1">Coming in a future phase</p>
        </div>

        {/* Coming Soon — Jobs Completed */}
        <div className="rounded-xl border bg-muted/40 p-5 shadow-sm opacity-70">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Jobs Completed</p>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold text-muted-foreground">—</p>
          <p className="text-xs text-muted-foreground mt-1">Coming in a future phase</p>
        </div>

        {/* Coming Soon — Gross Sales */}
        <div className="rounded-xl border bg-muted/40 p-5 shadow-sm opacity-70">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Gross Sales</p>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold text-muted-foreground">—</p>
          <p className="text-xs text-muted-foreground mt-1">Coming in a future phase</p>
        </div>
      </div>

      {/* Main content row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Inquiries — real */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-sm">Recent Inquiries</h2>
          </div>
          {recent.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              No inquiries yet.
            </div>
          ) : (
            <ul className="divide-y">
              {recent.map((inquiry) => (
                <li key={inquiry.id} className="flex items-start gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{inquiry.contactName}</p>
                    <p className="text-xs text-muted-foreground truncate">{inquiry.phone}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {inquiry.message}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={inquiry.status} />
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(inquiry.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right column — coming soon panels */}
        <div className="space-y-6">
          {/* Jobs by Status — coming soon */}
          <div className="rounded-xl border bg-muted/40 p-5 shadow-sm opacity-70">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Jobs by Status</h2>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
              <PieChart className="h-10 w-10" />
              <p className="text-sm">Coming in a future phase</p>
            </div>
          </div>

          {/* Low Stock Alerts — coming soon */}
          <div className="rounded-xl border bg-muted/40 p-5 shadow-sm opacity-70">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Low Stock Alerts</h2>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
              <BarChart2 className="h-10 w-10" />
              <p className="text-sm">Coming in a future phase</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
