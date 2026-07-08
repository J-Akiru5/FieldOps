"use client";

import { format, isToday, isTomorrow } from "date-fns";
import { ChevronRight, Package, Settings, UserPlus } from "lucide-react";
import Link from "next/link";
import { DEFAULT_COLOR, JOB_TYPE_COLORS, getJobTypeColor } from "./calendar-constants";

interface ScheduleSidebarProps {
  summary: { total: number; scheduled: number; inProgress: number; completed: number };
  reminders: { id: string; displayName: string; scheduledAt: Date; status: string; type: string }[];
  unassignedCount: number;
  lowStockCount: number;
}

function getReminderTimeLabel(date: Date): string {
  if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
  if (isTomorrow(date)) return `Tomorrow, ${format(date, "h:mm a")}`;
  return format(date, "MMM d, h:mm a");
}

function getReminderIcon(type: string) {
  const colors = getJobTypeColor(type);
  return (
    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${colors.bg}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
    </span>
  );
}

export function ScheduleSidebar({
  summary,
  reminders,
  unassignedCount,
  lowStockCount,
}: ScheduleSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Upcoming Alerts */}
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Upcoming Alerts</h3>
          {reminders.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white">
              {reminders.length}
            </span>
          )}
        </div>

        {reminders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming jobs in the next 24 hours.</p>
        ) : (
          <div className="space-y-3">
            {reminders.slice(0, 4).map((reminder) => (
              <div key={reminder.id} className="flex items-start gap-3">
                {getReminderIcon(reminder.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{reminder.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {getReminderTimeLabel(reminder.scheduledAt)}
                  </p>
                  <p className="text-[10px] text-destructive font-medium">
                    {reminder.status === "SCHEDULED"
                      ? "Scheduled soon"
                      : `${reminder.status.toLowerCase()}`}
                  </p>
                </div>
              </div>
            ))}
            {reminders.length > 4 && (
              <Link
                href="/jobs"
                className="flex items-center text-xs text-primary font-medium hover:underline"
              >
                View all alerts <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Smart Recommendations */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="font-semibold mb-3">Smart Recommendations</h3>
        <div className="space-y-3">
          {unassignedCount > 0 && (
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                <UserPlus className="h-4 w-4 text-blue-500" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Assign Technician</p>
                <p className="text-xs text-muted-foreground">
                  {unassignedCount} job{unassignedCount > 1 ? "s" : ""} need technician
                </p>
                <Link href="/jobs" className="text-xs text-primary font-medium hover:underline">
                  View jobs
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50">
              <Settings className="h-4 w-4 text-amber-500" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Optimize Schedule</p>
              <p className="text-xs text-muted-foreground">Check for overlapping appointments</p>
              <Link
                href="/schedule?view=week"
                className="text-xs text-primary font-medium hover:underline"
              >
                Optimize
              </Link>
            </div>
          </div>

          {lowStockCount > 0 && (
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50">
                <Package className="h-4 w-4 text-rose-500" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Check Inventory</p>
                <p className="text-xs text-muted-foreground">
                  {lowStockCount} item{lowStockCount > 1 ? "s" : ""} low in stock
                </p>
                <Link
                  href="/inventory"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  View inventory
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Summary */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="font-semibold mb-3">Schedule Summary</h3>
        <p className="text-xs text-muted-foreground mb-3">This Week</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold">{summary.total}</div>
            <div className="text-[10px] text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{summary.scheduled}</div>
            <div className="text-[10px] text-muted-foreground">Scheduled</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-amber-600">{summary.inProgress}</div>
            <div className="text-[10px] text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-emerald-600">{summary.completed}</div>
            <div className="text-[10px] text-muted-foreground">Completed</div>
          </div>
        </div>
        <Link
          href="/reports"
          className="flex items-center text-xs text-primary font-medium hover:underline"
        >
          View full report <ChevronRight className="h-3 w-3 ml-1" />
        </Link>
      </div>

      {/* Legend */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="font-semibold mb-3 text-sm">Legend</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(JOB_TYPE_COLORS).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
              {colors.label}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`h-2.5 w-2.5 rounded-full ${DEFAULT_COLOR.dot}`} />
            {DEFAULT_COLOR.label}
          </div>
        </div>
      </div>
    </div>
  );
}
