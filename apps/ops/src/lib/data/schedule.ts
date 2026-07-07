import { prisma } from "@syntaxure/db";
import { endOfWeek, startOfWeek } from "date-fns";

export async function getSchedule(startDate: Date, endDate: Date) {
  return prisma.job.findMany({
    where: {
      scheduledAt: { gte: startDate, lte: endDate },
      status: { not: "CANCELLED" },
    },
    select: {
      id: true,
      type: true,
      status: true,
      scheduledAt: true,
      customer: { select: { id: true, displayName: true, contactPhone: true } },
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
    include: { customer: { select: { displayName: true, contactPhone: true } } },
  });
}

export async function getWeekJobs(weekStart: Date) {
  const start = startOfWeek(weekStart, { weekStartsOn: 1 });
  const end = endOfWeek(weekStart, { weekStartsOn: 1 });
  end.setHours(23, 59, 59, 999);
  return getSchedule(start, end);
}
