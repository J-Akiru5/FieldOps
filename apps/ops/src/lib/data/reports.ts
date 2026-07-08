import { prisma } from "@syntaxure/db";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

export interface ReportPeriod {
  from: Date;
  to: Date;
}

// ── Summary metrics (used by Reports KPI strip + Dashboard) ──────────────────

export async function getReportMetrics() {
  try {
    const now = new Date();
    const from = startOfMonth(now);
    const to = endOfMonth(now);
    const prevFrom = startOfMonth(subMonths(now, 1));
    const prevTo = endOfMonth(subMonths(now, 1));

    const [jobCounts, inquiryCounts, revenue, prevRevenue, lowStockCount] = await Promise.all([
      prisma.job.groupBy({ by: ["status"], _count: true }),
      prisma.inquiry.count(),
      prisma.salesTransaction.aggregate({
        _sum: { grossAmount: true, netProfit: true },
        where: {
          paymentStatus: "PAID",
          OR: [
            { transactionDate: { gte: from, lte: to } },
            { transactionDate: null, createdAt: { gte: from, lte: to } },
          ],
        },
      }),
      prisma.salesTransaction.aggregate({
        _sum: { grossAmount: true, netProfit: true },
        where: {
          paymentStatus: "PAID",
          OR: [
            { transactionDate: { gte: prevFrom, lte: prevTo } },
            { transactionDate: null, createdAt: { gte: prevFrom, lte: prevTo } },
          ],
        },
      }),
      prisma.inventoryItem.count({ where: { quantityOnHand: { lte: 5 } } }),
    ]);

    return {
      jobsByStatus: jobCounts.map((j) => ({ status: j.status, count: j._count })),
      totalInquiries: inquiryCounts,
      totalRevenue: Number(revenue._sum.grossAmount ?? 0),
      totalProfit: Number(revenue._sum.netProfit ?? 0),
      prevRevenue: Number(prevRevenue._sum.grossAmount ?? 0),
      prevProfit: Number(prevRevenue._sum.netProfit ?? 0),
      lowStockItems: lowStockCount,
    };
  } catch {
    return {
      jobsByStatus: [],
      totalInquiries: 0,
      totalRevenue: 0,
      totalProfit: 0,
      prevRevenue: 0,
      prevProfit: 0,
      lowStockItems: 0,
    };
  }
}

// ── Jobs Report ───────────────────────────────────────────────────────────────

export async function getJobReport(period: ReportPeriod) {
  try {
    const [byStatus, byType, topCustomers, recentJobs] = await Promise.all([
      prisma.job.groupBy({
        by: ["status"],
        _count: true,
        where: { scheduledAt: { gte: period.from, lte: period.to } },
      }),
      prisma.job.groupBy({
        by: ["type"],
        _count: true,
        where: { scheduledAt: { gte: period.from, lte: period.to } },
      }),
      prisma.customer.findMany({
        select: {
          id: true,
          displayName: true,
          _count: { select: { jobs: true } },
          jobs: {
            select: { scheduledAt: true },
            orderBy: { scheduledAt: "desc" },
            take: 1,
            where: { scheduledAt: { gte: period.from, lte: period.to } },
          },
        },
        orderBy: { jobs: { _count: "desc" } },
        take: 10,
        where: { jobs: { some: { scheduledAt: { gte: period.from, lte: period.to } } } },
      }),
      prisma.job.findMany({
        where: { scheduledAt: { gte: period.from, lte: period.to } },
        select: {
          id: true,
          type: true,
          status: true,
          scheduledAt: true,
          laborFee: true,
          customer: { select: { displayName: true } },
          assignments: { include: { staffMember: { select: { name: true } } }, take: 2 },
        },
        orderBy: { scheduledAt: "desc" },
        take: 50,
      }),
    ]);

    return {
      byStatus: byStatus.map((j) => ({ status: j.status, count: j._count })),
      byType: byType.map((j) => ({ type: j.type, count: j._count })),
      topCustomers: topCustomers.map((c) => ({
        id: c.id,
        displayName: c.displayName,
        jobCount: c._count.jobs,
        lastJobDate: c.jobs[0]?.scheduledAt?.toISOString() ?? null,
      })),
      recentJobs: recentJobs.map((j) => ({
        id: j.id,
        type: j.type,
        status: j.status,
        scheduledAt: j.scheduledAt.toISOString(),
        laborFee: Number(j.laborFee),
        customerName: j.customer.displayName,
        technicians: j.assignments.map((a) => a.staffMember.name).join(", "),
      })),
    };
  } catch {
    return { byStatus: [], byType: [], topCustomers: [], recentJobs: [] };
  }
}

// ── Revenue Report ────────────────────────────────────────────────────────────

export async function getRevenueReport(period: ReportPeriod) {
  try {
    const transactions = await prisma.salesTransaction.findMany({
      where: {
        OR: [
          { transactionDate: { gte: period.from, lte: period.to } },
          { transactionDate: null, createdAt: { gte: period.from, lte: period.to } },
        ],
      },
      include: {
        job: {
          select: {
            id: true,
            type: true,
            customer: { select: { displayName: true } },
          },
        },
      },
      orderBy: { grossAmount: "desc" },
      take: 50,
    });

    const totalRevenue = transactions.reduce((s, t) => s + Number(t.grossAmount), 0);
    const totalProfit = transactions.reduce((s, t) => s + Number(t.netProfit), 0);
    const paidCount = transactions.filter((t) => t.paymentStatus === "PAID").length;

    return {
      totalRevenue,
      totalProfit,
      transactionCount: transactions.length,
      paidCount,
      avgRevenue: transactions.length > 0 ? totalRevenue / transactions.length : 0,
      transactions: transactions.map((t) => ({
        id: t.id,
        jobId: t.jobId,
        jobType: t.job?.type ?? "",
        customerName: t.job?.customer.displayName ?? "",
        grossAmount: Number(t.grossAmount),
        netProfit: Number(t.netProfit),
        paymentStatus: t.paymentStatus,
        date: (t.transactionDate ?? t.createdAt).toISOString(),
      })),
    };
  } catch {
    return {
      totalRevenue: 0,
      totalProfit: 0,
      transactionCount: 0,
      paidCount: 0,
      avgRevenue: 0,
      transactions: [],
    };
  }
}

// ── Inventory Report ──────────────────────────────────────────────────────────

export async function getInventoryReport() {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { lineItems: true, movements: true } },
      },
    });

    const LOW_STOCK_THRESHOLD = 5;

    return items.map((item) => {
      const qty = Number(item.quantityOnHand);
      const safety = Number(item.safetyStockThreshold);
      const status = qty <= 0 ? "OUT" : qty <= safety || qty <= LOW_STOCK_THRESHOLD ? "LOW" : "OK";
      return {
        id: item.id,
        sku: item.sku,
        name: item.name,
        unit: item.unit,
        quantityOnHand: qty,
        safetyStockThreshold: safety,
        unitCost: Number(item.unitCost),
        stockValue: qty * Number(item.unitCost),
        status,
        lineItemCount: item._count.lineItems,
        movementCount: item._count.movements,
      };
    });
  } catch {
    return [];
  }
}

// ── Customer Report ───────────────────────────────────────────────────────────

export async function getCustomerReport(period: ReportPeriod) {
  try {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        displayName: true,
        contactPhone: true,
        type: true,
        jobs: {
          where: { scheduledAt: { gte: period.from, lte: period.to } },
          select: { id: true, status: true },
        },
      },
      orderBy: { jobs: { _count: "desc" } },
      take: 50,
    });

    return customers.map((c) => ({
      id: c.id,
      displayName: c.displayName,
      contactPhone: c.contactPhone,
      type: c.type,
      jobCount: c.jobs.length,
      completedJobs: c.jobs.filter((j) => j.status === "COMPLETED").length,
    }));
  } catch {
    return [];
  }
}
