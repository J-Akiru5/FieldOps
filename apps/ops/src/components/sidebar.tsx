"use client";

import { createBrowserClient } from "@syntaxure/db/browser";
import {
  BarChart3,
  ClipboardList,
  Home,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/inquiries", label: "Inquiries", icon: ClipboardList },
  { href: "/jobs", label: "Jobs", icon: Wrench },
  { href: "/schedule", label: "Schedule", icon: ClipboardList },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/sales", label: "Sales", icon: ShoppingCart },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/staff", label: "Staff", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
  userRole: string;
}

export function Sidebar({ userName, userEmail, userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Initials for avatar fallback
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-sidebar-bg text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-active font-bold text-white text-sm">
          FO
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight">Syntaxure</p>
          <p className="text-[10px] text-white/50 font-medium uppercase tracking-widest">
            FieldOps
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-active text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-active text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{userName}</p>
            <p className="truncate text-xs text-white/50">{userRole}</p>
            <p className="truncate text-[10px] text-white/30">{userEmail}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
