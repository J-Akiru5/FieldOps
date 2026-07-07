"use client";

import { updateJobStatusAction } from "@/app/actions/jobs";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@syntaxure/ui";
import { format } from "date-fns";
import { Calendar, ChevronRight, MapPin, Plus, Search, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

interface JobRow {
  id: string;
  type: string;
  status: string;
  scheduledAt: string;
  createdAt: string;
  customer: { displayName: string; contactPhone: string };
  appliance: { brand: string | null; model: string | null } | null;
  assignments: { staffMember: { name: string } }[];
}

const statuses = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-slate-50 text-slate-600 border-slate-200",
};

const typeColors: Record<string, string> = {
  MAINTENANCE: "bg-emerald-500",
  REPAIR: "bg-rose-500",
  INSTALLATION: "bg-blue-500",
};

export function JobsListClient({ jobs }: { jobs: JobRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.customer.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.assignments.some((a) =>
          a.staffMember.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesStatus = statusFilter ? job.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  function handleStatusChange(jobId: string, newStatus: string) {
    startTransition(async () => {
      const result = await updateJobStatusAction(jobId, newStatus as never);
      if (result.success) {
        toast.success("Status updated");
      } else {
        toast.error(result.error ?? "Failed to update status");
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1">Track service jobs and repairs</p>
        </div>
        <Link href="/jobs/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New job
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search jobs, customers, or technicians..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Jobs grid */}
      {filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
            <Wrench className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No jobs found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tap{" "}
            <Link href="/jobs/new" className="text-primary hover:underline">
              New Job
            </Link>{" "}
            or convert an inquiry to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="group rounded-xl border bg-card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${typeColors[job.type] ?? "bg-slate-400"}`}
                  />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {job.type}
                  </span>
                </div>
                <Select value={job.status} onValueChange={(v) => handleStatusChange(job.id, v)}>
                  <SelectTrigger className="h-7 text-xs border-0 bg-transparent p-0 hover:bg-muted/50 px-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                        statusColors[job.status] ?? statusColors.SCHEDULED
                      }`}
                    >
                      {job.status.replace("_", " ")}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Link href={`/jobs/${job.id}`} className="block">
                <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                  {job.customer.displayName}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{job.customer.contactPhone}</p>

                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{format(new Date(job.scheduledAt), "MMM d, h:mm a")}</span>
                  </div>
                  {job.appliance && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Wrench className="h-3.5 w-3.5" />
                      <span className="truncate">
                        {[job.appliance.brand, job.appliance.model].filter(Boolean).join(" ")}
                      </span>
                    </div>
                  )}
                  {job.assignments.length > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">
                        {job.assignments.map((a) => a.staffMember.name).join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center text-xs font-medium text-primary">
                  View details <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
