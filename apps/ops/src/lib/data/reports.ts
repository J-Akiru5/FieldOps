import { prisma } from "@syntaxure/db";

export async function getReportMetrics() {
  try {
    const settings = await prisma.appSettings.findUnique({ where: { id: "singleton" } });
    const lowStockThreshold = settings?.lowStockThreshold ?? 5;

    const [jobCounts, inquiryCounts, revenueAggregate, lowStockCount] = await Promise.all([
      prisma.job.groupBy({ by: ["status"], _count: true }),
      prisma.inquiry.count(),
      prisma.salesTransaction.aggregate({
        _sum: { grossAmount: true, netProfit: true },
        where: { paymentStatus: "PAID" },
      }),
      prisma.inventoryItem.count({
        where: { quantityOnHand: { lte: lowStockThreshold } },
      }),
    ]);

    return {
      jobsByStatus: jobCounts.map((j) => ({ status: j.status, count: j._count })),
      totalInquiries: inquiryCounts,
      totalRevenue: Number(revenueAggregate._sum.grossAmount ?? 0),
      totalProfit: Number(revenueAggregate._sum.netProfit ?? 0),
      lowStockItems: lowStockCount,
      lowStockThreshold,
    };
  } catch {
    return {
      jobsByStatus: [],
      totalInquiries: 0,
      totalRevenue: 0,
      totalProfit: 0,
      lowStockItems: 0,
      lowStockThreshold: 5,
    };
  }
}
