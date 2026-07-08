import { type AuditAction, type AuditEntity, prisma } from "@syntaxure/db";

export interface CreateAuditLogInput {
  actorId: string;
  actorEmail: string;
  actorName?: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  entityLabel?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface AuditLogFilters {
  actorId?: string;
  entity?: AuditEntity;
  action?: AuditAction;
  from?: Date;
  to?: Date;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Fire-and-forget audit writer.
 * Never throws — a logging failure must NEVER surface to the user or block the main operation.
 */
export async function writeAuditLog(input: CreateAuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: input as unknown as Parameters<typeof prisma.auditLog.create>[0]["data"],
    });
  } catch (err) {
    console.error("[audit] Failed to write audit log:", err);
  }
}

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const PAGE_SIZE = filters.pageSize ?? 25;
  const page = Math.max(1, filters.page ?? 1);

  const where: Record<string, unknown> = {};

  if (filters.actorId) where.actorId = filters.actorId;
  if (filters.entity) where.entity = filters.entity;
  if (filters.action) where.action = filters.action;

  if (filters.from || filters.to) {
    const dateFilter: Record<string, Date> = {};
    if (filters.from) dateFilter.gte = filters.from;
    if (filters.to) dateFilter.lte = filters.to;
    where.createdAt = dateFilter;
  }

  if (filters.search?.trim()) {
    where.entityLabel = { contains: filters.search.trim(), mode: "insensitive" };
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    pages: Math.ceil(total / PAGE_SIZE),
  };
}

export async function getAuditActors() {
  return prisma.staffMember.findMany({
    select: { authUserId: true, name: true, role: true },
    orderBy: { name: "asc" },
  });
}
