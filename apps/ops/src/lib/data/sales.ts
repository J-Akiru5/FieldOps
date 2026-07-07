import { prisma } from "@syntaxure/db";

export async function getSales() {
  return prisma.salesTransaction.findMany({
    include: {
      job: { include: { customer: { select: { displayName: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getSalesMetrics() {
  const totals = await prisma.salesTransaction.aggregate({
    _sum: { grossAmount: true, netProfit: true },
    where: { paymentStatus: "PAID" },
  });
  return {
    totalRevenue: Number(totals._sum.grossAmount ?? 0),
    totalProfit: Number(totals._sum.netProfit ?? 0),
  };
}
