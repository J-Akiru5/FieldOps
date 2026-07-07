"use client";

import { Button, Input } from "@syntaxure/ui";
import { addDays, addWeeks, format, parseISO, startOfWeek, subDays, subWeeks } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ViewMode = "day" | "week" | "month" | "list";

interface ScheduleToolbarProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  currentWeekStart: string;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ScheduleToolbar({
  view,
  onViewChange,
  currentWeekStart,
  selectedDate,
  onDateChange,
  searchQuery,
  onSearchChange,
}: ScheduleToolbarProps) {
  const router = useRouter();
  const weekStart = parseISO(currentWeekStart);

  function handlePrev() {
    if (view === "day") {
      const prev = subDays(selectedDate, 1);
      navigateDate(prev);
    } else if (view === "week") {
      const prev = subWeeks(weekStart, 1);
      router.push(`/schedule?week=${format(prev, "yyyy-MM-dd")}&view=${view}`);
    } else if (view === "month") {
      const prev = subWeeks(weekStart, 4);
      router.push(`/schedule?week=${format(prev, "yyyy-MM-dd")}&view=${view}`);
    } else {
      const prev = subWeeks(weekStart, 1);
      router.push(`/schedule?week=${format(prev, "yyyy-MM-dd")}&view=${view}`);
    }
  }

  function handleNext() {
    if (view === "day") {
      const next = addDays(selectedDate, 1);
      navigateDate(next);
    } else if (view === "week") {
      const next = addWeeks(weekStart, 1);
      router.push(`/schedule?week=${format(next, "yyyy-MM-dd")}&view=${view}`);
    } else if (view === "month") {
      const next = addWeeks(weekStart, 4);
      router.push(`/schedule?week=${format(next, "yyyy-MM-dd")}&view=${view}`);
    } else {
      const next = addWeeks(weekStart, 1);
      router.push(`/schedule?week=${format(next, "yyyy-MM-dd")}&view=${view}`);
    }
  }

  function handleToday() {
    const today = new Date();
    if (view === "day") {
      navigateDate(today);
    } else {
      const monday = startOfWeek(today, { weekStartsOn: 1 });
      router.push(`/schedule?week=${format(monday, "yyyy-MM-dd")}&view=${view}`);
    }
  }

  function navigateDate(date: Date) {
    onDateChange(date);
    router.push(`/schedule?week=${format(date, "yyyy-MM-dd")}&view=day`);
  }

  const dateRangeLabel =
    view === "day"
      ? format(selectedDate, "MMMM d, yyyy")
      : `${format(weekStart, "MMM d")} – ${format(addDays(weekStart, 6), "MMM d, yyyy")}`;

  return (
    <div className="space-y-3">
      {/* Top row */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs, customers, or locations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-2" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card text-sm font-medium min-w-[180px] justify-center">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            {dateRangeLabel}
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button size="sm" className="gap-2" asChild>
            <Link href="/schedule/new">
              <Plus className="h-4 w-4" />
              New Job
            </Link>
          </Button>
        </div>
      </div>

      {/* View tabs */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg border bg-card p-1">
          {(["day", "week", "month", "list"] as ViewMode[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onViewChange(v)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                view === v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
