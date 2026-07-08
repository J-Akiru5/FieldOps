"use client";

import { format } from "date-fns";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { getJobTypeColor } from "./calendar-constants";

export interface ScheduleJob {
  id: string;
  type: string;
  status: string;
  scheduledAt: string | Date;
  customer: {
    id: string;
    displayName: string;
    contactPhone?: string | null;
    address?: string | null;
  };
  appliance?: {
    brand?: string | null;
    model?: string | null;
    locationNotes?: string | null;
  } | null;
  assignments: { staffMember: { id: string; name: string } }[];
}

interface EventCardProps {
  job: ScheduleJob;
  compact?: boolean;
}

function getLocationLabel(job: ScheduleJob): string | null {
  if (job.appliance?.locationNotes) return job.appliance.locationNotes;
  if (job.customer.address) return job.customer.address;
  return null;
}

export function EventCard({ job, compact = false }: EventCardProps) {
  const router = useRouter();
  const colors = getJobTypeColor(job.type);
  const scheduledAt = new Date(job.scheduledAt);
  const location = getLocationLabel(job);

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => router.push(`/jobs/${job.id}`)}
        className={`w-full text-left rounded-md border-l-4 ${colors.border} ${colors.bg} px-2 py-1.5 hover:brightness-95 transition-all`}
      >
        <div className={`text-xs font-semibold truncate ${colors.text}`}>
          {job.customer.displayName}
        </div>
        <div className="text-[10px] text-muted-foreground truncate">
          {format(scheduledAt, "h:mm a")}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.push(`/jobs/${job.id}`)}
      className={`group absolute inset-x-1 rounded-md border-l-4 ${colors.border} ${colors.bg} px-2.5 py-2 text-left shadow-sm hover:shadow-md hover:brightness-95 transition-all overflow-hidden`}
    >
      <div className={`text-xs font-semibold truncate ${colors.text}`}>
        {job.customer.displayName}
      </div>
      <div className="text-[11px] font-medium text-muted-foreground/80 uppercase tracking-wide truncate">
        {job.type.replace("_", " ")}
      </div>
      <div className="text-[11px] text-muted-foreground mt-0.5">
        {format(scheduledAt, "h:mm a")} –{" "}
        {format(new Date(scheduledAt.getTime() + 2 * 60 * 60 * 1000), "h:mm a")}
      </div>
      {location && (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5 truncate">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{location}</span>
        </div>
      )}
      {job.assignments.length > 0 && (
        <div className="text-[10px] text-muted-foreground mt-1 truncate">
          {job.assignments.map((a) => a.staffMember.name).join(", ")}
        </div>
      )}
    </button>
  );
}
