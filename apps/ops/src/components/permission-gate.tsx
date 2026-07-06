"use client";

import type { Permission } from "@/lib/permissions";
import { hasPermission } from "@/lib/permissions";
import type { ReactNode } from "react";

interface PermissionGateProps {
  permission: Permission;
  userRole?: string | null;
  userEmail?: string | null;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({
  permission,
  userRole,
  userEmail,
  children,
  fallback = null,
}: PermissionGateProps) {
  if (hasPermission(userRole ?? undefined, permission, userEmail)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}
