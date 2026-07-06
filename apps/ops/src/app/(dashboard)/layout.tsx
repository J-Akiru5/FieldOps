import { Sidebar } from "@/components/sidebar";
import { prisma } from "@syntaxure/db";
import { StaffRole } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Try to get name/role from StaffMember table — graceful fallback if not linked
  let userName = user.email?.split("@")[0] ?? "Staff";
  let userRole = "Staff";

  try {
    const staffMember = await prisma.staffMember.findUnique({
      where: { authUserId: user.id },
      select: { name: true, role: true },
    });
    if (staffMember) {
      userName = staffMember.name;
      userRole =
        staffMember.role === StaffRole.OWNER
          ? "Owner"
          : staffMember.role === StaffRole.PARTNER
            ? "Partner"
            : staffMember.role === StaffRole.TECHNICIAN
              ? "Technician"
              : "Bookkeeper";
    }
  } catch {
    // Silently fall back — DB may not have a StaffMember row yet
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userName={userName} userEmail={user.email ?? ""} userRole={userRole} />
      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
