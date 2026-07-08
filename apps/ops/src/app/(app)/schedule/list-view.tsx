"use client";

import { format, isSameDay } from "date-fns";
import { useRouter } from "next/navigation";
import { getJobTypeColor } from "./calendar-constants";
import type { ScheduleJob } from "./event-card";

interface ListViewProps {
  jobs: ScheduleJob[];
  currentWeekStart: string;
}

export function ListView({ jobs }: ListViewProps) {
  const router = useRouter();

  const grouped = jobs.reduce<Record<string, ScheduleJob[]>>((acc, job) => {
    const key = format(new Date(job.scheduledAt), "yyyy-MM-dd");
    if (!acc[key]) acc[key] = [];
    acc[key].push(job);
    return acc;
  }, {});

  const sortedKeys = Object.keys(grouped).sort();

  return (
    <div className="space-y-4">
      {sortedKeys.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
          No jobs scheduled for this period.
        </div>
      ) : (
        sortedKeys.map((key) => {
          const dayJobs = grouped[key];
          const day = new Date(key);
          return (
            <div key={key} className="rounded-xl border bg-card overflow-hidden">
              <div className="bg-muted/30 px-4 py-2 border-b">
                <h3 className="text-sm font-semibold">
                  {format(day, "EEEE, MMMM d")}
                  {isSameDay(day, new Date()) && (
                    <span className="ml-2 text-xs font-normal text-primary">Today</span>
                  )}
                </h3>
              </div>
              <div className="divide-y">
                {dayJobs.map((job) => {
                  const colors = getJobTypeColor(job.type);
                  const scheduledAt = new Date(job.scheduledAt);
                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => router.push(`/jobs/${job.id}`)}
                      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted/20 transition-colors text-left"
                    >
                      <div className="text-sm font-medium w-24 shrink-0">
                        {format(scheduledAt, "h:mm a")}
                      </div>
                      <div className={`w-1 h-10 rounded-full ${colors.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{job.customer.displayName}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span
                            className={`text-[10px] uppercase tracking-wide font-medium ${colors.text}`}
                          >
                            {colors.label}
                          </span>
                          {job.assignments.length > 0 && (
                            <span className="truncate">
                              {job.assignments.map((a) => a.staffMember.name).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {job.status.toLowerCase()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
