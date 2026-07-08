"use client";

import { Button, Input, Label } from "@syntaxure/ui";
import { format } from "date-fns";
import {
  BarChart3,
  Download,
  Package,
  TrendingDown,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  jobReport: {
    byStatus: { status: string; count: number }[];
    byType: { type: string; count: number }[];
    topCustomers: {
      id: string;
      displayName: string;
      jobCount: number;
      lastJobDate: string | null;
    }[];
    recentJobs: {
      id: string;
      type: string;
      status: string;
      scheduledAt: string;
      laborFee: number;
      customerName: string;
      technicians: string;
    }[];
  };
  revenueReport: {
    totalRevenue: number;
    totalProfit: number;
    transactionCount: number;
    paidCount: number;
    avgRevenue: number;
    transactions: {
      id: string;
      jobType: string;
      customerName: string;
      grossAmount: number;
      netProfit: number;
      paymentStatus: string;
      date: string;
    }[];
  };
  inventoryItems: {
    id: string;
    sku: string;
    name: string;
    unit: string;
    quantityOnHand: number;
    safetyStockThreshold: number;
    unitCost: number;
    stockValue: number;
    status: string;
    lineItemCount: number;
  }[];
  customerReport: {
    id: string;
    displayName: string;
    contactPhone: string | null;
    type: string;
    jobCount: number;
    completedJobs: number;
  }[];
  period: { from: string; to: string };
  activeTab: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtAmount(n: number) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-blue-500",
  IN_PROGRESS: "bg-amber-500",
  COMPLETED: "bg-emerald-500",
  CANCELLED: "bg-red-500",
};

const STOCK_STATUS: Record<string, string> = {
  OK: "bg-emerald-100 text-emerald-700",
  LOW: "bg-amber-100 text-amber-700",
  OUT: "bg-red-100 text-red-700",
};

// ── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  prevValue,
  color = "",
}: {
  label: string;
  value: string;
  prevValue?: number;
  currentRaw?: number;
  color?: string;
}) {
  const pct =
    prevValue !== undefined
      ? pctChange(Number.parseFloat(value.replace(/[^0-9.]/g, "")), prevValue)
      : null;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 tabular-nums ${color}`}>{value}</p>
      {pct !== null && (
        <p
          className={`text-xs mt-2 flex items-center gap-1 ${pct >= 0 ? "text-emerald-600" : "text-red-500"}`}
        >
          {pct >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(pct).toFixed(1)}% vs last month
        </p>
      )}
    </div>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────

function HorizontalBar({
  label,
  count,
  max,
  color,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-24 capitalize text-muted-foreground truncate">
        {label.replace(/_/g, " ").toLowerCase()}
      </span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: max ? `${(count / max) * 100}%` : "0%" }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums w-6 text-right">{count}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

const TABS = [
  { id: "jobs", label: "Jobs", icon: Wrench },
  { id: "revenue", label: "Revenue", icon: BarChart3 },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "customers", label: "Customers", icon: Users },
];

export function ReportsClient({
  jobReport,
  revenueReport,
  inventoryItems,
  customerReport,
  period,
  activeTab: initialTab,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState(initialTab);
  const [from, setFrom] = useState(period.from.slice(0, 10));
  const [to, setTo] = useState(period.to.slice(0, 10));

  // Search states per tab
  const [jobSearch, setJobSearch] = useState("");
  const [invSearch, setInvSearch] = useState("");
  const [invStatusFilter, setInvStatusFilter] = useState("ALL");
  const [custSearch, setCustSearch] = useState("");

  function applyDateFilter() {
    router.push(`/reports?from=${from}&to=${to}&tab=${tab}`);
  }

  function switchTab(id: string) {
    setTab(id);
    router.push(`/reports?from=${from}&to=${to}&tab=${id}`, { scroll: false });
  }

  // ── Filtered data ───────────────────────────────────────────────────────
  const filteredTopCustomers = useMemo(() => {
    if (!jobSearch.trim()) return jobReport.topCustomers;
    return jobReport.topCustomers.filter((c) =>
      c.displayName.toLowerCase().includes(jobSearch.toLowerCase())
    );
  }, [jobReport.topCustomers, jobSearch]);

  const filteredInventory = useMemo(() => {
    let items = inventoryItems;
    if (invStatusFilter !== "ALL") items = items.filter((i) => i.status === invStatusFilter);
    if (invSearch.trim())
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(invSearch.toLowerCase()) ||
          i.sku.toLowerCase().includes(invSearch.toLowerCase())
      );
    return items;
  }, [inventoryItems, invSearch, invStatusFilter]);

  const filteredCustomers = useMemo(() => {
    if (!custSearch.trim()) return customerReport;
    return customerReport.filter((c) =>
      c.displayName.toLowerCase().includes(custSearch.toLowerCase())
    );
  }, [customerReport, custSearch]);

  const totalJobCount = jobReport.byStatus.reduce((s, j) => s + j.count, 0);
  const maxJobByType = Math.max(...jobReport.byType.map((j) => j.count), 1);
  const totalStockValue = inventoryItems.reduce((s, i) => s + i.stockValue, 0);
  const lowStockCount = inventoryItems.filter(
    (i) => i.status === "LOW" || i.status === "OUT"
  ).length;

  // ── CSV Export helper ─────────────────────────────────────────────────────
  function exportCSV(rows: (string | number)[][], headers: string[], filename: string) {
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Operations analytics for {format(new Date(period.from), "MMM d")}–
            {format(new Date(period.to), "MMM d, yyyy")}
          </p>
        </div>
      </div>

      {/* ─── Filter Bar ─── */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-38"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-38" />
        </div>
        <Button size="sm" onClick={applyDateFilter} className="gap-2">
          Apply
        </Button>
      </div>

      {/* ─── Top KPI Strip ─── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Revenue (Period)"
          value={fmtAmount(revenueReport.totalRevenue)}
          color="text-emerald-600"
        />
        <KpiCard
          label="Net Profit (Period)"
          value={fmtAmount(revenueReport.totalProfit)}
          color="text-blue-600"
        />
        <KpiCard label="Total Jobs" value={String(totalJobCount)} />
        <KpiCard
          label="Low / Out of Stock Items"
          value={String(lowStockCount)}
          color={lowStockCount > 0 ? "text-red-600" : ""}
        />
      </div>

      {/* ─── Tab Navigation ─── */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => switchTab(id)}
            className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ─── Jobs Tab ─── */}
      {tab === "jobs" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* By Status */}
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Jobs by Status
              </h2>
              <div className="space-y-2.5">
                {jobReport.byStatus.map((j) => (
                  <HorizontalBar
                    key={j.status}
                    label={j.status}
                    count={j.count}
                    max={totalJobCount}
                    color={STATUS_COLORS[j.status] ?? "bg-muted-foreground"}
                  />
                ))}
              </div>
            </div>
            {/* By Type */}
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                Jobs by Type
              </h2>
              <div className="space-y-2.5">
                {jobReport.byType.map((j) => (
                  <HorizontalBar
                    key={j.type}
                    label={j.type}
                    count={j.count}
                    max={maxJobByType}
                    color="bg-blue-500"
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Top Customers */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-sm font-semibold">Top Customers by Job Count</h2>
              <div className="flex items-center gap-2">
                <Input
                  className="h-7 w-40 text-xs"
                  placeholder="Search..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() =>
                    exportCSV(
                      filteredTopCustomers.map((c) => [
                        c.displayName,
                        c.jobCount,
                        c.lastJobDate ?? "",
                      ]),
                      ["Customer", "Jobs", "Last Job Date"],
                      `top-customers-${from}-${to}.csv`
                    )
                  }
                >
                  <Download className="h-3 w-3" />
                  Export
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">
                      #
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">
                      Customer
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground text-xs">
                      Jobs
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground text-xs">
                      Last Job
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTopCustomers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-sm text-muted-foreground"
                      >
                        No customers found for this period.
                      </td>
                    </tr>
                  ) : (
                    filteredTopCustomers.map((c, i) => (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium">{c.displayName}</td>
                        <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                          {c.jobCount}
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                          {c.lastJobDate ? format(new Date(c.lastJobDate), "MMM d, yyyy") : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Revenue Tab ─── */}
      {tab === "revenue" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <KpiCard
              label="Gross Revenue"
              value={fmtAmount(revenueReport.totalRevenue)}
              color="text-emerald-600"
            />
            <KpiCard
              label="Net Profit"
              value={fmtAmount(revenueReport.totalProfit)}
              color="text-blue-600"
            />
            <KpiCard label="Avg Revenue / Job" value={fmtAmount(revenueReport.avgRevenue)} />
          </div>
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-sm font-semibold">Transactions</h2>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() =>
                  exportCSV(
                    revenueReport.transactions.map((t) => [
                      format(new Date(t.date), "yyyy-MM-dd"),
                      t.customerName,
                      t.jobType,
                      t.grossAmount,
                      t.netProfit,
                      t.paymentStatus,
                    ]),
                    [
                      "Date",
                      "Customer",
                      "Job Type",
                      "Gross Amount",
                      "Net Profit",
                      "Payment Status",
                    ],
                    `revenue-${from}-${to}.csv`
                  )
                }
              >
                <Download className="h-3 w-3" />
                Export CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">
                      Customer
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">
                      Type
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground text-xs">
                      Gross
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground text-xs">
                      Profit
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {revenueReport.transactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-sm text-muted-foreground"
                      >
                        No transactions for this period.
                      </td>
                    </tr>
                  ) : (
                    revenueReport.transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(t.date), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-2.5">{t.customerName || "—"}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground capitalize">
                          {t.jobType.replace(/_/g, " ").toLowerCase()}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-emerald-600 font-medium">
                          {fmtAmount(t.grossAmount)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-blue-600 font-medium">
                          {fmtAmount(t.netProfit)}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              t.paymentStatus === "PAID"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {t.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Inventory Tab ─── */}
      {tab === "inventory" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <KpiCard label="Total Items" value={String(inventoryItems.length)} />
            <KpiCard
              label="Low / Out of Stock"
              value={String(lowStockCount)}
              color={lowStockCount > 0 ? "text-red-600" : ""}
            />
            <KpiCard
              label="Total Stock Value"
              value={fmtAmount(totalStockValue)}
              color="text-blue-600"
            />
            <KpiCard
              label="Out of Stock"
              value={String(inventoryItems.filter((i) => i.status === "OUT").length)}
              color="text-red-600"
            />
          </div>
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-sm font-semibold">Inventory Items</h2>
              <div className="flex items-center gap-2">
                <Input
                  className="h-7 w-40 text-xs"
                  placeholder="Search SKU or name..."
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                />
                <select
                  value={invStatusFilter}
                  onChange={(e) => setInvStatusFilter(e.target.value)}
                  className="h-7 text-xs rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="ALL">All Status</option>
                  <option value="OK">OK</option>
                  <option value="LOW">Low Stock</option>
                  <option value="OUT">Out of Stock</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() =>
                    exportCSV(
                      filteredInventory.map((i) => [
                        i.sku,
                        i.name,
                        i.unit,
                        i.quantityOnHand,
                        i.safetyStockThreshold,
                        i.unitCost,
                        i.stockValue,
                        i.status,
                      ]),
                      [
                        "SKU",
                        "Name",
                        "Unit",
                        "Qty",
                        "Safety Stock",
                        "Unit Cost",
                        "Stock Value",
                        "Status",
                      ],
                      "inventory-report.csv"
                    )
                  }
                >
                  <Download className="h-3 w-3" />
                  Export
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">
                      SKU
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">
                      Name
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground text-xs">
                      Qty
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground text-xs">
                      Safety Stock
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground text-xs">
                      Unit Cost
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground text-xs">
                      Stock Value
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-muted-foreground"
                      >
                        No items match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                          {item.sku}
                        </td>
                        <td className="px-4 py-2.5 font-medium">{item.name}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {item.quantityOnHand}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                          {item.safetyStockThreshold}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono">
                          {fmtAmount(item.unitCost)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-medium">
                          {fmtAmount(item.stockValue)}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              STOCK_STATUS[item.status] ?? ""
                            }`}
                          >
                            {item.status === "OUT"
                              ? "Out of Stock"
                              : item.status === "LOW"
                                ? "Low Stock"
                                : "OK"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Customers Tab ─── */}
      {tab === "customers" && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-sm font-semibold">Customer Activity</h2>
              <div className="flex items-center gap-2">
                <Input
                  className="h-7 w-40 text-xs"
                  placeholder="Search..."
                  value={custSearch}
                  onChange={(e) => setCustSearch(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() =>
                    exportCSV(
                      filteredCustomers.map((c) => [
                        c.displayName,
                        c.type,
                        c.contactPhone ?? "",
                        c.jobCount,
                        c.completedJobs,
                      ]),
                      ["Customer", "Type", "Phone", "Total Jobs", "Completed"],
                      `customers-${from}-${to}.csv`
                    )
                  }
                >
                  <Download className="h-3 w-3" />
                  Export
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">
                      Customer
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">
                      Phone
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground text-xs">
                      Jobs
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground text-xs">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-muted-foreground"
                      >
                        No customers found.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-medium">{c.displayName}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground capitalize">
                          {c.type.replace(/_/g, " ").toLowerCase()}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">
                          {c.contactPhone ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                          {c.jobCount}
                        </td>
                        <td className="px-4 py-2.5 text-right text-emerald-600 font-medium tabular-nums">
                          {c.completedJobs}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
