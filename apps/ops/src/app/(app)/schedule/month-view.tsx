"use client";

import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useRouter } from "next/navigation";
import { getJobTypeColor } from "./calendar-constants";
import type { ScheduleJob } from "./event-card";

interface MonthViewProps {
  jobs: ScheduleJob[];
  currentWeekStart: string;
}

export function MonthView({ jobs, currentWeekStart }: MonthViewProps) {
  const router = useRouter();
  const monthStart = startOfMonth(new Date(currentWeekStart));
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  function getJobsForDay(date: Date) {
    return jobs.filter((job) => isSameDay(new Date(job.scheduledAt), date));
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="p-3 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      <div className="divide-y">
        {weeks.map((week) => (
          <div key={week[0].toISOString()} className="grid grid-cols-7 divide-x">
            {week.map((date) => {
              const dayJobs = getJobsForDay(date);
              const isCurrentMonth = isSameMonth(date, monthStart);
              return (
                <button
                  type="button"
                  key={date.toISOString()}
                  onClick={() =>
                    router.push(`/schedule?week=${format(date, "yyyy-MM-dd")}&view=day`)
                  }
                  className={`min-h-[100px] p-2 text-left hover:bg-muted/20 transition-colors ${
                    isToday(date) ? "bg-primary/[0.03]" : ""
                  } ${!isCurrentMonth ? "bg-muted/10 text-muted-foreground/50" : ""}`}
                >
                  <div
                    className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                      isToday(date) ? "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    {format(date, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayJobs.slice(0, 3).map((job) => {
                      const colors = getJobTypeColor(job.type);
                      return (
                        <div
                          key={job.id}
                          className={`text-[10px] truncate rounded px-1.5 py-0.5 border-l-2 ${colors.border} ${colors.bg} ${colors.text}`}
                        >
                          {job.customer.displayName}
                        </div>
                      );
                    })}
                    {dayJobs.length > 3 && (
                      <div className="text-[10px] text-muted-foreground font-medium pl-1">
                        +{dayJobs.length - 3} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
