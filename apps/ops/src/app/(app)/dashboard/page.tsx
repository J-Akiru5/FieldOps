import { getLowStockItems } from "@/lib/data/inventory";
import { calculateEquitySummary } from "@/lib/data/partnership-ledger";
import { prisma } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

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

async function getDashboardStats(
  role: string | undefined,
  staffMemberId: string | undefined
): Promise<DashboardStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const upperRole = role?.toUpperCase() ?? "";
  const isPartner = upperRole === "OWNER" || upperRole === "PARTNER";
  const isBookkeeper = upperRole === "BOOKKEEPER";
  const isTechnician = upperRole === "TECHNICIAN";

  try {
    const [inquiryCount, jobCounts, grossSalesAgg, equitySummary, myJobsToday] = await Promise.all([
      prisma.inquiry.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.job.groupBy({ by: ["status"], _count: true }),
      prisma.salesTransaction.aggregate({
        _sum: { grossAmount: true },
        where: { paymentStatus: "PAID" },
      }),
      isPartner || isBookkeeper
        ? calculateEquitySummary(startOfMonth, endOfMonth)
        : Promise.resolve(null),
      isTechnician && staffMemberId
        ? prisma.job.count({
            where: {
              assignments: { some: { staffMemberId } },
              scheduledAt: { gte: todayStart, lte: todayEnd },
              status: { not: "CANCELLED" },
            },
          })
        : Promise.resolve(0),
    ]);

    const scheduled = jobCounts.find((j) => j.status === "SCHEDULED")?._count ?? 0;
    const completed = jobCounts.find((j) => j.status === "COMPLETED")?._count ?? 0;
    const grossSales = Number(grossSalesAgg._sum.grossAmount ?? 0);
    const netProfit = equitySummary
      ? equitySummary.totalIncome - equitySummary.totalOperatingExpense
      : 0;

    let yourShare: number | null = null;
    if (isPartner && equitySummary) {
      const partnerBalance = equitySummary.partnerBalances.find(
        (pb) => pb.partnerId === staffMemberId
      );
      yourShare = partnerBalance ? partnerBalance.netEntitlement : null;
    }

    const lowStockItems = await getLowStockItems().catch(() => []);

    return {
      inquiryCount,
      scheduled,
      completed,
      lowStockCount: lowStockItems.length,
      grossSales,
      netProfit,
      yourShare,
      myJobsToday,
    };
  } catch {
    return {
      inquiryCount: 0,
      scheduled: 0,
      completed: 0,
      lowStockCount: 0,
      grossSales: 0,
      netProfit: 0,
      yourShare: null,
      myJobsToday: 0,
    };
  }
}

async function getRecentInquiries() {
  try {
    return prisma.inquiry.findMany({
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
    });
  } catch {
    return [];
  }
}

async function getJobStatusCounts() {
  try {
    const counts = await prisma.job.groupBy({ by: ["status"], _count: true });
    return Object.fromEntries(counts.map((c) => [c.status, c._count])) as Record<string, number>;
  } catch {
    return {} as Record<string, number>;
  }
}

async function getLowStockSummary() {
  try {
    const items = await getLowStockItems();
    return items.slice(0, 5).map((item) => ({
      id: item.id,
      name: item.name,
      quantity: Number(item.quantityOnHand),
      unit: item.unit,
      threshold: Number(item.safetyStockThreshold),
    }));
  } catch {
    return [];
  }
}

async function getUserContext() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const staff = await prisma.staffMember.findUnique({
    where: { authUserId: user.id },
    select: { id: true, name: true, role: true },
  });

  const firstName = staff?.name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "there";
  const role = staff?.role ?? "TECHNICIAN";

  return {
    userId: user.id,
    staffMemberId: staff?.id,
    firstName,
    role,
  };
}

export default async function DashboardPage() {
  const { staffMemberId, firstName, role } = await getUserContext();

  const [stats, recentInquiries, jobStatusCounts, lowStockItems] = await Promise.all([
    getDashboardStats(role, staffMemberId),
    getRecentInquiries(),
    getJobStatusCounts(),
    getLowStockSummary(),
  ]);

  return (
    <DashboardClient
      firstName={firstName}
      role={role}
      stats={stats}
      recentInquiries={recentInquiries.map((i) => ({ ...i, createdAt: i.createdAt.toISOString() }))}
      jobStatusCounts={jobStatusCounts}
      lowStockItems={lowStockItems}
    />
  );
}
