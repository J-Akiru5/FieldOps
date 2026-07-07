"use client";

import { createBrowserClient } from "@syntaxure/db/browser";
import { Avatar, AvatarFallback } from "@syntaxure/ui";
import { Bell, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface TopBarProps {
  userName: string;
  userEmail: string;
  unreadNotificationCount?: number;
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

export function TopBar({ userName, userEmail, unreadNotificationCount = 0 }: TopBarProps) {
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
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 backdrop-blur-md px-4 lg:px-6">
      {/* Left — Logo mark (mobile only) / page title (desktop) */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Logo mark — visible on mobile only */}
        <Link
          href="/dashboard"
          className="lg:hidden flex items-center gap-2 shrink-0"
          aria-label="Go to dashboard"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-bg text-white text-[10px] font-black tracking-tight">
            FO
          </div>
          <div className="leading-none">
            <p className="text-[11px] font-black tracking-tight text-foreground uppercase">
              Syntaxure
            </p>
            <p className="text-[9px] text-muted-foreground font-semibold tracking-widest uppercase">
              FieldOps
            </p>
          </div>
        </Link>

        {/* Desktop: page title on left */}
        <span className="hidden lg:block text-sm font-medium text-muted-foreground">
          {pageTitle}
        </span>
      </div>

      {/* Center — page title on mobile */}
      <span className="lg:hidden absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-foreground truncate max-w-[120px]">
        {pageTitle}
      </span>

      {/* Right — bell + avatar */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Notification bell with dot */}
        <Link
          href="/notifications"
          className="relative rounded-lg p-2 hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px] text-muted-foreground" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-background" />
          )}
        </Link>

        {/* Avatar dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-muted transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-sidebar-bg text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
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
              <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-border bg-card shadow-lg py-1 overflow-hidden">
                <div className="px-3 py-2.5 border-b border-border">
                  <p className="text-sm font-semibold truncate">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                </div>
                <Link
                  href="/account"
                  className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  Account
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-destructive"
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
