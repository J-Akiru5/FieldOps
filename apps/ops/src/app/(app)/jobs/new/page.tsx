import { prisma } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { redirect } from "next/navigation";
import { NewJobForm } from "./new-form";

export default async function NewJobPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      name: true,
      appliances: { select: { id: true, brand: true, model: true } },
    },
    orderBy: { name: "asc" },
  });

  const technicians = await prisma.staffMember.findMany({
    where: { role: { in: ["TECHNICIAN", "OWNER", "PARTNER"] } },
    select: { id: true, name: true },
  });

  return <NewJobForm customers={customers} technicians={technicians} />;
}
