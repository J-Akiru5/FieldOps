"use client";

import { addDays, format, isSameDay, isToday, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { CALENDAR_END_HOUR, CALENDAR_START_HOUR, HOUR_HEIGHT } from "./calendar-constants";
import { EventCard, type ScheduleJob } from "./event-card";

interface WeekViewProps {
  jobs: ScheduleJob[];
  currentWeekStart: string;
}

function getEventPosition(scheduledAt: Date) {
  const hour = scheduledAt.getHours();
  const minutes = scheduledAt.getMinutes();
  const top = (hour - CALENDAR_START_HOUR) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
  return Math.max(top, 0);
}

export function WeekView({ jobs, currentWeekStart }: WeekViewProps) {
  const weekStart = parseISO(currentWeekStart);
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );
  const totalHeight = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * HOUR_HEIGHT;

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const currentTimeTop = useMemo(() => {
    if (!isToday(now)) return null;
    const hour = now.getHours();
    const minutes = now.getMinutes();
    if (hour < CALENDAR_START_HOUR || hour >= CALENDAR_END_HOUR) return null;
    return (hour - CALENDAR_START_HOUR) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
  }, [now]);

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
      {/* Header row */}
      <div className="grid grid-cols-8 border-b bg-muted/30 shrink-0">
        <div className="p-3 text-xs font-medium text-muted-foreground border-r">Time</div>
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={`p-3 text-center text-xs border-r last:border-r-0 ${isToday(day) ? "bg-primary/5" : ""}`}
          >
            <div className="font-medium text-muted-foreground">{format(day, "EEE")}</div>
            <div
              className={`mt-1 mx-auto flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold ${
                isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground"
              }`}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* All-day row */}
      <div className="grid grid-cols-8 border-b bg-muted/10 shrink-0">
        <div className="p-2 text-[10px] font-medium text-muted-foreground border-r flex items-center">
          All day
        </div>
        {days.map((day) => {
          const dayJobs = jobs.filter((job) => isSameDay(new Date(job.scheduledAt), day));
          return (
            <div
              key={`allday-${day.toISOString()}`}
              className={`p-1.5 min-h-[40px] border-r last:border-r-0 ${isToday(day) ? "bg-primary/5" : ""}`}
            >
              {dayJobs.length > 0 && (
                <div className="text-[10px] text-muted-foreground font-medium truncate">
                  {dayJobs.length} job{dayJobs.length > 1 ? "s" : ""}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="grid grid-cols-8" style={{ minHeight: totalHeight }}>
          {/* Time labels column */}
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

          {/* Day columns */}
          {days.map((day) => {
            const dayJobs = jobs.filter((job) => isSameDay(new Date(job.scheduledAt), day));
            const isTodayColumn = isToday(day);
            return (
              <div
                key={day.toISOString()}
                className={`relative border-r last:border-r-0 ${isTodayColumn ? "bg-primary/[0.02]" : ""}`}
              >
                {/* Hour grid lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-dashed border-border/50"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}

                {/* Current time indicator */}
                {isTodayColumn && currentTimeTop !== null && (
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

                {/* Events */}
                {dayJobs.map((job) => {
                  const scheduledAt = new Date(job.scheduledAt);
                  const top = getEventPosition(scheduledAt);
                  return (
                    <div
                      key={job.id}
                      className="absolute left-0 right-0 z-10"
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
