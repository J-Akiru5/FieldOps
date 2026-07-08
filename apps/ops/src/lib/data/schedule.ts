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
      customer: {
        select: {
          id: true,
          displayName: true,
          contactPhone: true,
          address: true,
        },
      },
      appliance: {
        select: {
          brand: true,
          model: true,
          locationNotes: true,
        },
      },
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
    orderBy: { scheduledAt: "asc" },
    take: 10,
  });
}

export async function getWeekJobs(weekStart: Date) {
  const start = startOfWeek(weekStart, { weekStartsOn: 1 });
  const end = endOfWeek(weekStart, { weekStartsOn: 1 });
  end.setHours(23, 59, 59, 999);
  return getSchedule(start, end);
}

export async function getScheduleSummary(weekStart: Date) {
  const start = startOfWeek(weekStart, { weekStartsOn: 1 });
  const end = endOfWeek(weekStart, { weekStartsOn: 1 });
  end.setHours(23, 59, 59, 999);

  const counts = await prisma.job.groupBy({
    by: ["status"],
    where: {
      scheduledAt: { gte: start, lte: end },
      status: { not: "CANCELLED" },
    },
    _count: true,
  });

  const total = counts.reduce((sum, row) => sum + row._count, 0);
  const scheduled = counts.find((r) => r.status === "SCHEDULED")?._count ?? 0;
  const inProgress = counts.find((r) => r.status === "IN_PROGRESS")?._count ?? 0;
  const completed = counts.find((r) => r.status === "COMPLETED")?._count ?? 0;

  return { total, scheduled, inProgress, completed };
}

export async function getUnassignedJobsCount() {
  return prisma.job.count({
    where: {
      status: { notIn: ["COMPLETED", "CANCELLED"] },
      assignments: { none: {} },
    },
  });
}
