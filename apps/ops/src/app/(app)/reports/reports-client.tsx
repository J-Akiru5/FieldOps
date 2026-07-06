import { BarChart3 } from "lucide-react";

interface Props {
  jobsByStatus: { status: string; count: number }[];
  totalInquiries: number;
  totalRevenue: number;
  totalProfit: number;
  lowStockItems: number;
}

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-500",
  IN_PROGRESS: "bg-amber-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

export function ReportsClient({
  jobsByStatus,
  totalInquiries,
  totalRevenue,
  totalProfit,
  lowStockItems,
}: Props) {
  const totalJobs = jobsByStatus.reduce((s, j) => s + j.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Operations overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs text-muted-foreground">Total Jobs</p>
          <p className="text-2xl font-bold">{totalJobs}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs text-muted-foreground">Total Inquiries</p>
          <p className="text-2xl font-bold">{totalInquiries}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs text-muted-foreground">Revenue (Paid)</p>
          <p className="text-2xl font-bold">₱{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs text-muted-foreground">Net Profit</p>
          <p className="text-2xl font-bold">₱{totalProfit.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Jobs by Status
          </h2>
          <div className="space-y-3">
            {jobsByStatus.map((j) => (
              <div key={j.status} className="flex items-center gap-3">
                <span className="text-sm w-24 capitalize">
                  {j.status.replace("_", " ").toLowerCase()}
                </span>
                <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${statusColors[j.status] ?? "bg-muted-foreground"}`}
                    style={{ width: totalJobs ? `${(j.count / totalJobs) * 100}%` : "0%" }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">{j.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">Alerts</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Low-stock items</span>
              <span
                className={`font-bold ${lowStockItems > 0 ? "text-destructive" : "text-green-500"}`}
              >
                {lowStockItems}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
