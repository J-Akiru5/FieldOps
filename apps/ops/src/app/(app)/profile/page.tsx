import { prisma } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { Button } from "@syntaxure/ui";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let staffMember: { name: string; role: string; createdAt: Date } | null = null;

  try {
    const record = await prisma.staffMember.findUnique({
      where: { authUserId: user.id },
      select: { name: true, role: true, createdAt: true },
    });
    if (record) {
      staffMember = {
        name: record.name,
        role: record.role,
        createdAt: record.createdAt,
      };
    }
  } catch {
    // Graceful fallback — no StaffMember row yet
  }

  const displayName = staffMember?.name ?? user.email?.split("@")[0] ?? "Staff";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const memberSince = staffMember?.createdAt ?? new Date(user.created_at ?? Date.now());

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Profile</h1>

      <div className="max-w-lg space-y-6">
        {/* Avatar */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">Profile Photo</h2>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-xl font-bold">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">Avatar upload coming soon</p>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Account Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium">{displayName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-sm font-medium">{staffMember?.role ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Member Since</p>
              <p className="text-sm font-medium">{format(memberSince, "MMMM d, yyyy")}</p>
            </div>
          </div>
        </div>

        {/* Password reset */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Security</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Send a password reset link to your email address.
          </p>
          <form
            action={async () => {
              "use server";
              const { createServerClient: createSC } = await import("@syntaxure/db/server");
              const sb = await createSC();
              const {
                data: { user: u },
              } = await sb.auth.getUser();
              if (u?.email) {
                await sb.auth.resetPasswordForEmail(u.email, {
                  redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/ops/update-password`,
                });
              }
            }}
          >
            <Button id="reset-password-btn" type="submit" variant="outline" size="sm">
              Send Password Reset Email
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
