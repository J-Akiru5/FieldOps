import { type JobStatus, type JobType, prisma } from "@syntaxure/db";

export interface JobFilters {
  status?: JobStatus;
  technicianId?: string;
}

export async function getJobs(filters?: JobFilters) {
  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.technicianId) where.assignments = { some: { staffMemberId: filters.technicianId } };

  return prisma.job.findMany({
    where,
    include: {
      customer: { select: { id: true, displayName: true, contactPhone: true } },
      appliance: { select: { id: true, brand: true, model: true, type: true } },
      assignments: { include: { staffMember: { select: { id: true, name: true } } } },
      inquiry: { select: { id: true } },
    },
    orderBy: { scheduledAt: "desc" },
    take: 50,
  });
}

export async function getJobById(id: string) {
  return prisma.job.findUnique({
    where: { id },
    include: {
      customer: true,
      appliance: true,
      assignments: { include: { staffMember: { select: { id: true, name: true, role: true } } } },
      inquiry: { select: { id: true, source: true, status: true } },
      lineItems: { include: { inventoryItem: { select: { id: true, name: true, unit: true } } } },
    },
  });
}

export async function createJob(data: {
  customerId: string;
  applianceId?: string;
  inquiryId?: string;
  type: string;
  scheduledAt: Date;
  laborFee?: number;
  notes?: string;
}) {
  return prisma.job.create({
    data: {
      customerId: data.customerId,
      applianceId: data.applianceId,
      inquiryId: data.inquiryId,
      type: data.type as JobType,
      scheduledAt: data.scheduledAt,
      laborFee: data.laborFee ?? 0,
      notes: data.notes,
    },
    select: { id: true },
  });
}

export async function updateJobStatus(id: string, status: JobStatus) {
  return prisma.job.update({ where: { id }, data: { status } });
}

export async function getTechnicians() {
  return prisma.staffMember.findMany({
    where: { role: { in: ["TECHNICIAN", "OWNER", "PARTNER"] } },
    select: { id: true, name: true, role: true },
  });
}
