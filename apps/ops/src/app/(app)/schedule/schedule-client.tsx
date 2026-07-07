"use client";

import { Button } from "@syntaxure/ui";
import { Avatar, AvatarFallback } from "@syntaxure/ui";
import { StatusBadge } from "@syntaxure/ui";
import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  isToday,
  parseISO,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

type Job = {
  id: string;
  type: string;
  scheduledAt: string | Date;
  status: string;
  customer: { id: string; displayName: string; contactPhone?: string | null };
  assignments: { staffMember: { id: string; name: string } }[];
};

interface ScheduleClientProps {
  jobs: Job[];
  currentWeekStart: string;
}

function WeekGrid({
  jobs,
  currentWeekStart,
  onNavigate,
}: { jobs: Job[]; currentWeekStart: string; onNavigate: (url: string) => void }) {
  const router = useRouter();
  const weekStart = parseISO(currentWeekStart);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function getJobsForDay(day: Date) {
    return jobs.filter((job) => isSameDay(new Date(job.scheduledAt), day));
  }

  function handlePrevWeek() {
    const prev = subWeeks(weekStart, 1);
    onNavigate(`/schedule?week=${format(prev, "yyyy-MM-dd")}`);
  }

  function handleNextWeek() {
    const next = addWeeks(weekStart, 1);
    onNavigate(`/schedule?week=${format(next, "yyyy-MM-dd")}`);
  }

  function handleToday() {
    const todayStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    onNavigate(`/schedule?week=${format(todayStart, "yyyy-MM-dd")}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={handleToday}>
          Today
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map((day) => (
          <div key={day.toISOString()} className="py-2 font-medium text-muted-foreground">
            <div>{format(day, "EEE")}</div>
            <div
              className={`mt-1 mx-auto flex h-7 w-7 items-center justify-center rounded-full ${
                isToday(day) ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayJobs = getJobsForDay(day);
          return (
            <div
              key={day.toISOString()}
              className="min-w-0 border rounded-md bg-card min-h-[120px] p-1"
            >
              {dayJobs.length === 0 ? (
                <div className="text-xs text-muted-foreground p-2 text-center">No jobs</div>
              ) : (
                <div className="space-y-1">
                  {dayJobs.map((job) => (
                    <button
                      type="button"
                      key={job.id}
                      onClick={() => router.push(`/jobs/${job.id}`)}
                      className="w-full text-xs p-2 rounded border bg-background text-left hover:bg-accent transition-colors"
                    >
                      <div className="font-medium truncate">{job.customer.displayName}</div>
                      <div className="text-muted-foreground truncate">
                        {format(new Date(job.scheduledAt), "h:mm a")}
                      </div>
                      <div className="mt-1">
                        <StatusBadge status={job.type} />
                      </div>
                      {job.assignments.length > 0 && (
                        <div className="text-muted-foreground truncate mt-1">
                          {job.assignments.map((a) => a.staffMember.name).join(", ")}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayAgenda({
  jobs,
  selectedDate,
  onDateChange,
}: { jobs: Job[]; selectedDate: Date; onDateChange: (date: Date) => void }) {
  const router = useRouter();

  const dayJobs = jobs.filter((job) => isSameDay(new Date(job.scheduledAt), selectedDate));

  function handlePrevDay() {
    onDateChange(addDays(selectedDate, -1));
  }

  function handleNextDay() {
    onDateChange(addDays(selectedDate, 1));
  }

  function handleToday() {
    onDateChange(new Date());
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="font-medium text-sm">{format(selectedDate, "EEEE, MMMM d")}</span>
        </div>
        {!isToday(selectedDate) && (
          <Button variant="ghost" size="sm" onClick={handleToday}>
            Today
          </Button>
        )}
      </div>

      {dayJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
            <Briefcase className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No jobs scheduled</p>
          <p className="text-xs text-muted-foreground mt-1">Tap the + button below to add one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dayJobs.map((job) => (
            <button
              type="button"
              key={job.id}
              onClick={() => router.push(`/jobs/${job.id}`)}
              className="w-full min-h-[56px] flex items-center gap-3 p-3 border-b border-border bg-card hover:bg-accent transition-colors text-left"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-muted">
                  <Briefcase className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{job.customer.displayName}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <StatusBadge status={job.type} />
                  <span>{format(new Date(job.scheduledAt), "h:mm a")}</span>
                  {job.assignments.length > 0 && (
                    <span className="truncate">
                      {job.assignments.map((a) => a.staffMember.name).join(", ")}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScheduleClient({ jobs, currentWeekStart }: ScheduleClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const router = useRouter();

  const handleNavigate = useCallback(
    (url: string) => {
      router.push(url);
    },
    [router]
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage service appointments</p>
      </div>

      <div className="lg:hidden">
        <DayAgenda jobs={jobs} selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

      <div className="hidden lg:block">
        <WeekGrid jobs={jobs} currentWeekStart={currentWeekStart} onNavigate={handleNavigate} />
      </div>
    </div>
  );
}
