"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DayView } from "./day-view";
import type { ScheduleJob } from "./event-card";
import { ListView } from "./list-view";
import { MonthView } from "./month-view";
import { ScheduleSidebar } from "./schedule-sidebar";
import { ScheduleToolbar } from "./schedule-toolbar";
import { WeekView } from "./week-view";

interface ScheduleClientProps {
  jobs: ScheduleJob[];
  currentWeekStart: string;
  initialView: string;
  summary: { total: number; scheduled: number; inProgress: number; completed: number };
  reminders: { id: string; displayName: string; scheduledAt: Date; status: string; type: string }[];
  unassignedCount: number;
  lowStockCount: number;
}

type ViewMode = "day" | "week" | "month" | "list";

function isValidView(view: string): view is ViewMode {
  return ["day", "week", "month", "list"].includes(view);
}

export function ScheduleClient({
  jobs,
  currentWeekStart,
  initialView,
  summary,
  reminders,
  unassignedCount,
  lowStockCount,
}: ScheduleClientProps) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>(isValidView(initialView) ? initialView : "week");
  const [selectedDate, setSelectedDate] = useState(new Date(currentWeekStart));
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((job) => {
      const customerMatch = job.customer.displayName.toLowerCase().includes(q);
      const typeMatch = job.type.toLowerCase().includes(q);
      const locationMatch =
        (job.customer.address?.toLowerCase().includes(q) ?? false) ||
        (job.appliance?.locationNotes?.toLowerCase().includes(q) ?? false);
      const technicianMatch = job.assignments.some((a) =>
        a.staffMember.name.toLowerCase().includes(q)
      );
      return customerMatch || typeMatch || locationMatch || technicianMatch;
    });
  }, [jobs, searchQuery]);

  function handleViewChange(newView: ViewMode) {
    setView(newView);
    router.push(`/schedule?week=${currentWeekStart.slice(0, 10)}&view=${newView}`, {
      scroll: false,
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage service appointments</p>
      </div>

      <ScheduleToolbar
        view={view}
        onViewChange={handleViewChange}
        currentWeekStart={currentWeekStart}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3">
          {view === "week" && <WeekView jobs={filteredJobs} currentWeekStart={currentWeekStart} />}
          {view === "day" && <DayView jobs={filteredJobs} date={selectedDate} />}
          {view === "month" && (
            <MonthView jobs={filteredJobs} currentWeekStart={currentWeekStart} />
          )}
          {view === "list" && <ListView jobs={filteredJobs} currentWeekStart={currentWeekStart} />}
        </div>

        <div className="hidden lg:block lg:col-span-1">
          <ScheduleSidebar
            summary={summary}
            reminders={reminders}
            unassignedCount={unassignedCount}
            lowStockCount={lowStockCount}
          />
        </div>
      </div>

      {/* Mobile-only legend */}
      <div className="lg:hidden rounded-xl border bg-card p-4">
        <h3 className="font-semibold mb-3 text-sm">Legend</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Installation", dot: "bg-blue-500" },
            { label: "Repair", dot: "bg-rose-500" },
            { label: "Maintenance", dot: "bg-emerald-500" },
            { label: "Others", dot: "bg-amber-500" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
