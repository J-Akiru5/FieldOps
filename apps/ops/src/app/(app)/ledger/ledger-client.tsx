"use client";

import {
  createLedgerEntryAction,
  updateLedgerEntryAction,
  voidLedgerEntryAction,
} from "@/app/actions/ledger";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@syntaxure/ui";
import { endOfMonth, format, startOfMonth } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Grid3X3,
  List,
  MoreVertical,
  Plus,
  RotateCw,
  Search,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// ── Interfaces ──────────────────────────────────────────────

interface SerializedEntry {
  id: string;
  date: string;
  particulars: string;
  category: "INCOME" | "OPERATING_EXPENSE" | "PARTNER_DRAW";
  amount: number;
  remarks: string | null;
  isVoided: boolean;
  voidedAt: string | null;
  voidedBy: string | null;
  voidedReason: string | null;
  partnerId: string | null;
  partnerName: string | null;
  jobId: string | null;
  jobLabel: string | null;
  createdAt: string;
}

interface SerializedPartner {
  id: string;
  name: string;
}

interface SerializedJob {
  id: string;
  label: string;
}

interface SerializedSummary {
  dateRange: { from: string; to: string };
  totalIncome: number;
  totalOperatingExpense: number;
  netOperatingProfit: number;
  profitSharePerPartner: number;
  partnerBalances: {
    partnerId: string;
    partnerName: string;
    profitShare: number;
    draws: number;
    netEntitlement: number;
  }[];
}

interface SerializedRecentActivity {
  id: string;
  particulars: string;
  category: string;
  amount: number;
  createdAt: string;
  partnerName: string | null;
  jobLabel: string | null;
}

interface Props {
  initialEntries: SerializedEntry[];
  initialSummary: SerializedSummary;
  previousSummary: {
    totalIncome: number;
    totalOperatingExpense: number;
    netOperatingProfit: number;
    profitSharePerPartner: number;
  };
  partners: SerializedPartner[];
  jobs: SerializedJob[];
  recentActivity: SerializedRecentActivity[];
}

// ── Constants ───────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  INCOME: "Income",
  OPERATING_EXPENSE: "Oper. Expense",
  PARTNER_DRAW: "Partner Draw",
};

const CATEGORY_COLORS: Record<string, string> = {
  INCOME: "text-emerald-600",
  OPERATING_EXPENSE: "text-amber-600",
  PARTNER_DRAW: "text-purple-600",
};

const CATEGORY_BG: Record<string, string> = {
  INCOME: "bg-emerald-50 text-emerald-700",
  OPERATING_EXPENSE: "bg-amber-50 text-amber-700",
  PARTNER_DRAW: "bg-purple-50 text-purple-700",
};

const CATEGORY_PILL: Record<string, string> = {
  INCOME: "bg-emerald-100 text-emerald-700 border-emerald-200",
  OPERATING_EXPENSE: "bg-amber-100 text-amber-700 border-amber-200",
  PARTNER_DRAW: "bg-purple-100 text-purple-700 border-purple-200",
};

const CATEGORY_ICON: Record<string, string> = {
  INCOME: "↑",
  OPERATING_EXPENSE: "↓",
  PARTNER_DRAW: "👤",
};

const TYPE_PILL_ACTIVE: Record<string, string> = {
  INCOME: "bg-emerald-600 text-white border-emerald-600",
  OPERATING_EXPENSE: "bg-amber-600 text-white border-amber-600",
  PARTNER_DRAW: "bg-purple-600 text-white border-purple-600",
};

const DONUT_COLORS: Record<string, string> = {
  INCOME: "#10b981",
  OPERATING_EXPENSE: "#f59e0b",
  PARTNER_DRAW: "#8b5cf6",
};

const PAGE_SIZE = 10;

// ── Helpers ─────────────────────────────────────────────────

function fmtAmount(n: number): string {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy");
}

function fmtDateTime(iso: string): string {
  return format(new Date(iso), "MMM d, h:mm a");
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

// ── Sub-Components ──────────────────────────────────────────

function KpiCard({
  label,
  value,
  prev,
  color,
}: {
  label: string;
  value: number;
  prev: number;
  color: string;
}) {
  const pct = pctChange(value, prev);
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{fmtAmount(value)}</p>
      {pct !== null && (
        <p
          className={`text-xs mt-2 flex items-center gap-1 ${
            pct >= 0 ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {pct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(pct).toFixed(1)}% vs last month
        </p>
      )}
    </div>
  );
}

function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center w-32 h-32 text-muted-foreground text-xs">
        No data
      </div>
    );
  }
  const R = 40;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-32 h-32 shrink-0"
      role="img"
      aria-label="Cash summary chart"
    >
      {segments.map((seg) => {
        const dash = (seg.value / total) * C;
        const el = (
          <circle
            key={seg.label}
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke={seg.color}
            strokeWidth="16"
            strokeDasharray={`${dash} ${C - dash}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 50 50)"
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

function CategoryBar({
  label,
  amount,
  color,
  maxAmount,
}: {
  label: string;
  amount: number;
  color: string;
  maxAmount: number;
}) {
  const pct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">{fmtAmount(amount)}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────

export function LedgerClient({
  initialEntries,
  initialSummary,
  previousSummary,
  partners,
  jobs,
  recentActivity,
}: Props) {
  const router = useRouter();
  const now = new Date();

  // ── Date range (server-navigated) ──
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(now), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(endOfMonth(now), "yyyy-MM-dd"));

  // ── Client-side filters ──
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [partnerJobFilter, setPartnerJobFilter] = useState<string>("ALL");

  // ── Entries state ──
  const [entries, _setEntries] = useState(initialEntries);
  const [summary, _setSummary] = useState(initialSummary);
  const [showVoided, setShowVoided] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Pagination ──
  const [page, setPage] = useState(1);

  // ── Slide-in panel ──
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"create" | "edit">("create");
  const [editTarget, setEditTarget] = useState<SerializedEntry | null>(null);
  const [formPending, setFormPending] = useState(false);
  const [formCategory, setFormCategory] = useState<string>("INCOME");
  const [formPartnerId, setFormPartnerId] = useState<string>("");
  const [formJobId, setFormJobId] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  // ── Void dialog ──
  const [voidTarget, setVoidTarget] = useState<SerializedEntry | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidPending, setVoidPending] = useState(false);

  // ── Kebab menu ──
  const [kebabOpen, setKebabOpen] = useState<string | null>(null);

  // ── View mode ──
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // ── Client-side filtered entries ──
  const filteredEntries = useMemo(() => {
    let result = showVoided ? entries : entries.filter((e) => !e.isVoided);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.particulars.toLowerCase().includes(q) ||
          e.remarks?.toLowerCase().includes(q) ||
          e.partnerName?.toLowerCase().includes(q) ||
          e.jobLabel?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "ALL") {
      result = result.filter((e) => e.category === categoryFilter);
    }
    if (typeFilter !== "ALL") {
      result = result.filter((e) => e.category === typeFilter);
    }
    if (partnerJobFilter !== "ALL") {
      result = result.filter(
        (e) => e.partnerId === partnerJobFilter || e.jobId === partnerJobFilter
      );
    }
    return result;
  }, [entries, showVoided, searchQuery, categoryFilter, typeFilter, partnerJobFilter]);

  // ── Pagination derived ──
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const paginatedEntries = filteredEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  const resetPage = () => setPage(1);

  // ── Top categories (client-computed) ──
  const topCategories = useMemo(() => {
    const map = new Map<string, { label: string; amount: number; color: string; bg: string }>();
    for (const e of filteredEntries) {
      if (e.isVoided) continue;
      const key = e.category;
      const existing = map.get(key) ?? {
        label: CATEGORY_LABELS[key],
        amount: 0,
        color: CATEGORY_COLORS[key],
        bg: CATEGORY_BG[key],
      };
      existing.amount += e.amount;
      map.set(key, existing);
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [filteredEntries]);

  const maxCategoryAmount = topCategories.length > 0 ? topCategories[0].amount : 0;

  // ── Donut segments ──
  const donutSegments = useMemo(
    () =>
      [
        { value: summary.totalIncome, color: DONUT_COLORS.INCOME, label: "Income" },
        {
          value: summary.totalOperatingExpense,
          color: DONUT_COLORS.OPERATING_EXPENSE,
          label: "Expenses",
        },
        {
          value: summary.partnerBalances.reduce((s, b) => s + b.draws, 0),
          color: DONUT_COLORS.PARTNER_DRAW,
          label: "Partner Draw",
        },
      ].filter((s) => s.value > 0),
    [summary]
  );

  const donutTotal = donutSegments.reduce((s, x) => s + x.value, 0);

  // ── Handlers ──

  async function applyDateFilter() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from: dateFrom, to: dateTo });
      router.push(`/ledger?${params.toString()}`);
    } finally {
      setLoading(false);
    }
  }

  function openCreatePanel() {
    setPanelMode("create");
    setEditTarget(null);
    setFormCategory("INCOME");
    setFormPartnerId("");
    setFormJobId("");
    setPanelOpen(true);
  }

  function openEditPanel(entry: SerializedEntry) {
    setPanelMode("edit");
    setEditTarget(entry);
    setFormCategory(entry.category);
    setFormPartnerId(entry.partnerId ?? "");
    setFormJobId(entry.jobId ?? "");
    setPanelOpen(true);
    setKebabOpen(null);
  }

  function closePanel() {
    setPanelOpen(false);
    setEditTarget(null);
    setFormCategory("INCOME");
    setFormPartnerId("");
    setFormJobId("");
  }

  async function handlePanelSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormPending(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const category = formCategory as "INCOME" | "OPERATING_EXPENSE" | "PARTNER_DRAW";

    try {
      if (panelMode === "edit" && editTarget) {
        const result = await updateLedgerEntryAction(editTarget.id, {
          date: new Date(data.get("date") as string),
          particulars: data.get("particulars") as string,
          category,
          amount: Number(data.get("amount")),
          remarks: (data.get("remarks") as string) || undefined,
          partnerId: category === "PARTNER_DRAW" ? formPartnerId : undefined,
          jobId: formJobId || undefined,
        });
        if (result.success) {
          toast.success("Entry updated.");
          closePanel();
          router.refresh();
        } else {
          toast.error(result.error ?? "Failed to update entry.");
        }
      } else {
        const result = await createLedgerEntryAction({
          date: new Date(data.get("date") as string),
          particulars: data.get("particulars") as string,
          category,
          amount: Number(data.get("amount")),
          remarks: (data.get("remarks") as string) || undefined,
          partnerId: category === "PARTNER_DRAW" ? formPartnerId : undefined,
          jobId: formJobId || undefined,
        });
        if (result.success) {
          toast.success("Entry created.");
          closePanel();
          router.refresh();
        } else {
          toast.error(result.error ?? "Failed to create entry.");
        }
      }
    } finally {
      setFormPending(false);
    }
  }

  async function handleVoid() {
    if (!voidTarget || !voidReason.trim()) return;
    setVoidPending(true);
    try {
      const result = await voidLedgerEntryAction(voidTarget.id, voidReason.trim());
      if (result.success) {
        toast.success("Entry voided.");
        setVoidTarget(null);
        setVoidReason("");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to void entry.");
      }
    } finally {
      setVoidPending(false);
    }
  }

  async function handleExportXLSX() {
    try {
      const XLSX = await import("xlsx");
      const rows = filteredEntries.map((e) => ({
        Date: fmtDate(e.date),
        Particulars: e.particulars,
        Category: CATEGORY_LABELS[e.category],
        Amount: e.amount,
        "Partner / Job": e.partnerName ?? e.jobLabel ?? "",
        Remarks: e.remarks ?? "",
        Status: e.isVoided ? "VOIDED" : "ACTIVE",
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ledger");
      XLSX.writeFile(wb, `ledger-${dateFrom}-to-${dateTo}.xlsx`);
      toast.success("Excel ledger exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export Excel file.");
    }
  }

  async function handleExportPDF() {
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(14);
      doc.text("Sales & Expense Ledger", 14, 15);
      doc.setFontSize(10);
      doc.text(`Period: ${fmtDate(dateFrom)} – ${fmtDate(dateTo)}`, 14, 22);
      autoTable(doc, {
        startY: 28,
        head: [["Date", "Particulars", "Category", "Amount", "Partner / Job", "Remarks", "Status"]],
        body: filteredEntries.map((e) => [
          fmtDate(e.date),
          e.particulars,
          CATEGORY_LABELS[e.category],
          fmtAmount(e.amount),
          e.partnerName ?? e.jobLabel ?? "—",
          e.remarks ?? "",
          e.isVoided ? "VOIDED" : "ACTIVE",
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 41, 59] },
      });
      doc.save(`ledger-${dateFrom}-to-${dateTo}.pdf`);
      toast.success("PDF ledger exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PDF file.");
    }
  }

  const jobIncomeSelected = !!(formJobId && formCategory === "INCOME");

  // ── Render ──
  return (
    <div className="space-y-6">
      {/* ── Zone A: Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales &amp; Expense Ledger</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cash-book entries for income, operating expenses, and partner draws.
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={openCreatePanel}>
          <Plus className="h-4 w-4" />
          New Entry
        </Button>
      </div>

      {/* ── Zone B: Filter Bar ── */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Particulars, remarks…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                resetPage();
              }}
              className="w-52 pl-9"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={applyDateFilter}
          disabled={loading}
        >
          <Filter className="h-4 w-4" />
          {loading ? "Loading…" : "Apply"}
        </Button>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(v);
              resetPage();
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="OPERATING_EXPENSE">Operating Expense</SelectItem>
              <SelectItem value="PARTNER_DRAW">Partner Draw</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Type</Label>
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v);
              resetPage();
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="OPERATING_EXPENSE">Expense</SelectItem>
              <SelectItem value="PARTNER_DRAW">Partner Draw</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Partner / Job</Label>
          <Select
            value={partnerJobFilter}
            onValueChange={(v) => {
              setPartnerJobFilter(v);
              resetPage();
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {partners.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
              {jobs.map((j) => (
                <SelectItem key={j.id} value={j.id}>
                  {j.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setCategoryFilter("ALL");
              setTypeFilter("ALL");
              setPartnerJobFilter("ALL");
              resetPage();
            }}
          >
            Reset
          </Button>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showVoided}
              onChange={(e) => {
                setShowVoided(e.target.checked);
                resetPage();
              }}
              className="h-4 w-4 rounded border-gray-300"
            />
            Show voided
          </label>
        </div>
      </div>

      {/* ── Zone C: KPI Summary Strip ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Income"
          value={summary.totalIncome}
          prev={previousSummary.totalIncome}
          color="text-emerald-600"
        />
        <KpiCard
          label="Operating Expenses"
          value={summary.totalOperatingExpense}
          prev={previousSummary.totalOperatingExpense}
          color="text-amber-600"
        />
        <KpiCard
          label="Net Operating Profit"
          value={summary.netOperatingProfit}
          prev={previousSummary.netOperatingProfit}
          color="text-foreground"
        />
        <KpiCard
          label="50/50 Profit Share (each)"
          value={summary.profitSharePerPartner}
          prev={previousSummary.profitSharePerPartner}
          color="text-blue-600"
        />
      </div>

      {/* ── Zone D: Two-Column Body ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* ── Left: Ledger Entries Table ── */}
        <div className="rounded-xl border bg-card">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">Ledger Entries</h2>
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-2 text-xs font-medium text-muted-foreground">
                {filteredEntries.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 ml-2 text-xs"
                onClick={handleExportXLSX}
              >
                <Download className="h-3.5 w-3.5" />
                XLSX
              </Button>
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={handleExportPDF}>
                <Download className="h-3.5 w-3.5" />
                PDF
              </Button>
            </div>
          </div>

          {/* Table View */}
          {viewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      <button
                        type="button"
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        Date <ChevronDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Particulars
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Partner / Job
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedEntries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                        <BookOpen className="mx-auto h-8 w-8 mb-2 opacity-30" />
                        No ledger entries for this period.
                      </td>
                    </tr>
                  ) : (
                    paginatedEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        className={entry.isVoided ? "opacity-50 bg-red-50/30" : ""}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                          {fmtDate(entry.date)}
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <div className="truncate font-medium">{entry.particulars}</div>
                          {entry.remarks && (
                            <div className="text-xs text-muted-foreground truncate mt-0.5">
                              {entry.remarks}
                            </div>
                          )}
                          {entry.isVoided && entry.voidedReason && (
                            <div className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                              <TriangleAlert className="h-3 w-3" />
                              Voided: {entry.voidedReason}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${CATEGORY_PILL[entry.category]}`}
                          >
                            {CATEGORY_LABELS[entry.category]}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${CATEGORY_COLORS[entry.category]}`}
                          >
                            {entry.category === "INCOME" && <ArrowUp className="h-3 w-3" />}
                            {entry.category === "OPERATING_EXPENSE" && (
                              <ArrowDown className="h-3 w-3" />
                            )}
                            {entry.category === "PARTNER_DRAW" && (
                              <span className="text-sm">👤</span>
                            )}
                            {entry.category === "INCOME"
                              ? "Income"
                              : entry.category === "OPERATING_EXPENSE"
                                ? "Expense"
                                : "Draw"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground max-w-[160px] truncate">
                          {entry.partnerName ?? entry.jobLabel ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap font-mono">
                          {fmtAmount(entry.amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setKebabOpen(kebabOpen === entry.id ? null : entry.id)}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                            {kebabOpen === entry.id && (
                              <>
                                <button
                                  type="button"
                                  className="fixed inset-0 z-40"
                                  onClick={() => setKebabOpen(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Escape") setKebabOpen(null);
                                  }}
                                />
                                <div className="absolute right-0 top-full mt-1 z-50 w-32 rounded-md border bg-popover shadow-md">
                                  <button
                                    type="button"
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground rounded-t-md"
                                    onClick={() => openEditPanel(entry)}
                                  >
                                    Edit
                                  </button>
                                  {!entry.isVoided && (
                                    <button
                                      type="button"
                                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-b-md"
                                      onClick={() => {
                                        setVoidTarget(entry);
                                        setKebabOpen(null);
                                      }}
                                    >
                                      Void
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              {paginatedEntries.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-muted-foreground">
                  <BookOpen className="mx-auto h-8 w-8 mb-2 opacity-30" />
                  No ledger entries for this period.
                </div>
              ) : (
                paginatedEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`rounded-lg border p-4 space-y-2 ${
                      entry.isVoided ? "opacity-50 bg-red-50/30" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${CATEGORY_PILL[entry.category]}`}
                      >
                        {CATEGORY_LABELS[entry.category]}
                      </span>
                      <span className="text-xs text-muted-foreground">{fmtDate(entry.date)}</span>
                    </div>
                    <p className="font-medium text-sm truncate">{entry.particulars}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold">
                        {fmtAmount(entry.amount)}
                      </span>
                      {entry.partnerName && (
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {entry.partnerName}
                        </span>
                      )}
                    </div>
                    {entry.isVoided && entry.voidedReason && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <TriangleAlert className="h-3 w-3" />
                        {entry.voidedReason}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages} ({filteredEntries.length} entries)
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page + i - 2;
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "secondary" : "ghost"}
                      size="icon"
                      className="h-8 w-8 text-xs"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Analytics Sidebar ── */}
        <div className="space-y-4">
          {/* Cash Summary (Donut) */}
          <div className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Cash Summary (This Period)</h3>
            <div className="flex items-center gap-4">
              <DonutChart segments={donutSegments} />
              <div className="flex-1 space-y-2">
                {donutSegments.map((seg) => (
                  <div key={seg.label} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="text-xs text-foreground">{seg.label}</span>
                    <span className="text-xs font-mono text-muted-foreground ml-auto">
                      {donutTotal > 0 ? `${((seg.value / donutTotal) * 100).toFixed(1)}%` : "0%"}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Total</span>
                    <span className="font-mono font-semibold">{fmtAmount(donutTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
            <a
              href="/reports"
              className="flex items-center text-xs text-primary font-medium hover:underline mt-3"
            >
              View full report <ChevronRight className="h-3 w-3 ml-1" />
            </a>
          </div>

          {/* Top Categories */}
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Top Categories</h3>
              <span className="text-xs text-muted-foreground">By amount</span>
            </div>
            {topCategories.length === 0 ? (
              <p className="text-xs text-muted-foreground">No data for this period.</p>
            ) : (
              <div className="space-y-3">
                {topCategories.map((cat) => (
                  <CategoryBar
                    key={cat.label}
                    label={cat.label}
                    amount={cat.amount}
                    color={cat.color.replace("text-", "bg-")}
                    maxAmount={maxCategoryAmount}
                  />
                ))}
              </div>
            )}
            <a
              href="/reports"
              className="flex items-center text-xs text-primary font-medium hover:underline mt-3"
            >
              View all categories <ChevronRight className="h-3 w-3 ml-1" />
            </a>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <p className="text-xs text-muted-foreground">No recent entries.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-start gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${CATEGORY_BG[a.category] ?? "bg-muted"}`}
                    >
                      {CATEGORY_ICON[a.category] ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{a.particulars}</p>
                      <p className="text-xs text-muted-foreground">
                        {fmtAmount(a.amount)} · {fmtDateTime(a.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <a
              href="/ledger"
              className="flex items-center text-xs text-primary font-medium hover:underline mt-3"
            >
              View all activity <ChevronRight className="h-3 w-3 ml-1" />
            </a>
          </div>

          {/* Partner Balances */}
          {summary.partnerBalances.length > 0 && (
            <div className="rounded-xl border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Partner Balances</h3>
              <div className="space-y-4">
                {summary.partnerBalances.map((pb) => (
                  <div key={pb.partnerId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{pb.partnerName}</span>
                      <span
                        className={`text-sm font-bold ${
                          pb.netEntitlement >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {fmtAmount(pb.netEntitlement)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Share: {fmtAmount(pb.profitShare)}</span>
                      <span className="text-purple-600">Draws: −{fmtAmount(pb.draws)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Zone E: Slide-In Panel ── */}
      {panelOpen && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/40 transition-opacity"
          onClick={(e) => {
            if (e.target === e.currentTarget) closePanel();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") closePanel();
          }}
        >
          <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-background border-l shadow-2xl flex flex-col animate-in slide-in-from-right">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">
                {panelMode === "edit" ? "Edit Ledger Entry" : "New Ledger Entry"}
              </h2>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closePanel}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Panel Form */}
            <form
              ref={formRef}
              onSubmit={handlePanelSubmit}
              className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
            >
              {/* Date */}
              <div className="space-y-1.5">
                <Label htmlFor="panel-date">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="panel-date"
                  name="date"
                  type="date"
                  required
                  defaultValue={
                    editTarget
                      ? format(new Date(editTarget.date), "yyyy-MM-dd")
                      : format(now, "yyyy-MM-dd")
                  }
                />
              </div>

              {/* Type — pill toggle */}
              <div className="space-y-1.5">
                <Label>
                  Type <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  {(["INCOME", "OPERATING_EXPENSE", "PARTNER_DRAW"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormCategory(cat)}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium border transition-colors ${
                        formCategory === cat
                          ? TYPE_PILL_ACTIVE[cat]
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {CATEGORY_ICON[cat]} {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Particulars */}
              <div className="space-y-1.5">
                <Label htmlFor="panel-particulars">
                  Particulars <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="panel-particulars"
                  name="particulars"
                  required
                  rows={3}
                  placeholder="e.g. Gasoline for service vehicle"
                  defaultValue={editTarget?.particulars ?? ""}
                />
              </div>

              {/* Category (secondary, for completeness) */}
              <div className="space-y-1.5">
                <Label htmlFor="panel-category">Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger id="panel-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="OPERATING_EXPENSE">Operating Expense</SelectItem>
                    <SelectItem value="PARTNER_DRAW">Partner Draw</SelectItem>
                  </SelectContent>
                </Select>
                {!!formJobId && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TriangleAlert className="h-3 w-3" />
                    Job revenue is tracked via SalesTransaction. Use this entry for job-related
                    costs only (Operating Expense).
                  </p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <Label htmlFor="panel-amount">
                  Amount (PHP) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ₱
                  </span>
                  <Input
                    id="panel-amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    className="pl-8"
                    placeholder="0.00"
                    defaultValue={editTarget?.amount ?? ""}
                  />
                </div>
              </div>

              {/* Partner (conditional) */}
              {formCategory === "PARTNER_DRAW" && (
                <div className="space-y-1.5">
                  <Label htmlFor="panel-partnerId">
                    Partner <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formPartnerId} onValueChange={setFormPartnerId}>
                    <SelectTrigger id="panel-partnerId">
                      <SelectValue placeholder="Select partner…" />
                    </SelectTrigger>
                    <SelectContent>
                      {partners.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Partner / Job (optional) */}
              <div className="space-y-1.5">
                <Label htmlFor="panel-jobId">Partner / Job (optional)</Label>
                <Select value={formJobId} onValueChange={setFormJobId}>
                  <SelectTrigger id="panel-jobId">
                    <SelectValue placeholder="None — general entry" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((j) => (
                      <SelectItem key={j.id} value={j.id}>
                        {j.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Remarks */}
              <div className="space-y-1.5">
                <Label htmlFor="panel-remarks">Remarks (optional)</Label>
                <Textarea
                  id="panel-remarks"
                  name="remarks"
                  rows={2}
                  placeholder="Audit notes…"
                  defaultValue={editTarget?.remarks ?? ""}
                />
              </div>

              {jobIncomeSelected && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <TriangleAlert className="h-4 w-4" />
                  Job-linked entries cannot have category INCOME. Job revenue is tracked through
                  SalesTransaction.
                </p>
              )}
            </form>

            {/* Panel Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t">
              <Button variant="ghost" type="button" onClick={closePanel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formPending || jobIncomeSelected}
                onClick={() => formRef.current?.requestSubmit()}
              >
                {formPending ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : panelMode === "edit" ? (
                  "Save Changes"
                ) : (
                  "Save Entry"
                )}
              </Button>
            </div>
          </div>
        </button>
      )}

      {/* ── Void Confirmation Dialog ── */}
      {voidTarget && (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setVoidTarget(null);
              setVoidReason("");
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setVoidTarget(null);
              setVoidReason("");
            }
          }}
        >
          <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-2xl mx-4">
            <h2 className="text-lg font-semibold mb-1">Void this entry?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Voiding flags this entry as cancelled. It will be excluded from all calculations but
              preserved for audit. This cannot be undone.
            </p>
            <div className="rounded-md bg-muted p-3 text-sm space-y-1 mb-4">
              <p className="font-medium">{voidTarget.particulars}</p>
              <p className="text-muted-foreground">
                {CATEGORY_LABELS[voidTarget.category]} · {fmtAmount(voidTarget.amount)} ·{" "}
                {fmtDate(voidTarget.date)}
              </p>
            </div>
            <div className="space-y-1.5 mb-4">
              <Label htmlFor="voidReason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Input
                id="voidReason"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="e.g. Duplicate entry, incorrect amount"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setVoidTarget(null);
                  setVoidReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleVoid}
                disabled={voidPending || !voidReason.trim()}
              >
                {voidPending ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Voiding…
                  </>
                ) : (
                  "Confirm Void"
                )}
              </Button>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
