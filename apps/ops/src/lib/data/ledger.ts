import { type LedgerCategory, prisma } from "@syntaxure/db";

export interface CreateLedgerEntryInput {
  date: Date;
  particulars: string;
  category: LedgerCategory;
  amount: number;
  remarks?: string;
  partnerId?: string;
  jobId?: string;
}

export interface UpdateLedgerEntryInput {
  date?: Date;
  particulars?: string;
  category?: LedgerCategory;
  amount?: number;
  remarks?: string | null;
  partnerId?: string | null;
  jobId?: string | null;
}

export interface LedgerFilters {
  from?: Date;
  to?: Date;
  category?: LedgerCategory;
  partnerId?: string;
  jobId?: string;
  includeVoided?: boolean;
}

function validateLedgerEntry(data: {
  amount: number;
  category: LedgerCategory;
  partnerId?: string | null;
  jobId?: string | null;
}) {
  if (data.amount <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  if (data.category === "PARTNER_DRAW" && !data.partnerId) {
    throw new Error("partnerId is required when category is PARTNER_DRAW.");
  }

  if (data.jobId && data.category === "INCOME") {
    throw new Error(
      "Cannot create a LedgerEntry with jobId and category INCOME. " +
        "Job revenue is tracked automatically via SalesTransaction. " +
        "Use this ledger for job-related costs only (OPERATING_EXPENSE)."
    );
  }
}

export async function getLedgerEntries(filters?: LedgerFilters) {
  const where: Record<string, unknown> = {};

  if (!filters?.includeVoided) {
    where.isVoided = false;
  }

  if (filters?.from || filters?.to) {
    where.date = {};
    if (filters?.from) {
      (where.date as Record<string, unknown>).gte = filters.from;
    }
    if (filters?.to) {
      (where.date as Record<string, unknown>).lte = filters.to;
    }
  }

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.partnerId) {
    where.partnerId = filters.partnerId;
  }

  if (filters?.jobId) {
    where.jobId = filters.jobId;
  }

  return prisma.ledgerEntry.findMany({
    where,
    include: {
      partner: { select: { id: true, name: true, role: true } },
      job: { select: { id: true, type: true, status: true } },
    },
    orderBy: { date: "desc" },
    take: 100,
  });
}

export async function getLedgerEntryById(id: string) {
  return prisma.ledgerEntry.findUnique({
    where: { id },
    include: {
      partner: { select: { id: true, name: true, role: true } },
      job: { select: { id: true, type: true, status: true } },
    },
  });
}

export async function createLedgerEntry(data: CreateLedgerEntryInput) {
  validateLedgerEntry({
    amount: data.amount,
    category: data.category,
    partnerId: data.partnerId,
    jobId: data.jobId,
  });

  return prisma.ledgerEntry.create({
    data: {
      date: data.date,
      particulars: data.particulars,
      category: data.category,
      amount: data.amount,
      remarks: data.remarks,
      partnerId: data.partnerId ?? null,
      jobId: data.jobId ?? null,
    },
    include: {
      partner: { select: { id: true, name: true, role: true } },
      job: { select: { id: true, type: true, status: true } },
    },
  });
}

export async function updateLedgerEntry(id: string, data: UpdateLedgerEntryInput) {
  const existing = await prisma.ledgerEntry.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("LedgerEntry not found.");
  }

  const mergedCategory = data.category ?? existing.category;
  const mergedAmount = data.amount ?? Number(existing.amount);
  const mergedPartnerId = data.partnerId !== undefined ? data.partnerId : existing.partnerId;
  const mergedJobId = data.jobId !== undefined ? data.jobId : existing.jobId;

  validateLedgerEntry({
    amount: mergedAmount,
    category: mergedCategory,
    partnerId: mergedPartnerId,
    jobId: mergedJobId,
  });

  return prisma.ledgerEntry.update({
    where: { id },
    data: {
      date: data.date,
      particulars: data.particulars,
      category: data.category,
      amount: data.amount,
      remarks: data.remarks,
      partnerId: data.partnerId,
      jobId: data.jobId,
    },
    include: {
      partner: { select: { id: true, name: true, role: true } },
      job: { select: { id: true, type: true, status: true } },
    },
  });
}

export async function voidLedgerEntry(id: string, voidedBy: string, reason: string) {
  if (!reason || reason.trim().length === 0) {
    throw new Error("voidedReason is required when voiding a LedgerEntry.");
  }

  const existing = await prisma.ledgerEntry.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("LedgerEntry not found.");
  }

  if (existing.isVoided) {
    throw new Error("LedgerEntry is already voided.");
  }

  return prisma.ledgerEntry.update({
    where: { id },
    data: {
      isVoided: true,
      voidedAt: new Date(),
      voidedBy,
      voidedReason: reason.trim(),
    },
  });
}
