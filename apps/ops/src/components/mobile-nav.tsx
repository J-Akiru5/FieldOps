"use client";

import { ClipboardList, Ellipsis, Home, Plus, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const navLinkClass = (href: string) =>
    `flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
      isActive(href) ? "text-sidebar-active" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <>
      {/* Bottom safe-area spacer */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex items-center justify-around h-16 px-2 pt-2 relative">
          {/* Home */}
          <Link href="/dashboard" className={navLinkClass("/dashboard")}>
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>

          {/* Inquiries */}
          <Link href="/inquiries" className={navLinkClass("/inquiries")}>
            <ClipboardList className="h-5 w-5" />
            <span>Inquiries</span>
          </Link>

          {/* Center + quick-action button */}
          <Link
            href="/schedule/new"
            className="flex flex-col items-center justify-center -mt-7"
            aria-label="New service schedule"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors active:scale-95">
              <Plus className="h-6 w-6" />
            </span>
          </Link>

          {/* Schedule */}
          <Link href="/schedule" className={navLinkClass("/schedule")}>
            <Wrench className="h-5 w-5" />
            <span>Schedule</span>
          </Link>

          {/* More */}
          <Link href="/more" className={navLinkClass("/more")}>
            <Ellipsis className="h-5 w-5" />
            <span>More</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
