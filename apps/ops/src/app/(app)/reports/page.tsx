import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Insights and analytics for your operations
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
          <BarChart3 className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Reports coming soon</p>
        <p className="text-xs text-muted-foreground mt-1">
          Revenue, job analytics, and export will be available here.
        </p>
      </div>
    </div>
  );
}
