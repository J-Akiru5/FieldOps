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
import { Calendar, Plus, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

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

export function JobsListClient({ jobs }: { jobs: JobRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const statuses = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

  function handleStatusChange(jobId: string, newStatus: string) {
    startTransition(async () => {
      await updateJobStatusAction(jobId, newStatus as never);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
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

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
            <Wrench className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No jobs yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tap{" "}
            <Link href="/jobs/new" className="text-primary hover:underline">
              New Job
            </Link>{" "}
            or convert an inquiry to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">
                  Type
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                  <Calendar className="h-3.5 w-3.5 inline mr-1" />
                  Scheduled
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Details</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium">{job.customer.displayName}</span>
                    <span className="text-muted-foreground text-xs block sm:hidden">
                      {job.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {job.type}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                    {format(new Date(job.scheduledAt), "MMM d, h:mm a")}
                  </td>
                  <td className="px-4 py-3">
                    <Select value={job.status} onValueChange={(v) => handleStatusChange(job.id, v)}>
                      <SelectTrigger className="h-7 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      More
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
