"use client";

import { format, isSameDay, isToday } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { CALENDAR_END_HOUR, CALENDAR_START_HOUR, HOUR_HEIGHT } from "./calendar-constants";
import { EventCard, type ScheduleJob } from "./event-card";

interface DayViewProps {
  jobs: ScheduleJob[];
  date: Date;
}

function getEventPosition(scheduledAt: Date) {
  const hour = scheduledAt.getHours();
  const minutes = scheduledAt.getMinutes();
  return (hour - CALENDAR_START_HOUR) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
}

export function DayView({ jobs, date }: DayViewProps) {
  const totalHeight = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * HOUR_HEIGHT;
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const dayJobs = useMemo(
    () => jobs.filter((job) => isSameDay(new Date(job.scheduledAt), date)),
    [jobs, date]
  );

  const currentTimeTop = useMemo(() => {
    if (!isToday(date)) return null;
    const hour = now.getHours();
    const minutes = now.getMinutes();
    if (hour < CALENDAR_START_HOUR || hour >= CALENDAR_END_HOUR) return null;
    return (hour - CALENDAR_START_HOUR) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
  }, [now, date]);

  const hours = useMemo(
    () =>
      Array.from(
        { length: CALENDAR_END_HOUR - CALENDAR_START_HOUR + 1 },
        (_, i) => CALENDAR_START_HOUR + i
      ),
    []
  );

  return (
    <div className="flex flex-col h-full min-h-[600px] rounded-xl border bg-card overflow-hidden">
      <div className="p-4 border-b bg-muted/30 shrink-0">
        <h2 className="text-lg font-semibold">{format(date, "EEEE, MMMM d")}</h2>
      </div>

      <div className="flex-1 overflow-y-auto relative">
        <div className="grid grid-cols-[60px_1fr]" style={{ minHeight: totalHeight }}>
          {/* Time labels */}
          <div className="border-r bg-muted/10 relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="text-[10px] text-muted-foreground text-right pr-2 -translate-y-1/2"
                style={{ height: HOUR_HEIGHT }}
              >
                {format(new Date().setHours(hour, 0, 0, 0), "h a")}
              </div>
            ))}
          </div>

          {/* Day column */}
          <div className="relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-b border-dashed border-border/50"
                style={{ height: HOUR_HEIGHT }}
              />
            ))}

            {currentTimeTop !== null && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none"
                style={{ top: currentTimeTop }}
              >
                <div className="relative flex items-center">
                  <div className="h-2 w-2 rounded-full bg-red-500 -translate-x-1" />
                  <div className="flex-1 h-px bg-red-500" />
                </div>
              </div>
            )}

            {dayJobs.map((job) => {
              const scheduledAt = new Date(job.scheduledAt);
              const top = getEventPosition(scheduledAt);
              return (
                <div
                  key={job.id}
                  className="absolute left-0 right-2 z-10"
                  style={{
                    top,
                    height: 2 * HOUR_HEIGHT - 4,
                  }}
                >
                  <EventCard job={job} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
