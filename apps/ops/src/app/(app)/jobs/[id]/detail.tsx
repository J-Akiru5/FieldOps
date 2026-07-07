"use client";

import { updateJobStatusAction } from "@/app/actions/jobs";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@syntaxure/ui";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface JobDetail {
  id: string;
  type: string;
  status: string;
  scheduledAt: string;
  createdAt: string;
  updatedAt: string;
  laborFee: number;
  customer: {
    id: string;
    displayName: string;
    contactPhone: string;
    contactEmail: string | null;
    address: string | null;
  };
  appliance: { id: string; brand: string | null; model: string | null; type: string } | null;
  assignments: { staffMember: { id: string; name: string; role: string } }[];
  inquiry: { id: string; source: string; status: string } | null;
}

const statuses = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export function JobDetailClient({ job }: { job: JobDetail }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [cancelOpen, setCancelOpen] = useState(false);

  function handleStatusChange(s: string) {
    if (s === "CANCELLED") {
      setCancelOpen(true);
      return;
    }
    startTransition(async () => {
      const result = await updateJobStatusAction(job.id, s as never);
      if (result.success) {
        toast.success("Status updated");
      } else {
        toast.error("Failed to update status");
      }
      router.refresh();
    });
  }

  function confirmCancel() {
    startTransition(async () => {
      const result = await updateJobStatusAction(job.id, "CANCELLED" as never);
      if (result.success) {
        toast.success("Status updated");
      } else {
        toast.error("Failed to update status");
      }
      setCancelOpen(false);
      router.refresh();
    });
  }

  function cancelCancel() {
    setCancelOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/jobs" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Job {job.type}</h1>
          <p className="text-sm text-muted-foreground">{job.customer.displayName}</p>
        </div>
        <Select value={job.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-36">
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
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Customer</h2>
          <div>
            <Link href={`/customers/${job.customer.id}`} className="font-medium hover:underline">
              {job.customer.displayName}
            </Link>
            <p className="text-sm text-muted-foreground">{job.customer.contactPhone}</p>
            {job.customer.contactEmail && (
              <p className="text-xs text-muted-foreground">{job.customer.contactEmail}</p>
            )}
            {job.customer.address && (
              <p className="text-xs text-muted-foreground">{job.customer.address}</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Type</span>
              <p className="font-medium">{job.type}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Labor fee</span>
              <p className="font-medium">₱{job.laborFee.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Scheduled</span>
              <p className="font-medium">
                {format(new Date(job.scheduledAt), "MMM d, yyyy h:mm a")}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Created</span>
              <p className="font-medium text-xs">
                {format(new Date(job.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          {job.appliance && (
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {job.appliance.brand} {job.appliance.model} ({job.appliance.type})
              </span>
            </div>
          )}
        </div>

        {job.assignments.length > 0 && (
          <div className="rounded-xl border bg-card p-6 space-y-4 md:col-span-2">
            <h2 className="text-sm font-semibold text-muted-foreground">Assigned Technicians</h2>
            <div className="flex flex-wrap gap-2">
              {job.assignments.map((a) => (
                <span
                  key={a.staffMember.id}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium"
                >
                  <Calendar className="h-3 w-3" /> {a.staffMember.name} ({a.staffMember.role})
                </span>
              ))}
            </div>
          </div>
        )}

        {job.inquiry && (
          <div className="rounded-xl border bg-card p-6 space-y-4 md:col-span-2">
            <h2 className="text-sm font-semibold text-muted-foreground">Linked Inquiry</h2>
            <p className="text-sm">
              Source: {job.inquiry.source} | Status: {job.inquiry.status}
            </p>
            <Link href="/inquiries" className="text-xs text-primary hover:underline">
              View inquiry
            </Link>
          </div>
        )}
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this job?</DialogTitle>
            <DialogDescription>
              This cannot be undone. The job will be marked as cancelled.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelCancel}>
              Keep Job
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Yes, Cancel Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
