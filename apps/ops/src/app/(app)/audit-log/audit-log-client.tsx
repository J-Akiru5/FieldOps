"use client";

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@syntaxure/ui";
import { format } from "date-fns";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Filter,
  Package,
  RotateCw,
  Settings,
  Shield,
  Trash2,
  User,
  Wrench,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "VOID" | "EXPORT" | "STATUS_CHANGE" | "LOGIN";
type AuditEntity =
  | "LEDGER_ENTRY"
  | "JOB"
  | "CUSTOMER"
  | "INVENTORY_ITEM"
  | "STOCK_MOVEMENT"
  | "STAFF_MEMBER"
  | "SETTINGS"
  | "SALES_TRANSACTION";

interface SerializedLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actorName: string | null;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string | null;
  entityLabel: string | null;
  before: unknown;
  after: unknown;
  metadata: unknown;
  createdAt: string;
}

interface SerializedActor {
  authUserId: string;
  name: string;
  role: string;
}

interface Props {
  logs: SerializedLog[];
  actors: SerializedActor[];
  total: number;
  pages: number;
  currentPage: number;
  filters: {
    entity?: string;
    action?: string;
    actorId?: string;
    from?: string;
    to?: string;
    q?: string;
  };
}

const ACTION_STYLES: Record<AuditAction, { label: string; cls: string }> = {
  CREATE: { label: "Create", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" },
  UPDATE: { label: "Update", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30" },
  DELETE: { label: "Delete", cls: "bg-red-100 text-red-700 dark:bg-red-900/30" },
  VOID: { label: "Void", cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30" },
  EXPORT: { label: "Export", cls: "bg-gray-100 text-gray-700 dark:bg-gray-900/30" },
  STATUS_CHANGE: {
    label: "Status Change",
    cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30",
  },
  LOGIN: { label: "Login", cls: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30" },
};

const ENTITY_ICONS: Record<AuditEntity, React.ReactNode> = {
  LEDGER_ENTRY: <ClipboardList className="h-3.5 w-3.5" />,
  JOB: <Wrench className="h-3.5 w-3.5" />,
  CUSTOMER: <User className="h-3.5 w-3.5" />,
  INVENTORY_ITEM: <Package className="h-3.5 w-3.5" />,
  STOCK_MOVEMENT: <Package className="h-3.5 w-3.5" />,
  STAFF_MEMBER: <Shield className="h-3.5 w-3.5" />,
  SETTINGS: <Settings className="h-3.5 w-3.5" />,
  SALES_TRANSACTION: <ClipboardList className="h-3.5 w-3.5" />,
};

const ENTITY_LABELS: Record<AuditEntity, string> = {
  LEDGER_ENTRY: "Ledger Entry",
  JOB: "Job",
  CUSTOMER: "Customer",
  INVENTORY_ITEM: "Inventory",
  STOCK_MOVEMENT: "Stock Movement",
  STAFF_MEMBER: "Staff",
  SETTINGS: "Settings",
  SALES_TRANSACTION: "Sales",
};

function fmtTs(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy h:mm a");
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function AuditLogClient({ logs, actors, total, pages, currentPage, filters }: Props) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter form state
  const [q, setQ] = useState(filters.q ?? "");
  const [entity, setEntity] = useState(filters.entity ?? "");
  const [action, setAction] = useState(filters.action ?? "");
  const [actorId, setActorId] = useState(filters.actorId ?? "");
  const [from, setFrom] = useState(filters.from ?? "");
  const [to, setTo] = useState(filters.to ?? "");

  function buildUrl(overrides: Record<string, string | number | undefined> = {}) {
    const params = new URLSearchParams();
    const merged = { q, entity, action, actorId, from, to, page: currentPage, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, String(v));
    }
    return `/audit-log?${params.toString()}`;
  }

  function applyFilters() {
    router.push(buildUrl({ page: 1 }));
  }

  function resetFilters() {
    setQ("");
    setEntity("");
    setAction("");
    setActorId("");
    setFrom("");
    setTo("");
    router.push("/audit-log");
  }

  const hasActiveFilters = !!(q || entity || action || actorId || from || to);

  return (
    <div className="space-y-5">
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track all system events and user actions.{" "}
            <span className="font-medium text-foreground">
              {total.toLocaleString()} total events
            </span>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
          onClick={() => {
            // CSV export of current page
            const rows = logs.map((l) => [
              fmtTs(l.createdAt),
              l.actorName ?? l.actorEmail,
              l.action,
              ENTITY_LABELS[l.entity],
              l.entityLabel ?? "",
            ]);
            const header = ["Timestamp", "Actor", "Action", "Entity", "Description"];
            const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* ─── Filter Bar ─── */}
      <div className="rounded-xl border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="xl:col-span-2 space-y-1">
            <Label className="text-xs text-muted-foreground">Search description</Label>
            <Input
              placeholder="Search events..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Entity type</Label>
            <Select value={entity} onValueChange={setEntity}>
              <SelectTrigger>
                <SelectValue placeholder="All entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All entities</SelectItem>
                {(Object.keys(ENTITY_LABELS) as AuditEntity[]).map((e) => (
                  <SelectItem key={e} value={e}>
                    {ENTITY_LABELS[e]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All actions</SelectItem>
                {(Object.keys(ACTION_STYLES) as AuditAction[]).map((a) => (
                  <SelectItem key={a} value={a}>
                    {ACTION_STYLES[a].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Actor</Label>
            <Select value={actorId} onValueChange={setActorId}>
              <SelectTrigger>
                <SelectValue placeholder="All actors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All actors</SelectItem>
                {actors.map((a) => (
                  <SelectItem key={a.authUserId} value={a.authUserId}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-40"
            placeholder="To"
          />
          <Button size="sm" className="gap-2" onClick={applyFilters}>
            <Filter className="h-4 w-4" />
            Apply
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              onClick={resetFilters}
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actor</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Entity</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Description
                </th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Shield className="h-10 w-10 opacity-20" />
                      <p className="font-medium">No audit events found</p>
                      <p className="text-xs">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.flatMap((log) => {
                  const actionStyle = ACTION_STYLES[log.action] ?? ACTION_STYLES.UPDATE;
                  const isExpanded = expandedId === log.id;
                  const actorLabel = log.actorName ?? log.actorEmail.split("@")[0];
                  const avatarColor = getAvatarColor(log.actorId);

                  return [
                    <tr
                      key={log.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setExpandedId(isExpanded ? null : log.id);
                        }
                      }}
                      tabIndex={0}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground font-mono">
                        {fmtTs(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${avatarColor}`}
                          >
                            {getInitials(actorLabel)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[120px] text-xs">
                              {actorLabel}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${actionStyle.cls}`}
                        >
                          {log.action === "DELETE" && <Trash2 className="h-3 w-3" />}
                          {log.action === "VOID" && <AlertTriangle className="h-3 w-3" />}
                          {log.action === "STATUS_CHANGE" && <RotateCw className="h-3 w-3" />}
                          {actionStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {ENTITY_ICONS[log.entity]}
                          {ENTITY_LABELS[log.entity]}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="truncate text-xs">{log.entityLabel ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {Boolean(log.before ?? log.after ?? log.metadata) && (
                          <ChevronRight
                            className={`h-4 w-4 text-muted-foreground/50 transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        )}
                      </td>
                    </tr>,
                    isExpanded && Boolean(log.before ?? log.after ?? log.metadata) ? (
                      <tr key={`${log.id}-expand`} className="bg-muted/20">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="grid gap-3 sm:grid-cols-3 text-xs font-mono">
                            {Boolean(log.before) && (
                              <div>
                                <p className="text-muted-foreground mb-1 font-sans font-medium">
                                  Before
                                </p>
                                <pre className="bg-muted/50 rounded p-2 overflow-x-auto text-[11px]">
                                  {JSON.stringify(log.before, null, 2)}
                                </pre>
                              </div>
                            )}
                            {Boolean(log.after) && (
                              <div>
                                <p className="text-muted-foreground mb-1 font-sans font-medium">
                                  After
                                </p>
                                <pre className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded p-2 overflow-x-auto text-[11px]">
                                  {JSON.stringify(log.after, null, 2)}
                                </pre>
                              </div>
                            )}
                            {Boolean(log.metadata) && (
                              <div>
                                <p className="text-muted-foreground mb-1 font-sans font-medium">
                                  Metadata
                                </p>
                                <pre className="bg-muted/50 rounded p-2 overflow-x-auto text-[11px]">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : null,
                  ].filter(Boolean);
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
            <p className="text-muted-foreground text-xs">
              Showing {(currentPage - 1) * 25 + 1}–{Math.min(currentPage * 25, total)} of{" "}
              {total.toLocaleString()} events
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage <= 1}
                onClick={() => router.push(buildUrl({ page: currentPage - 1 }))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const p = Math.max(1, Math.min(pages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={p}
                    variant={p === currentPage ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => router.push(buildUrl({ page: p }))}
                  >
                    {p}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage >= pages}
                onClick={() => router.push(buildUrl({ page: currentPage + 1 }))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
