"use client";

import type { ReactNode } from "react";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

interface AppShellProps {
  children: ReactNode;
  userName: string;
  userEmail: string;
  userRole: string;
}

export function AppShell({ children, userName, userEmail, userRole }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar — hidden on mobile/tablet */}
      <div className="hidden lg:block">
        <Sidebar userName={userName} userEmail={userEmail} userRole={userRole} />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar userName={userName} userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
