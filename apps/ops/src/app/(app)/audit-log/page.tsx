import { getAuditActors, getAuditLogs } from "@/lib/data/audit-log";
import { requirePermission } from "@/lib/require-permission";
import { redirect } from "next/navigation";
import { AuditLogClient } from "./audit-log-client";

export const dynamic = "force-dynamic";

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    entity?: string;
    action?: string;
    actorId?: string;
    from?: string;
    to?: string;
    q?: string;
  }>;
}) {
  try {
    await requirePermission("audit-log.read");
  } catch {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));

  const [{ logs, total, pages }, actors] = await Promise.all([
    getAuditLogs({
      page,
      pageSize: 25,
      entity: params.entity as never,
      action: params.action as never,
      actorId: params.actorId,
      from: params.from ? new Date(params.from) : undefined,
      to: params.to ? new Date(params.to) : undefined,
      search: params.q,
    }).catch(() => ({ logs: [], total: 0, pages: 1, page: 1 })),
    getAuditActors().catch(() => []),
  ]);

  // Serialize dates to ISO strings
  const serializedLogs = logs.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
  }));

  const serializedActors = actors.map((a) => ({
    authUserId: a.authUserId,
    name: a.name,
    role: a.role,
  }));

  return (
    <AuditLogClient
      logs={serializedLogs}
      actors={serializedActors}
      total={total}
      pages={pages}
      currentPage={page}
      filters={{
        entity: params.entity,
        action: params.action,
        actorId: params.actorId,
        from: params.from,
        to: params.to,
        q: params.q,
      }}
    />
  );
}
