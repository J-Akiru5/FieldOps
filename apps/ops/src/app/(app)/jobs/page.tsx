import { prisma } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { redirect } from "next/navigation";
import { JobsListClient } from "./jobs-list";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rawJobs = await prisma.job.findMany({
    include: {
      customer: { select: { displayName: true, contactPhone: true } },
      appliance: { select: { brand: true, model: true } },
      assignments: { include: { staffMember: { select: { name: true } } } },
    },
    orderBy: { scheduledAt: "desc" },
    take: 50,
  });

  return (
    <JobsListClient
      jobs={rawJobs.map((j) => ({
        id: j.id,
        type: j.type,
        status: j.status,
        scheduledAt: j.scheduledAt.toISOString(),
        createdAt: j.createdAt.toISOString(),
        customer: j.customer,
        appliance: j.appliance,
        assignments: j.assignments,
      }))}
    />
  );
}
