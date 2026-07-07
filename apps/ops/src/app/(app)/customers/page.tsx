import { prisma } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { redirect } from "next/navigation";
import { CustomerListClient } from "./customer-list";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      displayName: true,
      contactPhone: true,
      contactEmail: true,
      address: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <CustomerListClient
      customers={customers.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))}
    />
  );
}
