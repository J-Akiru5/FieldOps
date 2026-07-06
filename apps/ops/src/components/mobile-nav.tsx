"use client";

import { CalendarCheck, ClipboardList, Ellipsis, Home, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border pb-safe">
        <div className="flex items-end justify-around h-16 px-1 pt-1 relative">
          {/* Home */}
          <NavItem href="/dashboard" label="Home" isActive={isActive("/dashboard")}>
            <Home className="h-[22px] w-[22px]" />
          </NavItem>

          {/* Inquiries */}
          <NavItem href="/inquiries" label="Inquiries" isActive={isActive("/inquiries")}>
            <ClipboardList className="h-[22px] w-[22px]" />
          </NavItem>

          {/* Center FAB */}
          <div className="flex flex-col items-center justify-end pb-2">
            <Link
              href="/inquiries/new"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all active:scale-95 -mt-7 fab-pulse"
              aria-label="New inquiry"
            >
              <Plus className="h-6 w-6" />
            </Link>
          </div>

          {/* Schedule */}
          <NavItem href="/schedule" label="Schedule" isActive={isActive("/schedule")}>
            <CalendarCheck className="h-[22px] w-[22px]" />
          </NavItem>

          {/* More */}
          <NavItem href="/more" label="More" isActive={isActive("/more")}>
            <Ellipsis className="h-[22px] w-[22px]" />
          </NavItem>
        </div>
      </nav>
    </>
  );
}

/* ─── Sub-component: individual nav item with active pill ─── */
function NavItem({
  href,
  label,
  isActive,
  children,
}: {
  href: string;
  label: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center justify-end gap-0.5 pb-1.5 px-3 min-w-[56px]"
      aria-current={isActive ? "page" : undefined}
    >
      {/* Active pill indicator — sits behind icon */}
      {isActive && (
        <span className="absolute top-0.5 left-1/2 -translate-x-1/2 h-7 w-12 rounded-full bg-primary/10" />
      )}
      <span
        className={`relative z-10 transition-colors ${
          isActive ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {children}
      </span>
      <span
        className={`text-[10px] font-medium transition-colors ${
          isActive ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
