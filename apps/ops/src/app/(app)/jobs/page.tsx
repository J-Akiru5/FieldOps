import { Wrench } from "lucide-react";

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track service jobs, repairs, and installations
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
          <Wrench className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No jobs yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Jobs created from inquiries or directly will appear here.
        </p>
      </div>
    </div>
  );
}
