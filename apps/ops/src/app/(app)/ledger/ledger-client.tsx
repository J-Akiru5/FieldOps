"use client";

import { createLedgerEntryAction, voidLedgerEntryAction } from "@/app/actions/ledger";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@syntaxure/ui";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { BookOpen, Filter, Plus, RotateCw, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

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

interface Props {
  initialEntries: SerializedEntry[];
  initialSummary: SerializedSummary;
  partners: SerializedPartner[];
  jobs: SerializedJob[];
}

const CATEGORY_LABELS: Record<string, string> = {
  INCOME: "Income",
  OPERATING_EXPENSE: "Operating Expense",
  PARTNER_DRAW: "Partner Draw",
};

const CATEGORY_COLORS: Record<string, string> = {
  INCOME: "text-emerald-600",
  OPERATING_EXPENSE: "text-amber-600",
  PARTNER_DRAW: "text-purple-600",
};

function fmtAmount(n: number): string {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy");
}

export function LedgerClient({ initialEntries, initialSummary, partners, jobs }: Props) {
  const router = useRouter();

  const now = new Date();
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(now), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(endOfMonth(now), "yyyy-MM-dd"));
  const [entries, _setEntries] = useState(initialEntries);
  const [summary, _setSummary] = useState(initialSummary);
  const [showVoided, setShowVoided] = useState(false);
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createPending, setCreatePending] = useState(false);
  const [createCategory, setCreateCategory] = useState<string>("INCOME");
  const [createPartnerId, setCreatePartnerId] = useState<string>("");
  const [createJobId, setCreateJobId] = useState<string>("");

  const [voidTarget, setVoidTarget] = useState<SerializedEntry | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidPending, setVoidPending] = useState(false);

  async function applyFilter() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from: dateFrom, to: dateTo });
      if (showVoided) params.set("showVoided", "1");
      const url = `/ledger?${params.toString()}`;
      router.push(url);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  const visibleEntries = showVoided ? entries : entries.filter((e) => !e.isVoided);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreatePending(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    const category = createCategory as "INCOME" | "OPERATING_EXPENSE" | "PARTNER_DRAW";

    try {
      const result = await createLedgerEntryAction({
        date: new Date(data.get("date") as string),
        particulars: data.get("particulars") as string,
        category,
        amount: Number(data.get("amount")),
        remarks: (data.get("remarks") as string) || undefined,
        partnerId: category === "PARTNER_DRAW" ? createPartnerId : undefined,
        jobId: createJobId || undefined,
      });

      if (result.success) {
        toast.success("Ledger entry created.");
        setCreateOpen(false);
        form.reset();
        setCreateCategory("INCOME");
        setCreatePartnerId("");
        setCreateJobId("");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to create entry.");
      }
    } finally {
      setCreatePending(false);
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

  const jobIncomeSelected = !!(createJobId && createCategory === "INCOME");

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales &amp; Expense Ledger</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cash-book entries for income, operating expenses, and partner draws.
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Entry
        </Button>
      </div>

      {/* ─── Date range filter ─── */}
      <div className="flex flex-wrap items-end gap-3">
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
          onClick={applyFilter}
          disabled={loading}
        >
          <Filter className="h-4 w-4" />
          {loading ? "Loading…" : "Apply"}
        </Button>
        <label className="flex items-center gap-2 text-sm cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={showVoided}
            onChange={(e) => {
              setShowVoided(e.target.checked);
              applyFilter();
            }}
            className="h-4 w-4 rounded border-gray-300"
          />
          Show voided entries
        </label>
      </div>

      {/* ─── Equity Summary Cards ─── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-normal text-muted-foreground">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-emerald-600">{fmtAmount(summary.totalIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-normal text-muted-foreground">
              Operating Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-amber-600">
              {fmtAmount(summary.totalOperatingExpense)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-normal text-muted-foreground">
              Net Operating Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{fmtAmount(summary.netOperatingProfit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-normal text-muted-foreground">
              50/50 Profit Share (each)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-blue-600">
              {fmtAmount(summary.profitSharePerPartner)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Partner Balance Cards ─── */}
      {summary.partnerBalances.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {summary.partnerBalances.map((pb) => (
            <Card key={pb.partnerId}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{pb.partnerName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profit Share</span>
                  <span className="font-medium">{fmtAmount(pb.profitShare)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Draws</span>
                  <span className="font-medium text-purple-600">- {fmtAmount(pb.draws)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Net Entitlement</span>
                  <span
                    className={`font-bold ${
                      pb.netEntitlement >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {fmtAmount(pb.netEntitlement)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ─── Entry Table ─── */}
      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Particulars
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Partner / Job
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visibleEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <BookOpen className="mx-auto h-8 w-8 mb-2 opacity-30" />
                    No ledger entries for this period.
                  </td>
                </tr>
              ) : (
                visibleEntries.map((entry) => (
                  <tr key={entry.id} className={entry.isVoided ? "opacity-50 bg-red-50/30" : ""}>
                    <td className="px-4 py-3 whitespace-nowrap">{fmtDate(entry.date)}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="truncate">{entry.particulars}</div>
                      {entry.remarks && (
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {entry.remarks}
                        </div>
                      )}
                      {entry.isVoided && entry.voidedReason && (
                        <div className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                          <TriangleAlert className="h-3 w-3" />
                          Voided: {entry.voidedReason}
                          {entry.voidedAt && ` — ${fmtDate(entry.voidedAt)}`}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={CATEGORY_COLORS[entry.category]}>
                        {CATEGORY_LABELS[entry.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap font-mono">
                      {fmtAmount(entry.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs">
                      {entry.partnerName ?? entry.jobLabel ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!entry.isVoided && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-red-500"
                          onClick={() => setVoidTarget(entry)}
                        >
                          Void
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Create Entry Dialog ─── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>New Ledger Entry</DialogTitle>
            <DialogDescription>
              Record a cash-book transaction. Amount must be positive.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={format(now, "yyyy-MM-dd")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="particulars">Particulars</Label>
              <Input
                id="particulars"
                name="particulars"
                required
                placeholder="e.g. Gasoline for service vehicle"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select value={createCategory} onValueChange={setCreateCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME" disabled={!!createJobId}>
                    Income
                  </SelectItem>
                  <SelectItem value="OPERATING_EXPENSE">Operating Expense</SelectItem>
                  <SelectItem value="PARTNER_DRAW">Partner Draw</SelectItem>
                </SelectContent>
              </Select>
              {!!createJobId && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TriangleAlert className="h-3 w-3" />
                  Job revenue is tracked automatically via SalesTransaction. Use this entry for
                  job-related costs only (Operating Expense).
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (PHP)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
              />
            </div>
            {createCategory === "PARTNER_DRAW" && (
              <div className="space-y-1.5">
                <Label htmlFor="partnerId">Partner</Label>
                <Select value={createPartnerId} onValueChange={setCreatePartnerId}>
                  <SelectTrigger id="partnerId">
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
            <div className="space-y-1.5">
              <Label htmlFor="jobId">Job (optional)</Label>
              <Select value={createJobId} onValueChange={setCreateJobId}>
                <SelectTrigger id="jobId">
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
            <div className="space-y-1.5">
              <Label htmlFor="remarks">Remarks (optional)</Label>
              <Input id="remarks" name="remarks" placeholder="Audit notes…" />
            </div>
            {jobIncomeSelected && (
              <p className="text-sm text-red-500">
                Job-linked entries cannot have category INCOME. Job revenue is tracked through
                SalesTransaction.
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={createPending || jobIncomeSelected}>
                {createPending ? "Saving…" : "Save Entry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Void Confirmation Dialog ─── */}
      <Dialog
        open={!!voidTarget}
        onOpenChange={(open) => {
          if (!open) {
            setVoidTarget(null);
            setVoidReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Void this entry?</DialogTitle>
            <DialogDescription>
              Voiding flags this entry as cancelled. It will be excluded from all calculations but
              preserved for audit. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {voidTarget && (
              <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                <p className="font-medium">{voidTarget.particulars}</p>
                <p className="text-muted-foreground">
                  {CATEGORY_LABELS[voidTarget.category]} &middot; {fmtAmount(voidTarget.amount)}{" "}
                  &middot; {fmtDate(voidTarget.date)}
                </p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="voidReason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Input
                id="voidReason"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="e.g. Duplicate entry, incorrect amount"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setVoidTarget(null)}>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
