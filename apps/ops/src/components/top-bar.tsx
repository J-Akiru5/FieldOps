"use client";

import { createBrowserClient } from "@syntaxure/db/browser";
import { Bell, LogOut, Settings, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface TopBarProps {
  userName: string;
  userEmail: string;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inquiries": "Inquiries",
  "/jobs": "Jobs",
  "/schedule": "Schedule",
  "/inventory": "Inventory",
  "/sales": "Sales",
  "/reports": "Reports",
  "/staff": "Staff",
  "/settings": "Settings",
  "/profile": "Profile",
  "/account": "Account",
  "/customers": "Customers",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  for (const [prefix, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(`${prefix}/`)) return title;
  }
  return "FieldOps";
}

export function TopBar({ userName, userEmail }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-4 lg:px-6">
      <span className="text-sm font-medium text-muted-foreground">{pageTitle}</span>

      <div className="flex items-center gap-2">
        <a
          href="/notifications"
          className="relative rounded-lg p-2 hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
        </a>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-bg text-xs font-semibold text-white">
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-medium">{userName}</span>
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setMenuOpen(false);
                }}
              />
              <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-xl border border-border bg-card shadow-lg py-1">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium truncate">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                </div>
                <a
                  href="/account"
                  className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  Account
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Settings
                </a>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
