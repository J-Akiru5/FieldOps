import { type CustomerType, prisma } from "@syntaxure/db";

export interface SearchCustomersResult {
  id: string;
  displayName: string;
  contactPhone: string;
  type: CustomerType;
  appliances: { id: string; brand: string | null; model: string | null; type: string }[];
}

export async function searchCustomers(query: string): Promise<SearchCustomersResult[]> {
  const select = {
    id: true,
    displayName: true,
    contactPhone: true,
    type: true,
    appliances: {
      select: { id: true, brand: true, model: true, type: true },
      orderBy: { createdAt: "desc" as const },
    },
  };

  if (!query || query.trim().length === 0) {
    return prisma.customer.findMany({
      select,
      orderBy: { createdAt: "desc" },
      take: 15,
    });
  }

  const trimmed = query.trim();
  const phonePattern = trimmed.replace(/[^0-9]/g, "");
  const isPhoneLike = phonePattern.length >= 3;

  return prisma.customer.findMany({
    where: {
      OR: [
        { displayName: { contains: trimmed, mode: "insensitive" } },
        { contactPersonName: { contains: trimmed, mode: "insensitive" } },
        ...(isPhoneLike ? [{ contactPhone: { contains: phonePattern } }] : []),
      ],
    },
    select,
    orderBy: { createdAt: "desc" },
    take: 15,
  });
}

export interface CreateCustomerQuickInput {
  type: CustomerType;
  displayName: string;
  contactPhone: string;
  contactPersonName?: string;
}

export async function createCustomerQuick(data: CreateCustomerQuickInput) {
  return prisma.customer.create({
    data: {
      type: data.type,
      displayName: data.displayName,
      contactPhone: data.contactPhone,
      contactPersonName: data.contactPersonName,
    },
    select: { id: true, displayName: true, contactPhone: true, type: true },
  });
}

export async function findCustomerByPhone(phone: string) {
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.length < 3) return null;

  return prisma.customer.findFirst({
    where: { contactPhone: { contains: cleaned } },
    select: { id: true, displayName: true, contactPhone: true },
  });
}
