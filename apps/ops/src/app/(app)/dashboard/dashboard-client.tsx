"use client";

import { StatusBadge } from "@syntaxure/ui";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  BarChart3,
  Briefcase,
  CalendarCheck,
  CalendarClock,
  ChevronRight,
  DollarSign,
  LayoutList,
  MessageSquare,
  Package,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";

interface InquiryItem {
  id: string;
  contactName: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
}

interface LowStockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
}

interface DashboardStats {
  inquiryCount: number;
  scheduled: number;
  completed: number;
  lowStockCount: number;
  grossSales: number;
  netProfit: number;
  yourShare: number | null;
  myJobsToday: number;
}

interface Props {
  firstName: string;
  role: string;
  stats: DashboardStats;
  recentInquiries: InquiryItem[];
  jobStatusCounts: Record<string, number>;
  lowStockItems: LowStockItem[];
}

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-500",
  IN_PROGRESS: "bg-amber-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function fmtAmount(n: number): string {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

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

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  href,
  accent,
  iconBg,
  iconColor,
  size = "default",
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ElementType;
  href?: string;
  accent: string;
  iconBg: string;
  iconColor: string;
  size?: "default" | "large";
}) {
  const content = (
    <div
      className={`group rounded-xl border bg-card p-4 shadow-sm border-l-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${accent}`}
    >
      <div className="flex items-start justify-between mb-2.5">
        <p
          className={`font-medium text-muted-foreground leading-snug ${size === "large" ? "text-sm" : "text-xs"}`}
        >
          {label}
        </p>
        <div
          className={`flex shrink-0 items-center justify-center rounded-lg ${iconBg} ${size === "large" ? "h-9 w-9" : "h-8 w-8"}`}
        >
          <Icon className={`${iconColor} ${size === "large" ? "h-5 w-5" : "h-4 w-4"}`} />
        </div>
      </div>
      <p
        className={`font-bold tabular-nums tracking-tight ${size === "large" ? "text-3xl" : "text-2xl"}`}
      >
        {value}
      </p>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
      {href && (
        <div className="mt-2 flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          View <ChevronRight className="h-3 w-3" />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-sm font-semibold text-foreground">{children}</h2>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export function DashboardClient({
  firstName,
  role,
  stats,
  recentInquiries,
  jobStatusCounts,
  lowStockItems,
}: Props) {
  const upperRole = role.toUpperCase();
  const isOwnerPartner = upperRole === "OWNER" || upperRole === "PARTNER";
  const isBookkeeper = upperRole === "BOOKKEEPER";
  const isTechnician = upperRole === "TECHNICIAN";

  const totalJobs = Object.values(jobStatusCounts).reduce((s, c) => s + c, 0);

  // ── Technician view ─────────────────────────────────────────
  if (isTechnician) {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Good day, {firstName}!</p>
          <h1 className="text-2xl font-bold tracking-tight mt-0.5">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your field work at a glance</p>
        </div>

        <SectionLabel>My Day</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="My Jobs Today"
            value={String(stats.myJobsToday)}
            icon={CalendarClock}
            href="/schedule"
            accent="border-l-blue-400"
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
          />
          <StatCard
            label="Schedule"
            value="Open"
            icon={CalendarCheck}
            href="/schedule"
            accent="border-l-emerald-400"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-500"
          />
        </div>

        {recentInquiries.length > 0 && (
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="font-semibold text-sm">Recent Inquiries</h2>
              <Link href="/inquiries" className="text-xs text-primary font-medium hover:underline">
                View all
              </Link>
            </div>
            <InquiryList inquiries={recentInquiries} />
          </div>
        )}
      </div>
    );
  }

  // ── Today tier cards ────────────────────────────────────────
  const todayCards = [
    {
      label: "Inquiries (7d)",
      value: String(stats.inquiryCount),
      icon: MessageSquare,
      href: "/inquiries",
      accent: "border-l-blue-400",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "Jobs Scheduled",
      value: String(stats.scheduled),
      icon: CalendarClock,
      href: "/schedule",
      accent: "border-l-sky-400",
      iconBg: "bg-sky-50",
      iconColor: "text-sky-500",
    },
    {
      label: "Jobs Completed",
      value: String(stats.completed),
      icon: Briefcase,
      href: "/jobs",
      accent: "border-l-green-400",
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      label: "Low Stock Alerts",
      value: String(stats.lowStockCount),
      subtext:
        stats.lowStockCount === 0
          ? "All items in stock ✓"
          : `${stats.lowStockCount} item${stats.lowStockCount !== 1 ? "s" : ""} need restock`,
      icon: AlertTriangle,
      href: stats.lowStockCount > 0 ? "/inventory" : undefined,
      accent: stats.lowStockCount > 0 ? "border-l-amber-400" : "border-l-emerald-400",
      iconBg: stats.lowStockCount > 0 ? "bg-amber-50" : "bg-emerald-50",
      iconColor: stats.lowStockCount > 0 ? "text-amber-500" : "text-emerald-500",
    },
  ];

  // ── Business Health tier cards ──────────────────────────────
  const healthCards = [
    {
      label: "Gross Sales",
      value: fmtAmount(stats.grossSales),
      icon: DollarSign,
      href: "/sales",
      accent: "border-l-violet-400",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-500",
      size: "large" as const,
    },
    {
      label: "Net Profit",
      value: fmtAmount(stats.netProfit),
      icon: TrendingUp,
      href: "/ledger",
      accent: "border-l-emerald-400",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      size: "large" as const,
    },
  ];

  if (isOwnerPartner && stats.yourShare !== null) {
    healthCards.push({
      label: "Your Share (50/50)",
      value: fmtAmount(stats.yourShare),
      icon: Wallet,
      href: "/ledger",
      accent: "border-l-blue-400",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      size: "large" as const,
    });
  }

  // ── Bookkeeper: Business Health first ───────────────────────
  if (isBookkeeper) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Good day, {firstName}!</p>
          <h1 className="text-2xl font-bold tracking-tight mt-0.5">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Financial overview</p>
        </div>

        <SectionLabel>Business Health</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {healthCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <SectionLabel>Today</SectionLabel>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {todayCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <DashboardPanels
          recentInquiries={recentInquiries}
          jobStatusCounts={jobStatusCounts}
          lowStockItems={lowStockItems}
          totalJobs={totalJobs}
        />
      </div>
    );
  }

  // ── Owner / Partner view (default) ──────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground font-medium">Good day, {firstName}!</p>
        <h1 className="text-2xl font-bold tracking-tight mt-0.5">Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Overview of your field operations</p>
      </div>

      <SectionLabel>Today</SectionLabel>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {todayCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <SectionLabel>Business Health</SectionLabel>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {healthCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <DashboardPanels
        recentInquiries={recentInquiries}
        jobStatusCounts={jobStatusCounts}
        lowStockItems={lowStockItems}
        totalJobs={totalJobs}
      />
    </div>
  );
}

function InquiryList({ inquiries }: { inquiries: InquiryItem[] }) {
  if (inquiries.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-muted-foreground">No inquiries yet.</div>
    );
  }

  return (
    <ul>
      {inquiries.map((inquiry) => {
        const initials = getInitials(inquiry.contactName);
        const colorClass = getAvatarColor(inquiry.contactName);
        return (
          <li
            key={inquiry.id}
            className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-muted/40 transition-colors"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${colorClass}`}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{inquiry.contactName}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{inquiry.message}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <StatusBadge status={inquiry.status} />
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true })}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 -mr-1" />
          </li>
        );
      })}
    </ul>
  );
}

function DashboardPanels({
  recentInquiries,
  jobStatusCounts,
  lowStockItems,
  totalJobs,
}: {
  recentInquiries: InquiryItem[];
  jobStatusCounts: Record<string, number>;
  lowStockItems: LowStockItem[];
  totalJobs: number;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      {/* Recent Inquiries — wider left column */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <LayoutList className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">Recent Inquiries</h2>
          </div>
          <Link
            href="/inquiries"
            className="text-xs text-primary font-medium hover:underline flex items-center"
          >
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <InquiryList inquiries={recentInquiries} />
      </div>

      {/* Right column — Jobs by Status + Low Stock */}
      <div className="space-y-5">
        {/* Jobs by Status */}
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">Jobs by Status</h2>
          </div>
          <div className="space-y-2.5">
            {Object.entries(jobStatusCounts).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No jobs yet.</p>
            ) : (
              Object.entries(jobStatusCounts).map(([status, count]) => (
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-sm">Low Stock Alerts</h2>
            </div>
            <Link
              href="/inventory"
              className="text-xs text-primary font-medium hover:underline flex items-center"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">All inventory items are in stock. ✓</p>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                    <Package className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} {item.unit} left · threshold {item.threshold}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
