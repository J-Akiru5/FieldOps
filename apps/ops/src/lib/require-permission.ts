import { prisma } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { type Permission, SUPER_ADMIN_EMAIL, hasPermission } from "./permissions";

export async function getCurrentUserRoleAndEmail(): Promise<{
  role?: string;
  email?: string;
  userId?: string;
}> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  let role: string | undefined;
  try {
    const staff = await prisma.staffMember.findUnique({
      where: { authUserId: user.id },
      select: { role: true },
    });
    role = staff?.role;
  } catch {
    // fallback
  }

  return { role, email: user.email, userId: user.id };
}

export async function requirePermission(
  permission: Permission
): Promise<{ email: string | null; userId: string }> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized: must be signed in");

  if (user.email === SUPER_ADMIN_EMAIL) {
    return { email: user.email ?? null, userId: user.id };
  }

  let role: string | undefined;
  try {
    const staff = await prisma.staffMember.findUnique({
      where: { authUserId: user.id },
      select: { role: true },
    });
    role = staff?.role;
  } catch {
    // fallback
  }

  if (!hasPermission(role, permission, user.email)) {
    throw new Error(`Forbidden: missing permission '${permission}'`);
  }

  return { email: user.email ?? null, userId: user.id };
}
