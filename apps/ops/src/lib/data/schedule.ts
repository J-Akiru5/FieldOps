import { prisma } from "@syntaxure/db";

export async function getSchedule(startDate: Date, endDate: Date) {
  return prisma.job.findMany({
    where: {
      scheduledAt: { gte: startDate, lte: endDate },
      status: { not: "CANCELLED" },
    },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      assignments: { include: { staffMember: { select: { id: true, name: true } } } },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getUpcomingReminders(hoursThreshold: number) {
  const now = new Date();
  const threshold = new Date(now.getTime() + hoursThreshold * 60 * 60 * 1000);
  return prisma.job.findMany({
    where: {
      scheduledAt: { gte: now, lte: threshold },
      status: { notIn: ["COMPLETED", "CANCELLED"] },
    },
    include: { customer: { select: { name: true, phone: true } } },
  });
}
