import { prisma } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { notFound, redirect } from "next/navigation";
import { JobDetailClient } from "./detail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: Props) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const job = await prisma.job
    .findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        status: true,
        scheduledAt: true,
        createdAt: true,
        updatedAt: true,
        laborFee: true,
        customer: {
          select: {
            id: true,
            displayName: true,
            contactPhone: true,
            contactEmail: true,
            address: true,
          },
        },
        appliance: { select: { id: true, brand: true, model: true, type: true } },
        assignments: { include: { staffMember: { select: { id: true, name: true, role: true } } } },
        inquiry: { select: { id: true, source: true, status: true } },
      },
    })
    .catch((error) => {
      console.error("[job-detail] Failed to load job:", error);
      return null;
    });

  if (!job) notFound();

  return (
    <JobDetailClient
      job={{
        ...job,
        scheduledAt: job.scheduledAt.toISOString(),
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        laborFee: Number(job.laborFee),
      }}
    />
  );
}
