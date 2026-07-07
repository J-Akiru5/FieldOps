import { getLowStockItems } from "@/lib/data/inventory";
import {
  getScheduleSummary,
  getUnassignedJobsCount,
  getUpcomingReminders,
  getWeekJobs,
} from "@/lib/data/schedule";
import { startOfWeek } from "date-fns";
import { ScheduleClient } from "./schedule-client";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; view?: string }>;
}) {
  const params = await searchParams;
  const today = new Date();
  const weekStart = params.week
    ? startOfWeek(new Date(params.week), { weekStartsOn: 1 })
    : startOfWeek(today, { weekStartsOn: 1 });

  const [jobs, summary, reminders, unassignedCount, lowStockItems] = await Promise.all([
    getWeekJobs(weekStart).catch((error) => {
      console.error("[schedule] Failed to load jobs:", error);
      return [];
    }),
    getScheduleSummary(weekStart).catch((error) => {
      console.error("[schedule] Failed to load summary:", error);
      return { total: 0, scheduled: 0, inProgress: 0, completed: 0 };
    }),
    getUpcomingReminders(24).catch((error) => {
      console.error("[schedule] Failed to load reminders:", error);
      return [];
    }),
    getUnassignedJobsCount().catch((error) => {
      console.error("[schedule] Failed to load unassigned count:", error);
      return 0;
    }),
    getLowStockItems().catch((error) => {
      console.error("[schedule] Failed to load low stock:", error);
      return [];
    }),
  ]);

  const serializedReminders = reminders.map((job) => ({
    id: job.id,
    displayName: job.customer.displayName,
    scheduledAt: job.scheduledAt,
    status: job.status,
    type: job.type,
  }));

  return (
    <ScheduleClient
      jobs={jobs}
      currentWeekStart={weekStart.toISOString()}
      initialView={params.view ?? "week"}
      summary={summary}
      reminders={serializedReminders}
      unassignedCount={unassignedCount}
      lowStockCount={lowStockItems.length}
    />
  );
}
