import { prisma } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { AccountPageClient } from "./account-form";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let staffName = user.email?.split("@")[0] ?? "Staff";
  let staffRole = "Staff";
  let memberSince = format(new Date(user.created_at ?? Date.now()), "MMMM d, yyyy");

  try {
    const record = await prisma.staffMember.findUnique({
      where: { authUserId: user.id },
      select: { name: true, role: true, createdAt: true },
    });
    if (record) {
      staffName = record.name;
      staffRole = record.role;
      memberSince = format(record.createdAt, "MMMM d, yyyy");
    }
  } catch {
    // fallback
  }

  return (
    <AccountPageClient
      userName={staffName}
      userEmail={user.email ?? ""}
      userRole={staffRole}
      memberSince={memberSince}
    />
  );
}
