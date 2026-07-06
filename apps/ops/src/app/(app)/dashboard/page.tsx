import { prisma } from "@syntaxure/db";
import { StatusBadge } from "@syntaxure/ui";
import { formatDistanceToNow } from "date-fns";
import { BarChart3, Briefcase, DollarSign, MessageSquare, Package } from "lucide-react";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [inquiryCount, recent, jobCounts, revenue, lowStock] = await Promise.all([
      prisma.inquiry.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
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
      prisma.job.groupBy({ by: ["status"], _count: true }),
      prisma.salesTransaction.aggregate({
        _sum: { grossAmount: true },
        where: { paymentStatus: "PAID" },
      }),
      prisma.inventoryItem.count({ where: { quantityOnHand: { lte: 0 } } }),
    ]);

    const scheduled = jobCounts.find((j) => j.status === "SCHEDULED")?._count ?? 0;
    const completed = jobCounts.find((j) => j.status === "COMPLETED")?._count ?? 0;
    const byStatus = Object.fromEntries(jobCounts.map((j) => [j.status, j._count]));
    const totalRevenue = Number(revenue._sum.grossAmount ?? 0);

    return { inquiryCount, recent, scheduled, completed, totalRevenue, byStatus, lowStock };
  } catch {
    return {
      inquiryCount: 0,
      recent: [],
      scheduled: 0,
      completed: 0,
      totalRevenue: 0,
      byStatus: {} as Record<string, number>,
      lowStock: 0,
    };
  }
}

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-500",
  IN_PROGRESS: "bg-amber-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

export default async function DashboardPage() {
  const { inquiryCount, recent, scheduled, completed, totalRevenue, byStatus, lowStock } =
    await getDashboardData();
  const totalJobs = Object.values(byStatus).reduce((s: number, c: number) => s + c, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your field operations</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Inquiries (7d)</p>
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <p className="text-3xl font-bold">{inquiryCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Jobs Scheduled</p>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">{scheduled}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Jobs Completed</p>
            <Briefcase className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-3xl font-bold">{completed}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Gross Sales</p>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold">₱{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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

        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Jobs by Status
              </h2>
            </div>
            <div className="space-y-3">
              {Object.entries(byStatus).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No jobs yet.</p>
              ) : (
                Object.entries(byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-3">
                    <span className="text-sm w-24 capitalize">
                      {status.replace("_", " ").toLowerCase()}
                    </span>
                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${statusColors[status] ?? "bg-muted-foreground"}`}
                        style={{ width: totalJobs ? `${(count / totalJobs) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Package className="h-4 w-4" />
                Low Stock Alerts
              </h2>
            </div>
            {lowStock > 0 ? (
              <p className="text-destructive font-medium">
                {lowStock} item{lowStock !== 1 ? "s" : ""} out of stock
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">All inventory items are in stock.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
