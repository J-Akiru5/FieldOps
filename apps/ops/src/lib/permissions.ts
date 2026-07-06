export type Permission =
  | "inquiries.read"
  | "inquiries.write"
  | "jobs.read"
  | "jobs.write"
  | "jobs.assign"
  | "schedule.read"
  | "schedule.write"
  | "inventory.read"
  | "inventory.write"
  | "sales.read"
  | "sales.write"
  | "reports.read"
  | "staff.read"
  | "staff.write"
  | "settings.read"
  | "settings.write"
  | "customers.read"
  | "customers.write"
  | "notifications.read";

const ROLE_HIERARCHY: Record<string, number> = {
  OWNER: 4,
  PARTNER: 3,
  BOOKKEEPER: 2,
  TECHNICIAN: 1,
};

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  OWNER: [
    "inquiries.read",
    "inquiries.write",
    "jobs.read",
    "jobs.write",
    "jobs.assign",
    "schedule.read",
    "schedule.write",
    "inventory.read",
    "inventory.write",
    "sales.read",
    "sales.write",
    "reports.read",
    "staff.read",
    "staff.write",
    "settings.read",
    "settings.write",
    "customers.read",
    "customers.write",
    "notifications.read",
  ],
  PARTNER: [
    "inquiries.read",
    "inquiries.write",
    "jobs.read",
    "jobs.write",
    "jobs.assign",
    "schedule.read",
    "schedule.write",
    "inventory.read",
    "inventory.write",
    "sales.read",
    "sales.write",
    "reports.read",
    "staff.read",
    "settings.read",
    "customers.read",
    "customers.write",
    "notifications.read",
  ],
  BOOKKEEPER: [
    "inquiries.read",
    "jobs.read",
    "schedule.read",
    "inventory.read",
    "sales.read",
    "sales.write",
    "reports.read",
    "staff.read",
    "settings.read",
    "customers.read",
    "notifications.read",
  ],
  TECHNICIAN: [
    "inquiries.read",
    "jobs.read",
    "schedule.read",
    "inventory.read",
    "customers.read",
    "notifications.read",
  ],
};

const SUPER_ADMIN_EMAIL = "admin@syntaxure.dev";

export function hasPermission(
  userRole: string | undefined,
  permission: Permission,
  userEmail?: string | null
): boolean {
  if (userEmail === SUPER_ADMIN_EMAIL) return true;
  if (!userRole) return false;
  const upperRole = userRole.toUpperCase();
  const perms = ROLE_PERMISSIONS[upperRole];
  return perms?.includes(permission) ?? false;
}

export function hasRole(userRole: string | undefined, minimumRole: string): boolean {
  if (!userRole) return false;
  return (
    (ROLE_HIERARCHY[userRole.toUpperCase()] ?? 0) >=
    (ROLE_HIERARCHY[minimumRole.toUpperCase()] ?? 0)
  );
}

export { SUPER_ADMIN_EMAIL };
