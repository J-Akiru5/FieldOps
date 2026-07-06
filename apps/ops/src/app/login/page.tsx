import { LoginForm } from "@/components/login-form";
import { ClipboardList, Settings, Users, Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left brand panel — hidden on mobile, visible md+ */}
      <div className="hidden md:flex md:w-1/2 bg-sidebar-bg flex-col justify-between p-10 lg:p-14">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-active font-bold text-white text-sm">
              FO
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-white">Syntaxure</p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/50">
                FieldOps
              </p>
            </div>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight mt-12">
            Manage your field operations with confidence.
          </h2>
          <p className="mt-4 text-white/60 text-base max-w-md">
            Track inquiries, schedule jobs, manage inventory, and run reports — all from one
            dashboard.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-white/50 text-sm">
            <ClipboardList className="h-5 w-5 text-sidebar-active" />
            <span>Real-time inquiry tracking</span>
          </div>
          <div className="flex items-center gap-3 text-white/50 text-sm">
            <Wrench className="h-5 w-5 text-sidebar-active" />
            <span>Service scheduling & dispatch</span>
          </div>
          <div className="flex items-center gap-3 text-white/50 text-sm">
            <Users className="h-5 w-5 text-sidebar-active" />
            <span>Role-based staff management</span>
          </div>
          <div className="flex items-center gap-3 text-white/50 text-sm">
            <Settings className="h-5 w-5 text-sidebar-active" />
            <span>Inventory & sales reporting</span>
          </div>
        </div>

        <p className="text-white/20 text-xs">
          J.R.R. Aircon &amp; Electronics — Field Operations Platform
        </p>
      </div>

      {/* Right login panel */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-4 sm:px-8 lg:px-14 bg-background">
        <div className="w-full max-w-sm space-y-6">
          {/* Brand shown only on mobile */}
          <div className="md:hidden text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sidebar-bg font-bold text-white text-lg mb-3">
              FO
            </div>
            <h1 className="text-2xl font-bold tracking-tight">FieldOps</h1>
            <p className="text-sm text-muted-foreground">J.R.R. Aircon &amp; Electronics</p>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-xl font-semibold">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your staff credentials to continue
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-xs text-muted-foreground">
            Protected by Syntaxure FieldOps. Only authorized staff members may access this
            dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
