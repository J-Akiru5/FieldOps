import { prisma } from "@syntaxure/db";

export async function getReportMetrics() {
  try {
    const [jobCounts, inquiryCounts, totalRevenue, lowStockCount] = await Promise.all([
      prisma.job.groupBy({ by: ["status"], _count: true }),
      prisma.inquiry.count(),
      prisma.salesTransaction.aggregate({
        _sum: { grossAmount: true, netProfit: true },
        where: { paymentStatus: "PAID" },
      }),
      prisma.inventoryItem.count({
        where: { quantityOnHand: { lte: prisma.inventoryItem.fields.safetyStockThreshold } },
      }),
    ]);

    return {
      jobsByStatus: jobCounts.map((j) => ({ status: j.status, count: j._count })),
      totalInquiries: inquiryCounts,
      totalRevenue: Number(totalRevenue._sum.grossAmount ?? 0),
      totalProfit: Number(totalRevenue._sum.netProfit ?? 0),
      lowStockItems: lowStockCount,
    };
  } catch {
    return {
      jobsByStatus: [],
      totalInquiries: 0,
      totalRevenue: 0,
      totalProfit: 0,
      lowStockItems: 0,
    };
  }
}
