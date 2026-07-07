import { prisma } from "@syntaxure/db";

export interface PartnerBalance {
  partnerId: string;
  partnerName: string;
  profitShare: number;
  draws: number;
  netEntitlement: number;
}

export interface EquitySummary {
  dateRange: { from: Date; to: Date };
  totalIncome: number;
  totalOperatingExpense: number;
  netOperatingProfit: number;
  /**
   * This business operates as a permanent 50/50 partnership between two owners
   * (Jake = Owner 1, Sir Jose = Owner 2). If a third partner or unequal equity
   * split is ever introduced, profitSharePerPartner must be replaced with a
   * per-partner equityPercentage field — retrofitting this after historical
   * entitlement data exists is expensive and error-prone.
   */
  profitSharePerPartner: number;
  partnerBalances: PartnerBalance[];
}

function toNumber(value: unknown): number {
  return Number(value ?? 0);
}

export async function calculateEquitySummary(from: Date, to: Date): Promise<EquitySummary> {
  const [totalLedgerIncome, totalJobIncome, totalOpExpense, partnerDrawRows, partners] =
    await Promise.all([
      prisma.ledgerEntry.aggregate({
        _sum: { amount: true },
        where: {
          category: "INCOME",
          isVoided: false,
          date: { gte: from, lte: to },
        },
      }),

      prisma.salesTransaction.aggregate({
        _sum: { grossAmount: true },
        where: {
          paymentStatus: "PAID",
          OR: [
            { transactionDate: { gte: from, lte: to } },
            {
              transactionDate: null,
              createdAt: { gte: from, lte: to },
            },
          ],
        },
      }),

      prisma.ledgerEntry.aggregate({
        _sum: { amount: true },
        where: {
          category: "OPERATING_EXPENSE",
          isVoided: false,
          date: { gte: from, lte: to },
        },
      }),

      prisma.ledgerEntry.groupBy({
        by: ["partnerId"],
        _sum: { amount: true },
        where: {
          category: "PARTNER_DRAW",
          isVoided: false,
          date: { gte: from, lte: to },
        },
      }),

      prisma.staffMember.findMany({
        where: { role: "PARTNER" },
        select: { id: true, name: true },
      }),
    ]);

  const ledgerIncome = toNumber(totalLedgerIncome._sum.amount);
  const jobIncome = toNumber(totalJobIncome._sum.grossAmount);
  const totalIncome = ledgerIncome + jobIncome;
  const totalOperatingExpense = toNumber(totalOpExpense._sum.amount);
  const netOperatingProfit = totalIncome - totalOperatingExpense;
  const profitSharePerPartner = netOperatingProfit / 2;

  const drawMap = new Map<string, number>();
  for (const row of partnerDrawRows) {
    if (row.partnerId) {
      drawMap.set(row.partnerId, toNumber(row._sum.amount));
    }
  }

  const partnerBalances: PartnerBalance[] = partners.map((p) => {
    const draws = drawMap.get(p.id) ?? 0;
    return {
      partnerId: p.id,
      partnerName: p.name,
      profitShare: profitSharePerPartner,
      draws,
      netEntitlement: profitSharePerPartner - draws,
    };
  });

  return {
    dateRange: { from, to },
    totalIncome,
    totalOperatingExpense,
    netOperatingProfit,
    profitSharePerPartner,
    partnerBalances,
  };
}
