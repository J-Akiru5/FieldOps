# FieldOps Design System — Implementation Plan

## Background

Full codebase audit complete. Here is what currently exists:

| Area | State |
|---|---|
| `packages/ui` | 5 shadcn primitives: Button, Input, Textarea, Label, Card. No StatusBadge, no Select, no Dialog. |
| `packages/config/tailwind.config.ts` | Standard shadcn CSS-var token mapping. No custom status colors yet. |
| `apps/site` | Functional, real two-division content. Already has hero image + 4 service icons. Styling is plain. Needs restyle only — **no content changes**. |
| `apps/ops` | Login page (unstyled form), Dashboard (stub), middleware (auth guards `/dashboard`). No sidebar, no inquiries page, no profile page. |
| `packages/db` | Prisma schema fully defined. `Inquiry` table live. Everything else (Job, Inventory, Sales) exists in schema but has zero data and no UI. Supabase auth wired. |

---

## User Review Required

> [!IMPORTANT]
> **Section 0 data guardrail is strictly honored.** The dashboard will show: (a) a real Inquiries stat card + recent inquiries list from live Supabase/Prisma data, and (b) three "Coming Soon" cards for Jobs Scheduled, Jobs Completed, Gross Sales. No fabricated numbers anywhere.

> [!WARNING]
> **The middleware currently only guards `/dashboard`**. All the new ops routes (`/inquiries`, `/profile`, `/jobs`, etc.) need to be added to the middleware matcher so unauthenticated users can't access them. This is a security fix, not scope creep.

> [!NOTE]
> **No new external dependencies** are being introduced for ops build. `recharts` is explicitly deferred to a future phase. All primitives needed (Select, Dialog/Modal, Avatar) will be added to `packages/ui` as shadcn components since Radix UI is already in the dependency tree.

---

## Open Questions

None — all design decisions are resolved below.

---

## Proposed Changes

### Component 1 — `packages/ui` (shared primitives + new StatusBadge)

Add the following shadcn/Radix primitives needed by ops:
- **Select** (`@radix-ui/react-select` — already in pnpm-lock.yaml transitively; needs explicit dep)
- **Dialog** (`@radix-ui/react-dialog`)
- **Avatar** (`@radix-ui/react-avatar`)

Add one new bespoke component:
- **StatusBadge** — pill-shaped label, accepts `status: InquiryStatus | InquirySource | string`, maps to a color variant via a lookup table. Single source of truth for all badge coloring across inquiries page and dashboard.

Export all new components from `packages/ui/src/index.ts` and register their export paths in `package.json`.

---

### Component 2 — `packages/config/tailwind.config.ts`

Extend the shared token set with status/semantic colors that aren't already in CSS vars. These are used as Tailwind utilities in StatusBadge and sidebar active states:

```
status-success:  hsl(142 71% 45%)   // green — Completed
status-warning:  hsl(38 92% 50%)    // amber — Low stock / warning
status-danger:   hsl(0 84% 60%)     // red — Cancelled / urgent
status-info:     hsl(221 83% 53%)   // blue — Scheduled / info
sidebar-bg:      hsl(222 47% 11%)   // ~#1E293B dark navy
sidebar-active:  hsl(221 83% 53%)   // matches primary blue
```

These extend `theme.extend.colors` so they are available as `bg-status-success`, `text-sidebar-bg`, etc.

---

### Component 3 — `apps/site` restyle (layout + visual polish only, no content changes)

#### [MODIFY] [globals.css](file:///s:/Dev/Monorepo/FieldOps/apps/site/src/app/globals.css)
- Adjust CSS variables to match the reference's blue accent more precisely (`--primary: 221 83% 53%` — true blue vs. the current cyan-ish value).
- Add smooth scroll already present; keep accent amber for CTA buttons.

#### [MODIFY] [page.tsx](file:///s:/Dev/Monorepo/FieldOps/apps/site/src/app/page.tsx)
Restyle the following sections **without changing any content**:
- **Header**: sticky nav, logo, "Our Services" + "Book a service" nav links, mobile-responsive.
- **Hero**: already split grid — increase visual weight: larger headline, stronger contrast overlay on image side.
- **Services sections**: apply icon-tile treatment matching reference (icon in colored square, title, short copy, "Learn More" link). Two separate section dividers for Aircon and Electronics remain as-is.
- **"Why Choose Us"**: expand from 3-item to 4-item grid. Copy: Experienced Technicians / Same-Day Response / Transparent Pricing / Local & Responsive.
- **Dark CTA banner**: new section above footer — dark navy background, white text, "Need Help? We're Ready to Serve You" heading, both division phone numbers and "Get in Touch" button.
- **Footer**: proper 3-column grid — Company info + quick links | Aircon division contact | Electronics division contact. Social placeholder icons. Copyright line.
- **Inquiry section**: card styling polish — blue heading accent, slightly larger card shadow.

#### [MODIFY] [thank-you/page.tsx](file:///s:/Dev/Monorepo/FieldOps/apps/site/src/app/thank-you/page.tsx)
- Card-style container with green checkmark, centered. Both division phone numbers. "Back to Home" button. Polish only.

---

### Component 4 — `apps/ops` — Full Build

#### [MODIFY] [middleware.ts](file:///s:/Dev/Monorepo/FieldOps/apps/ops/src/middleware.ts)
Extend protected route check to cover all new routes: `/dashboard`, `/inquiries`, `/profile`, `/jobs`, `/schedule`, `/inventory`, `/sales`, `/reports`, `/staff`, `/settings`.

#### [NEW] Layout shell — `apps/ops/src/app/(dashboard)/layout.tsx`
Route group for all authenticated pages. Renders:
- Fixed dark navy **Sidebar** (width 240px, collapses to icon-only on mobile).
- **Main content area** next to sidebar, scrollable.

#### [NEW] `apps/ops/src/components/sidebar.tsx`
Full sidebar component:
- Syntaxure FieldOps logo + wordmark at top.
- Nav items with Lucide icons: Dashboard, Inquiries, Jobs, Schedule, Inventory, Sales, Reports, Staff, Settings.
- Active route highlighted (blue bg pill, white text).
- User avatar + name + role pinned at bottom (from Supabase auth session).
- Sign-out action.

#### [MODIFY] Move pages into route group
- `apps/ops/src/app/dashboard/page.tsx` → `apps/ops/src/app/(dashboard)/dashboard/page.tsx`

#### [MODIFY] `apps/ops/src/app/(dashboard)/dashboard/page.tsx`
Rebuilt dashboard — server component, fetches real data:
- **Real stat card**: "Inquiries — Last 7 Days" with actual count from Prisma.
- **Coming Soon stat cards** (3): Jobs Scheduled, Jobs Completed, Gross Sales — muted styling, lock icon, "Coming in a future phase" text.
- **Real list**: "Recent Inquiries" — last 5 inquiries from DB with: name, phone, message snippet, StatusBadge for status, relative timestamp.
- **Coming Soon panels** (2): "Jobs by Status" donut area + "Sales Trend" line area — placeholder card with chart icon and coming soon label.
- **Coming Soon list**: "Low Stock Alerts" — same treatment.

#### [NEW] `apps/ops/src/app/(dashboard)/inquiries/page.tsx`
Fully functional Inquiries page:
- Server component: fetch paginated inquiries from Prisma (default 20/page).
- Data table: Contact Name, Phone, Email, Status badge, Source badge, Date (relative).
- **Status update**: inline select dropdown per row — calls a server action to update status (`NEW → CONTACTED → CONVERTED → CLOSED`).
- **"+ Add Inquiry" button**: opens a Dialog modal with a simple form (contactName, phone, email optional, message, source select). Server action creates the record.
- Pagination: previous/next + page indicator.

#### [NEW] `apps/ops/src/app/(dashboard)/profile/page.tsx`
Profile page (real, low-risk):
- Display current user's email (from Supabase auth).
- Name, role from StaffMember table if record exists (graceful fallback if not yet linked).
- Member since date.
- Avatar upload placeholder (UI only — no storage wiring in this pass; label it "Avatar upload coming soon").
- "Change Password" sends a Supabase password reset email.

#### [NEW] Coming Soon stub pages
One shared `<ComingSoonPage>` component, route to it from:
- `/jobs`, `/schedule`, `/inventory`, `/sales`, `/reports`, `/staff`, `/settings`

Each page passes its own icon + title. Component renders centered icon, title, "This feature is planned for a future phase" body, and a "Back to Dashboard" link.

#### [NEW] `apps/ops/src/app/actions/inquiry.ts` (ops server actions)
- `updateInquiryStatus(id, status)` — updates a single inquiry's status.
- `createInquiry(data)` — creates a new inquiry with `source: PHONE | WALK_IN`.

---

## Implementation Order

1. `packages/ui` — add Select, Dialog, Avatar, StatusBadge; update exports
2. `packages/config/tailwind.config.ts` — status colors + sidebar tokens
3. `apps/ops/src/middleware.ts` — extend protected route list
4. `apps/ops` sidebar + route group layout shell
5. `apps/ops` dashboard page (real inquiries stat + coming soon cards)
6. `apps/ops` inquiries page (full real feature)
7. `apps/ops` profile page
8. `apps/ops` coming-soon stub pages for all remaining nav items
9. `apps/site` restyle (page.tsx + globals.css + thank-you)
10. Biome lint + both builds pass

---

## Verification Plan

### Automated
```bash
pnpm biome check .
pnpm --filter @syntaxure/site build
pnpm --filter @syntaxure/ops build
```

### Manual
- Screenshot: public site landing page (all 3 sections visible — hero, services, why-choose-us, CTA banner, footer)
- Screenshot: ops login page (split layout)
- Screenshot: ops dashboard (real inquiries count visible, 3 coming-soon cards clearly labeled)
- Screenshot: ops inquiries page (real table rows, status badge, add inquiry button)
- Screenshot: ops profile page
- Screenshot: one coming-soon stub page (e.g., Jobs)
- Confirm: no fabricated number appears anywhere in any screenshot
