import { prisma } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { redirect } from "next/navigation";
import { StaffPageClient } from "./staff-form";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const staffMembers = await prisma.staffMember.findMany({
    select: { id: true, name: true, role: true, authUserId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const currentRole = staffMembers.find((s) => s.authUserId === user.id)?.role;

  return (
    <StaffPageClient
      staffMembers={staffMembers.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      }))}
      currentUserRole={currentRole ?? undefined}
      currentUserEmail={user.email ?? null}
    />
  );
}
