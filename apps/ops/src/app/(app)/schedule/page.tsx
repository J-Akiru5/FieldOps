import { getWeekJobs } from "@/lib/data/schedule";
import { startOfWeek } from "date-fns";
import { ScheduleClient } from "./schedule-client";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const today = new Date();
  const weekStart = params.week
    ? startOfWeek(new Date(params.week), { weekStartsOn: 1 })
    : startOfWeek(today, { weekStartsOn: 1 });

  const jobs = await getWeekJobs(weekStart);

  return <ScheduleClient jobs={jobs} currentWeekStart={weekStart.toISOString()} />;
}
