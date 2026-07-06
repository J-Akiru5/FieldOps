import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = __dirname;

const phases = [
  {
    id: "00",
    title: "Foundation: PWA, Shell & Modern Login",
    description: "Install PWA boilerplate, replace the fixed desktop sidebar with a responsive shell (sidebar/rail/bottom-nav), modernize the login page, and prepare all page shells.",
    tasks: [
      {
        title: "Install and configure next-pwa",
        description: "Add @ducanh2912/next-pwa, create manifest.json, add icon placeholders, register service worker in next.config.",
        commit: "feat(ops): add PWA manifest, icons, and next-pwa config",
        files: ["apps/ops/next.config.ts", "apps/ops/public/manifest.json", "apps/ops/public/icons/"],
      },
      {
        title: "Modern split-view login page",
        description: "Replace the current centered login with a left/right split layout. Left panel shows brand/illustration on desktop; form card on the right. Fully responsive.",
        commit: "feat(ops): modernize login page with split-screen layout",
        files: ["apps/ops/src/app/login/page.tsx", "apps/ops/src/components/login-form.tsx"],
      },
      {
        title: "Responsive app shell + top bar",
        description: "Create AppShell: desktop sidebar, tablet icon rail, mobile hidden sidebar. Add TopBar with page title and top-right avatar menu (Account, Notifications, Settings, Sign out).",
        commit: "feat(ops): add responsive app shell with top bar",
        files: ["apps/ops/src/components/app-shell.tsx", "apps/ops/src/components/top-bar.tsx", "apps/ops/src/app/(app)/layout.tsx"],
      },
      {
        title: "Mobile bottom navigation",
        description: "Build bottom nav with Home, Inquiries, Schedule, More, and a large center + button that opens /schedule/new for registering a service schedule.",
        commit: "feat(ops): add mobile bottom navigation with quick-action schedule button",
        files: ["apps/ops/src/components/mobile-nav.tsx"],
      },
      {
        title: "Desktop sidebar only on desktop",
        description: "Render the existing Sidebar only on desktop; sync active state with bottom nav and rail.",
        commit: "refactor(ops): render sidebar only on desktop and sync active state",
        files: ["apps/ops/src/components/sidebar.tsx"],
      },
      {
        title: "Replace stub pages with real empty-state shells",
        description: "Convert Jobs, Inventory, Sales, Reports, Staff, Settings from ComingSoonPage to real page shells with headers and mobile padding.",
        commit: "feat(ops): scaffold real page shells for jobs, inventory, sales, reports, staff, settings",
        files: ["apps/ops/src/app/(app)/jobs/page.tsx", "apps/ops/src/app/(app)/inventory/page.tsx", "apps/ops/src/app/(app)/sales/page.tsx", "apps/ops/src/app/(app)/reports/page.tsx", "apps/ops/src/app/(app)/staff/page.tsx", "apps/ops/src/app/(app)/settings/page.tsx"],
      },
    ],
  },
  {
    id: "01",
    title: "Account CRUD & Preferences",
    description: "Build a full account settings page with profile editing, password change, avatar upload, and notification preferences.",
    tasks: [
      {
        title: "Supabase Storage buckets and RLS",
        description: "Create 'avatars' and 'invoices' buckets in Supabase Storage with RLS policies so authenticated ops users can upload/view their own files.",
        commit: "docs(ops): document required Supabase Storage buckets and RLS policies",
        files: ["docs/supabase-storage-setup.md"],
        manual: true,
      },
      {
        title: "Full account CRUD page",
        description: "Rename/extend /profile to /account. Add editable name, email, phone, password change, and avatar upload to Supabase Storage.",
        commit: "feat(ops): add full account CRUD with avatar upload",
        files: ["apps/ops/src/app/(app)/account/page.tsx", "apps/ops/src/app/(app)/profile/page.tsx", "apps/ops/src/app/actions/account.ts"],
      },
      {
        title: "Notification preferences",
        description: "Add toggles for inquiry, schedule reminder, job update, inventory alert, sales, audit-log notifications. Add schedule-reminder threshold input.",
        commit: "feat(ops): add notification preference settings",
        files: ["apps/ops/src/app/(app)/account/page.tsx", "apps/ops/src/app/actions/account.ts"],
      },
      {
        title: "Wire top-bar menu",
        description: "Point avatar menu dropdown links to /account, /settings, and /notifications.",
        commit: "refactor(ops): wire top-bar menu to account, settings, notifications",
        files: ["apps/ops/src/components/top-bar.tsx"],
      },
    ],
  },
  {
    id: "02",
    title: "RBAC & Admin User Management",
    description: "Implement full role-based access control and an admin page to invite staff, edit roles, and deactivate users.",
    tasks: [
      {
        title: "Permission matrix",
        description: "Define role hierarchy and permission constants. Owner/Partner/Bookkeeper/Technician scopes.",
        commit: "feat(ops): add role-based permission matrix",
        files: ["apps/ops/src/lib/permissions.ts"],
      },
      {
        title: "Server and client RBAC guards",
        description: "Create requirePermission server guard and PermissionGate client wrapper. admin@syntaxure.dev always passes.",
        commit: "feat(ops): add server and client RBAC guards",
        files: ["apps/ops/src/lib/require-permission.ts", "apps/ops/src/components/permission-gate.tsx"],
      },
      {
        title: "Staff management page",
        description: "Replace /staff stub with real list, invite new staff via Supabase auth invite, edit role, deactivate/reactivate.",
        commit: "feat(ops): add staff management with role editing",
        files: ["apps/ops/src/app/(app)/staff/page.tsx", "apps/ops/src/app/actions/staff.ts"],
      },
      {
        title: "Enforce RBAC across routes and actions",
        description: "Protect settings, staff, reports, sales actions. Hide menu items client-side by role.",
        commit: "feat(ops): enforce RBAC across routes and actions",
        files: ["apps/ops/src/app/(app)/*/page.tsx", "apps/ops/src/components/mobile-nav.tsx", "apps/ops/src/components/sidebar.tsx"],
      },
      {
        title: "Seed super admin",
        description: "Ensure StaffMember record for admin@syntaxure.dev has role OWNER. This can be a one-time Prisma seed or direct DB update.",
        commit: "feat(db): seed admin@syntaxure.dev as owner super admin",
        files: ["packages/db/prisma/seed.ts"],
        manual: true,
      },
    ],
  },
  {
    id: "03",
    title: "Customer & Appliance Directory",
    description: "Full CRUD customer directory with linked appliances, reusable pickers, and mobile list → detail pattern.",
    tasks: [
      {
        title: "Customer data layer",
        description: "Create reusable data service for customer CRUD and search.",
        commit: "feat(ops): add customer data layer and CRUD components",
        files: ["apps/ops/src/lib/data/customers.ts", "apps/ops/src/components/customer-form.tsx", "apps/ops/src/components/customer-list.tsx"],
      },
      {
        title: "Customer pages",
        description: "Build /customers list (mobile: name + phone + More → detail), /customers/new, /customers/[id], /customers/[id]/edit.",
        commit: "feat(ops): add customer directory pages",
        files: ["apps/ops/src/app/(app)/customers/page.tsx", "apps/ops/src/app/(app)/customers/new/page.tsx", "apps/ops/src/app/(app)/customers/[id]/page.tsx", "apps/ops/src/app/(app)/customers/[id]/edit/page.tsx"],
      },
      {
        title: "Appliance management",
        description: "Appliance CRUD linked to a customer. Appliance form and list components.",
        commit: "feat(ops): add appliance CRUD linked to customers",
        files: ["apps/ops/src/lib/data/appliances.ts", "apps/ops/src/components/appliance-form.tsx", "apps/ops/src/components/appliance-list.tsx"],
      },
      {
        title: "Mobile customer list pattern",
        description: "On mobile show only name and phone with a More button to the detail page. Keep full table on desktop.",
        commit: "feat(ops): implement mobile list view with detail sub-pages for customers",
        files: ["apps/ops/src/components/customer-list.tsx"],
      },
      {
        title: "Add Customers to More menu",
        description: "Add Customers link to mobile bottom nav More menu and desktop sidebar.",
        commit: "refactor(ops): add customers link to navigation menus",
        files: ["apps/ops/src/components/mobile-nav.tsx", "apps/ops/src/components/sidebar.tsx"],
      },
    ],
  },
  {
    id: "04",
    title: "Jobs Module",
    description: "Complete job lifecycle: list, detail, create from inquiry or scratch, status workflow, technician assignment.",
    tasks: [
      {
        title: "Job data layer",
        description: "Service for getJobs, getJobById, createJob, updateJobStatus, assignTechnician.",
        commit: "feat(ops): add job data layer",
        files: ["apps/ops/src/lib/data/jobs.ts"],
      },
      {
        title: "Job list and detail pages",
        description: "/jobs list with filters; /jobs/[id] detail. Mobile list view with More → detail.",
        commit: "feat(ops): add job list and detail pages",
        files: ["apps/ops/src/app/(app)/jobs/page.tsx", "apps/ops/src/app/(app)/jobs/[id]/page.tsx"],
      },
      {
        title: "Create job and inquiry conversion",
        description: "/jobs/new form with customer/appliance picker; /inquiries/[id]/convert to create a job from an inquiry.",
        commit: "feat(ops): add job creation and inquiry conversion",
        files: ["apps/ops/src/app/(app)/jobs/new/page.tsx", "apps/ops/src/app/(app)/inquiries/[id]/convert/page.tsx", "apps/ops/src/components/job-form.tsx"],
      },
      {
        title: "Job status workflow",
        description: "Status transitions: scheduled → in progress → completed → cancelled. Audit log entry on change.",
        commit: "feat(ops): add job status workflow",
        files: ["apps/ops/src/components/job-status-select.tsx", "apps/ops/src/app/actions/jobs.ts"],
      },
    ],
  },
  {
    id: "05",
    title: "Schedule Module",
    description: "Service scheduling quick-action, calendar views, and reminder engine.",
    tasks: [
      {
        title: "Schedule data layer",
        description: "Service for schedule CRUD and technician availability.",
        commit: "feat(ops): add schedule data layer",
        files: ["apps/ops/src/lib/data/schedule.ts"],
      },
      {
        title: "New service schedule quick-action",
        description: "/schedule/new page opened from center + button. Form includes customer/appliance, job type, preferred date/time, notes.",
        commit: "feat(ops): add new service schedule quick-action page",
        files: ["apps/ops/src/app/(app)/schedule/new/page.tsx", "apps/ops/src/components/schedule-form.tsx"],
      },
      {
        title: "Calendar views",
        description: "/schedule page with month/week/day views. Mobile defaults to agenda/day view.",
        commit: "feat(ops): add responsive calendar views",
        files: ["apps/ops/src/app/(app)/schedule/page.tsx", "apps/ops/src/components/schedule-calendar.tsx"],
      },
      {
        title: "Schedule reminder engine",
        description: "Compute reminders based on user-configured threshold. Trigger notification when job schedule date approaches.",
        commit: "feat(ops): add schedule reminder engine",
        files: ["apps/ops/src/lib/schedule-reminders.ts"],
      },
    ],
  },
  {
    id: "06",
    title: "Inventory Module",
    description: "Inventory catalog with images, stock movements, low-stock alerts, and grid view on mobile/desktop.",
    tasks: [
      {
        title: "Inventory data layer",
        description: "Service for inventory items, stock movements, and low-stock detection.",
        commit: "feat(ops): add inventory data layer",
        files: ["apps/ops/src/lib/data/inventory.ts"],
      },
      {
        title: "Inventory catalog with grid view",
        description: "/inventory shows grid cards with item image, name, stock. Mobile defaults to grid (image-first). List toggle available for desktop.",
        commit: "feat(ops): add inventory catalog with image grid view",
        files: ["apps/ops/src/app/(app)/inventory/page.tsx", "apps/ops/src/components/inventory-card.tsx", "apps/ops/src/components/inventory-grid.tsx"],
      },
      {
        title: "Inventory detail and stock movements",
        description: "/inventory/[id] detail page with stock movement ledger and restock/adjust actions.",
        commit: "feat(ops): add inventory detail and stock movement ledger",
        files: ["apps/ops/src/app/(app)/inventory/[id]/page.tsx", "apps/ops/src/components/stock-movement-form.tsx"],
      },
      {
        title: "Job line items → inventory deductions",
        description: "When job is completed, deduct materials and create StockMovement records.",
        commit: "feat(ops): link job line items to inventory deductions",
        files: ["apps/ops/src/app/actions/jobs.ts", "apps/ops/src/components/job-line-items-form.tsx"],
      },
      {
        title: "Low-stock alerts",
        description: "Dashboard widget and notifications when stock falls below threshold set in settings.",
        commit: "feat(ops): add low-stock alerts",
        files: ["apps/ops/src/lib/data/inventory.ts", "apps/ops/src/components/low-stock-alert.tsx"],
      },
    ],
  },
  {
    id: "07",
    title: "Sales / Invoicing Module",
    description: "Sales transactions, invoice creation from job or direct, payment tracking, VAT, print/export.",
    tasks: [
      {
        title: "Sales data layer",
        description: "Service for sales CRUD, payments, and VAT calculations.",
        commit: "feat(ops): add sales data layer",
        files: ["apps/ops/src/lib/data/sales.ts"],
      },
      {
        title: "Sales list and create",
        description: "/sales list; /sales/new form from job or direct sale; VAT handling per VatType.",
        commit: "feat(ops): add sales and invoicing pages",
        files: ["apps/ops/src/app/(app)/sales/page.tsx", "apps/ops/src/app/(app)/sales/new/page.tsx", "apps/ops/src/components/sale-form.tsx"],
      },
      {
        title: "Sale detail and payment tracking",
        description: "/sales/[id] detail with payment status and record-payment action.",
        commit: "feat(ops): add sale detail and payment tracking",
        files: ["apps/ops/src/app/(app)/sales/[id]/page.tsx", "apps/ops/src/components/payment-form.tsx"],
      },
      {
        title: "Invoice print/export",
        description: "Printable invoice component and PDF export.",
        commit: "feat(ops): add invoice print and export",
        files: ["apps/ops/src/components/invoice-print.tsx"],
      },
    ],
  },
  {
    id: "08",
    title: "Reports Module",
    description: "Dashboard completion and dedicated reports page with date-range filters and export.",
    tasks: [
      {
        title: "Reports data layer",
        description: "Aggregated queries for revenue, job counts, inquiry conversion, inventory status.",
        commit: "feat(ops): add reports data layer",
        files: ["apps/ops/src/lib/data/reports.ts"],
      },
      {
        title: "Complete dashboard widgets",
        description: "Replace Coming Soon cards: Jobs Scheduled, Jobs Completed, Gross Sales; add Jobs by Status chart and Low Stock Alerts.",
        commit: "feat(ops): complete dashboard widgets with live data",
        files: ["apps/ops/src/app/(app)/dashboard/page.tsx", "apps/ops/src/components/dashboard-stats.tsx", "apps/ops/src/components/dashboard-charts.tsx"],
      },
      {
        title: "Reports page with export",
        description: "/reports page with date-range filters and CSV/PDF export.",
        commit: "feat(ops): add reports page with export",
        files: ["apps/ops/src/app/(app)/reports/page.tsx", "apps/ops/src/components/report-filters.tsx"],
      },
    ],
  },
  {
    id: "09",
    title: "Notifications: In-App + Push",
    description: "Notification data model, in-app bell with realtime, and PWA push subscriptions wired to business events.",
    tasks: [
      {
        title: "Notification database model",
        description: "Add Notification model with userId, type, title, body, readAt, metadata. Prisma migration.",
        commit: "feat(db): add Notification model",
        files: ["packages/db/prisma/schema.prisma"],
      },
      {
        title: "In-app notification bell and list",
        description: "Notification bell in top bar with unread count. Dropdown shows recent; /notifications shows full list with mark-as-read.",
        commit: "feat(ops): add in-app notification bell and list",
        files: ["apps/ops/src/components/notifications/notification-bell.tsx", "apps/ops/src/app/(app)/notifications/page.tsx"],
      },
      {
        title: "Supabase realtime notifications",
        description: "Subscribe to Notification table changes to update bell count in real time.",
        commit: "feat(ops): wire in-app notifications to supabase realtime",
        files: ["apps/ops/src/components/notifications/notification-provider.tsx"],
      },
      {
        title: "PWA push subscription",
        description: "Generate VAPID keys. Add /api/push/subscribe route, store subscriptions, service worker push handler.",
        commit: "feat(ops): add PWA push notification subscription",
        files: ["apps/ops/src/app/api/push/subscribe/route.ts", "apps/ops/public/sw.js"],
      },
      {
        title: "Notification dispatcher",
        description: "Central createNotification helper that writes DB row, sends pushes, and writes audit log. Hook into inquiry/job/schedule/sales/low-stock events.",
        commit: "feat(ops): dispatch notifications on business events",
        files: ["apps/ops/src/lib/notifications/dispatch.ts", "apps/ops/src/app/actions/*.ts"],
      },
    ],
  },
  {
    id: "10",
    title: "Offline Support & Idempotent Sync",
    description: "IndexedDB offline queue, idempotency keys, auto-sync on reconnect, manual sync fallback, optimistic UI.",
    tasks: [
      {
        title: "Offline action queue",
        description: "Persist pending actions in IndexedDB with idempotencyKey, actionType, payload, timestamp.",
        commit: "feat(ops): add offline action queue with idempotency keys",
        files: ["apps/ops/src/lib/offline/queue.ts"],
      },
      {
        title: "Online/offline status and manual sync",
        description: "Banner when offline; manual Sync now button visible when queued actions exist.",
        commit: "feat(ops): add offline status banner and manual sync",
        files: ["apps/ops/src/components/offline-status.tsx"],
      },
      {
        title: "Idempotent auto-sync engine",
        description: "Process queue once on online event. Each action sent with idempotency key; remove on success. Prevent duplicates.",
        commit: "feat(ops): add idempotent auto-sync engine",
        files: ["apps/ops/src/lib/offline/sync.ts"],
      },
      {
        title: "Idempotency in server actions",
        description: "All mutating server actions accept idempotencyKey and guard against duplicate processing.",
        commit: "feat(ops): enforce idempotency keys in mutating server actions",
        files: ["apps/ops/src/app/actions/*.ts"],
      },
      {
        title: "Optimistic UI for queued actions",
        description: "Show pending state and local-cache results until sync completes.",
        commit: "feat(ops): add optimistic UI for offline actions",
        files: ["apps/ops/src/lib/offline/optimistic.ts"],
      },
    ],
  },
  {
    id: "11",
    title: "Settings Module",
    description: "Settings page with company info, notification thresholds, default VAT, working hours.",
    tasks: [
      {
        title: "Settings database model",
        description: "Add Settings singleton model or single-row table for company config and thresholds.",
        commit: "feat(db): add Settings model and ops settings CRUD",
        files: ["packages/db/prisma/schema.prisma", "apps/ops/src/lib/data/settings.ts"],
      },
      {
        title: "Settings UI",
        description: "/settings page with company info, schedule reminder threshold, low-stock threshold, default VAT type, working hours.",
        commit: "feat(ops): add settings page with notification thresholds",
        files: ["apps/ops/src/app/(app)/settings/page.tsx", "apps/ops/src/components/settings-form.tsx"],
      },
    ],
  },
  {
    id: "12",
    title: "Polish, Accessibility & Performance",
    description: "Final pass: accessibility, loading/error states, responsive audit, and PWA polish.",
    tasks: [
      {
        title: "Accessibility pass",
        description: "Focus states, aria-labels, keyboard navigation for bottom nav and sheets, reduced-motion support.",
        commit: "a11y(ops): improve keyboard and screen-reader support",
        files: ["apps/ops/src/components/mobile-nav.tsx", "apps/ops/src/components/top-bar.tsx"],
      },
      {
        title: "Loading and error states",
        description: "Skeleton screens for lists and detail pages. Error boundaries for PWA shell.",
        commit: "feat(ops): add loading skeletons and error boundaries",
        files: ["apps/ops/src/components/ui/skeleton-list.tsx", "apps/ops/src/app/(app)/error.tsx"],
      },
      {
        title: "Responsive audit",
        description: "Test all pages on phone/tablet/desktop. Fix overflow, touch targets, font sizes.",
        commit: "style(ops): responsive polish across all pages",
        files: ["apps/ops/src/app/globals.css"],
      },
    ],
  },
];

const manualTasks = [
  {
    title: "Configure Supabase Storage buckets",
    description: "Create 'avatars' and 'invoices' buckets. Enable public URL access for avatars. Add RLS policies so authenticated users can upload/view their own files.",
  },
  {
    title: "Generate VAPID keys for push notifications",
    description: "Run 'npx web-push generate-vapid-keys' and add VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY to Vercel env vars (Production, Preview, Development).",
  },
  {
    title: "Seed super admin",
    description: "Ensure StaffMember record for admin@syntaxure.dev has role OWNER. One-time Prisma seed or direct DB update.",
  },
  {
    title: "Configure Supabase realtime",
    description: "Enable realtime on the Notification table in Supabase Dashboard so the bell updates live.",
  },
  {
    title: "PWA icon assets",
    description: "Replace placeholder icons in apps/ops/public/icons/ with final brand assets (192x192, 512x512, maskable).",
  },
  {
    title: "Vercel env var verification",
    description: "Verify NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, DATABASE_URL, and SUPABASE_SERVICE_ROLE_KEY are set for Production and Preview.",
  },
];

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const COMMON_CSS = `
:root {
  --bg: #0b0f19;
  --surface: #111827;
  --surface-2: #1f2937;
  --text: #f3f4f6;
  --text-muted: #9ca3af;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
  --border: #374151;
  --radius: 12px;
  --shadow: 0 10px 30px rgba(0,0,0,0.35);
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  min-height: 100vh;
}
a { color: var(--primary); text-decoration: none; }
a:hover { text-decoration: underline; }
.container { width: min(1200px, 92%); margin: 0 auto; }

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(11,15,25,0.85);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
  padding: 14px 0;
}
.sticky-header .inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.sticky-header h1 { margin: 0; font-size: 1.15rem; }
.progress-wrap {
  flex: 1;
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.progress-bar {
  flex: 1;
  height: 10px;
  background: var(--surface-2);
  border-radius: 999px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, var(--primary), #06b6d4);
  border-radius: 999px;
  transition: width 0.5s ease;
}
.progress-text { font-weight: 700; font-size: 0.95rem; white-space: nowrap; }

main { padding: 28px 0 60px; }

.hero { margin-bottom: 28px; }
.hero h2 { margin: 0 0 8px; font-size: clamp(1.4rem, 4vw, 2rem); }
.hero p { margin: 0; color: var(--text-muted); max-width: 680px; }

.phase-list { display: grid; gap: 16px; }
.phase-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  display: grid;
  grid-template-columns: 48px 1fr auto;
  gap: 16px;
  align-items: center;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}
.phase-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
  box-shadow: var(--shadow);
}
.phase-badge {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-weight: 800;
  background: var(--surface-2);
  color: var(--primary);
  font-size: 0.9rem;
}
.phase-info h3 { margin: 0 0 4px; font-size: 1.05rem; }
.phase-info p { margin: 0; color: var(--text-muted); font-size: 0.9rem; }
.phase-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}
.phase-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.phase-progress-bar {
  width: 80px;
  height: 6px;
  background: var(--surface-2);
  border-radius: 999px;
  overflow: hidden;
}
.phase-progress-fill {
  height: 100%;
  background: var(--success);
  border-radius: 999px;
  transition: width 0.4s ease;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn:hover { background: var(--primary); border-color: var(--primary); text-decoration: none; }
.btn-primary { background: var(--primary); border-color: var(--primary); }
.btn-primary:hover { background: var(--primary-hover); }

.section { margin-top: 40px; }
.section h2 { margin: 0 0 16px; font-size: 1.25rem; }
.manual-list { display: grid; gap: 12px; }
.manual-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}
.manual-card h4 { margin: 0 0 6px; font-size: 1rem; }
.manual-card p { margin: 0; color: var(--text-muted); font-size: 0.9rem; }

.phase-detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.phase-detail-header h2 { margin: 0; font-size: clamp(1.3rem, 4vw, 1.8rem); }
.phase-detail-header p { margin: 6px 0 0; color: var(--text-muted); }

.task-list { display: grid; gap: 12px; }
.task-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.task-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.task-row:hover { background: rgba(59,130,246,0.08); }
.task-row input[type="checkbox"] {
  width: 22px;
  height: 22px;
  accent-color: var(--success);
  cursor: pointer;
}
.task-title { font-weight: 600; }
.task-title.done { text-decoration: line-through; color: var(--text-muted); }
.task-badges { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.badge {
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 999px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.badge-manual { background: rgba(245,158,11,0.15); color: var(--warning); border: 1px solid rgba(245,158,11,0.3); }
.badge-db { background: rgba(6,182,212,0.15); color: #06b6d4; border: 1px solid rgba(6,182,212,0.3); }

.task-body {
  display: none;
  padding: 0 16px 16px 52px;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.92rem;
}
.task-body.open { display: block; }
.task-body p { margin: 12px 0 0; }
.task-body ul { margin: 8px 0 0; padding-left: 18px; }
.task-body code {
  background: var(--surface-2);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
  color: var(--text);
}

@media (max-width: 640px) {
  .sticky-header .inner { flex-direction: column; align-items: stretch; }
  .progress-wrap { width: 100%; }
  .phase-card {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .phase-badge { width: 40px; height: 40px; }
  .phase-meta { justify-content: space-between; width: 100%; }
  .phase-progress-bar { width: 60px; }
  .task-row { grid-template-columns: auto 1fr; }
  .task-badges { grid-column: 1 / -1; justify-content: flex-start; }
  .task-body { padding-left: 36px; }
}

footer {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
  padding: 30px 0;
  border-top: 1px solid var(--border);
}
`.trim();

const COMMON_JS = `
(function() {
  const phases = document.querySelectorAll('[data-phase-id]');
  const checkboxes = document.querySelectorAll('input[type="checkbox"][data-task-key]');

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem('fieldops-tracker') || '{}');
    } catch { return {}; }
  }
  function saveState(state) {
    localStorage.setItem('fieldops-tracker', JSON.stringify(state));
  }

  function updateUI() {
    const state = loadState();
    let total = 0;
    let done = 0;

    for (const cb of checkboxes) {
      cb.checked = !!state[cb.dataset.taskKey];
      const row = cb.closest('.task-row');
      const title = row.querySelector('.task-title');
      if (cb.checked) title.classList.add('done');
      else title.classList.remove('done');
    }

    for (const phase of phases) {
      const pid = phase.dataset.phaseId;
      const pChecks = document.querySelectorAll('input[data-task-key^="task-${pid}-"]');
      const pDone = Array.from(pChecks).filter(c => c.checked).length;
      const pct = pChecks.length ? Math.round((pDone / pChecks.length) * 100) : 0;
      total += pChecks.length;
      done += pDone;

      const fill = phase.querySelector('.phase-progress-fill');
      const count = phase.querySelector('.phase-count');
      if (fill) fill.style.width = '${pct}%';
      if (count) count.textContent = '${pDone}/${pChecks.length}';
    }

    const globalPct = total ? Math.round((done / total) * 100) : 0;
    const globalFill = document.getElementById('global-progress-fill');
    const globalText = document.getElementById('global-progress-text');
    if (globalFill) globalFill.style.width = '${globalPct}%';
    if (globalText) globalText.textContent = '${globalPct}% complete';
  }

  for (const cb of checkboxes) {
    cb.addEventListener('change', () => {
      const state = loadState();
      state[cb.dataset.taskKey] = cb.checked;
      saveState(state);
      updateUI();
    });
  }

  for (const row of document.querySelectorAll('.task-row')) {
    row.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') return;
      const body = row.nextElementSibling;
      if (body?.classList.contains('task-body')) {
        body.classList.toggle('open');
      }
    });
  }

  updateUI();
})();
`.trim();

function renderIndex() {
  const cards = phases.map(p => {
    const taskCount = p.tasks.length;
    return `
      <article class="phase-card" data-phase-id="${p.id}">
        <div class="phase-badge">P${p.id}</div>
        <div class="phase-info">
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.description)}</p>
        </div>
        <div class="phase-meta">
          <div class="phase-progress">
            <div class="phase-progress-bar"><div class="phase-progress-fill" style="width:0%"></div></div>
            <span class="phase-count">0/${taskCount}</span>
          </div>
          <a class="btn btn-primary" href="phase-${p.id}.html">Details</a>
        </div>
      </article>`;
  }).join("\n");

  const manualItems = manualTasks.map(m => `
      <div class="manual-card">
        <h4>${escapeHtml(m.title)}</h4>
        <p>${escapeHtml(m.description)}</p>
      </div>`).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FieldOps Ops App — Implementation Tracker</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="sticky-header">
    <div class="container inner">
      <h1>FieldOps Ops Tracker</h1>
      <div class="progress-wrap">
        <div class="progress-bar"><div class="progress-fill" id="global-progress-fill"></div></div>
        <span class="progress-text" id="global-progress-text">0% complete</span>
      </div>
    </div>
  </header>

  <main class="container">
    <section class="hero">
      <h2>Full Ops Implementation Roadmap</h2>
      <p>PWA, offline sync, RBAC, customer/appliance directory, jobs, schedule, inventory, sales, reports, notifications, and polish. Click any phase to view tasks.</p>
    </section>

    <section class="phase-list">
${cards}
    </section>

    <section class="section">
      <h2>Manual Tasks</h2>
      <div class="manual-list">
${manualItems}
      </div>
    </section>
  </main>

  <footer class="container">
    <p>Progress is saved locally in your browser. Commit each task with a Conventional Commit to maintain semantic versioning and release tags.</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>
`;
}

function renderPhase(phase, prevPhase, nextPhase) {
  const tasksHtml = phase.tasks.map((t, idx) => {
    const manualBadge = t.manual ? '<span class="badge badge-manual">Manual</span>' : "";
    const dbBadge = t.files.some(f => f.includes("db/prisma")) ? '<span class="badge badge-db">DB</span>' : "";
    const filesHtml = t.files.map(f => `              <li><code>${escapeHtml(f)}</code></li>`).join("\n");
    return `
      <div class="task-item" data-task-key="task-${phase.id}-${idx}">
        <div class="task-row">
          <input type="checkbox" data-task-key="task-${phase.id}-${idx}" aria-label="Mark task complete" />
          <span class="task-title">${escapeHtml(t.title)}</span>
          <div class="task-badges">${manualBadge}${dbBadge}</div>
        </div>
        <div class="task-body">
          <p>${escapeHtml(t.description)}</p>
          <p><strong>Commit:</strong> <code>${escapeHtml(t.commit)}</code></p>
          <ul>
${filesHtml}
          </ul>
        </div>
      </div>`;
  }).join("\n");

  const navLinks = [
    prevPhase ? `<a class="btn" href="phase-${prevPhase.id}.html">← P${prevPhase.id}</a>` : "",
    '<a class="btn btn-primary" href="index.html">All Phases</a>',
    nextPhase ? `<a class="btn" href="phase-${nextPhase.id}.html">P${nextPhase.id} →</a>` : "",
  ].filter(Boolean).join("\n      ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>P${phase.id} — ${escapeHtml(phase.title)} | FieldOps Tracker</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="sticky-header">
    <div class="container inner">
      <h1>P${phase.id} — ${escapeHtml(phase.title)}</h1>
      <div class="progress-wrap">
        <div class="progress-bar"><div class="progress-fill" id="global-progress-fill"></div></div>
        <span class="progress-text" id="global-progress-text">0% complete</span>
      </div>
    </div>
  </header>

  <main class="container">
    <div class="phase-detail-header">
      <div>
        <h2>${escapeHtml(phase.title)}</h2>
        <p>${escapeHtml(phase.description)}</p>
      </div>
    </div>

    <div style="margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
      ${navLinks}
    </div>

    <section class="task-list" data-phase-id="${phase.id}">
${tasksHtml}
    </section>

    <div style="margin-top: 24px; display: flex; gap: 10px; flex-wrap: wrap;">
      ${navLinks}
    </div>
  </main>

  <footer class="container">
    <p>Tap a task row to expand full details. Checkboxes save locally in your browser.</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>
`;
}

function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(join(OUTPUT_DIR, "styles.css"), COMMON_CSS, "utf-8");
  writeFileSync(join(OUTPUT_DIR, "script.js"), COMMON_JS, "utf-8");
  writeFileSync(join(OUTPUT_DIR, "index.html"), renderIndex(), "utf-8");

  phases.forEach((phase, i) => {
    const prev = phases[i - 1] || null;
    const next = phases[i + 1] || null;
    writeFileSync(join(OUTPUT_DIR, `phase-${phase.id}.html`), renderPhase(phase, prev, next), "utf-8");
  });

  console.log(`Generated ${phases.length + 1} HTML files, styles.css, and script.js in ${OUTPUT_DIR}`);
}

main();
