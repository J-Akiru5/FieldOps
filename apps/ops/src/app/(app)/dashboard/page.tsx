import { prisma } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { Avatar, AvatarFallback, StatusBadge } from "@syntaxure/ui";
import { formatDistanceToNow } from "date-fns";
import {
  BarChart3,
  Briefcase,
  ChevronRight,
  DollarSign,
  MessageSquare,
  Package,
} from "lucide-react";
import { DashboardGreeting } from "./greeting";

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

async function getUserFirstName(): Promise<string> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "there";
    // Try to get name from StaffMember first
    const staff = await prisma.staffMember.findUnique({
      where: { authUserId: user.id },
      select: { name: true },
    });
    const fullName = staff?.name ?? user.email?.split("@")[0] ?? "there";
    return fullName.split(" ")[0]; // first name only
  } catch {
    return "there";
  }
}

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-500",
  IN_PROGRESS: "bg-amber-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

/* Consistent color palette per avatar initial seed */
const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function DashboardPage() {
  const [
    { inquiryCount, recent, scheduled, completed, totalRevenue, byStatus, lowStock },
    firstName,
  ] = await Promise.all([getDashboardData(), getUserFirstName()]);

  const totalJobs = Object.values(byStatus).reduce((s: number, c: number) => s + c, 0);

  const statCards = [
    {
      label: "Inquiries (7d)",
      value: String(inquiryCount),
      icon: MessageSquare,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      accent: "border-l-blue-400",
    },
    {
      label: "Jobs Scheduled",
      value: String(scheduled),
      icon: Briefcase,
      iconBg: "bg-sky-50",
      iconColor: "text-sky-500",
      accent: "border-l-sky-400",
    },
    {
      label: "Jobs Completed",
      value: String(completed),
      icon: Briefcase,
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
      accent: "border-l-green-400",
    },
    {
      label: "Gross Sales",
      value: `₱${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      accent: "border-l-amber-400",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Greeting — time-aware, uses a tiny client wrapper for the time logic */}
      <div>
        <DashboardGreeting firstName={firstName} />
        <p className="text-xs text-muted-foreground mt-0.5">Overview of your field operations</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, iconBg, iconColor, accent }) => (
          <div
            key={label}
            className={`rounded-xl border bg-card p-4 shadow-sm border-l-4 ${accent}`}
          >
            <div className="flex items-start justify-between mb-2.5">
              <p className="text-xs font-medium text-muted-foreground leading-snug">{label}</p>
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
              >
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Inquiries */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold text-sm">Recent Inquiries</h2>
          <a href="/inquiries" className="text-xs text-primary font-medium hover:underline">
            View all
          </a>
        </div>
        {recent.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            No inquiries yet.
          </div>
        ) : (
          <ul>
            {recent.map((inquiry) => {
              const initials = getInitials(inquiry.contactName);
              const colorClass = getAvatarColor(inquiry.contactName);
              return (
                <li
                  key={inquiry.id}
                  className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-muted/40 transition-colors"
                >
                  {/* Avatar */}
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className={`text-xs font-semibold ${colorClass}`}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{inquiry.contactName}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {inquiry.message}
                    </p>
                  </div>

                  {/* Right side */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={inquiry.status} />
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {formatDistanceToNow(inquiry.createdAt, { addSuffix: true })}
                    </span>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 -mr-1" />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Jobs by Status */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Jobs by Status</h2>
        </div>
        <div className="space-y-2.5">
          {Object.entries(byStatus).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No jobs yet.</p>
          ) : (
            Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="text-xs w-24 capitalize text-muted-foreground">
                  {status.replace("_", " ").toLowerCase()}
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${statusColors[status] ?? "bg-muted-foreground"}`}
                    style={{ width: totalJobs ? `${(count / totalJobs) * 100}%` : "0%" }}
                  />
                </div>
                <span className="text-xs font-semibold tabular-nums w-6 text-right">{count}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Low Stock */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Low Stock Alerts</h2>
        </div>
        {lowStock > 0 ? (
          <p className="text-sm font-semibold text-destructive">
            {lowStock} item{lowStock !== 1 ? "s" : ""} out of stock
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">All inventory items are in stock. ✓</p>
        )}
      </div>
    </div>
  );
}
