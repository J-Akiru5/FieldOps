# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0](https://github.com/J-Akiru5/FieldOps/compare/v1.4.1...v1.5.0) (2026-07-08)


### Features

* **db:** add comprehensive mock data seeder with Prisma seed script ([6a6474f](https://github.com/J-Akiru5/FieldOps/commit/6a6474f2651913ce1fc79148d2a9e6ca398bcd3f))
* **db:** add db:push and db:reset scripts to package.json ([10c8804](https://github.com/J-Akiru5/FieldOps/commit/10c8804a25cbc96fda12b264fabf271b5a26bf42))
* **ops:** add partnership ledger and equity accounting system ([#19](https://github.com/J-Akiru5/FieldOps/issues/19)) ([a0fb0be](https://github.com/J-Akiru5/FieldOps/commit/a0fb0be4e654ed802b6ff453ab877202eed941fa))
* **ops:** jobs UI overhaul, inventory CRUD, reports/ledger crash fix ([112eaaa](https://github.com/J-Akiru5/FieldOps/commit/112eaaab2343cd139703cbff64af26bc43198472))
* **ops:** modern schedule calendar with week/day/month/list views ([727fbda](https://github.com/J-Akiru5/FieldOps/commit/727fbda429727553097c8e2915636db61ee01286))
* **ops:** modernize ledger page with 4-zone layout and analytics ([d8a13cb](https://github.com/J-Akiru5/FieldOps/commit/d8a13cb96b516f9561d24907e811a67366864afc))
* role-aware dashboard redesign, ledger search, audit log page ([ca07c21](https://github.com/J-Akiru5/FieldOps/commit/ca07c214ddf099b11cb6644dd5b26292a4037a4f))


### Bug Fixes

* add DATABASE_URL and DIRECT_URL env vars to CI build step ([c2f809c](https://github.com/J-Akiru5/FieldOps/commit/c2f809c59a68b2fdacd66afc6c50cb921af89a03))
* add DIRECT_URL to turbo.json globalEnv ([0a4d78b](https://github.com/J-Akiru5/FieldOps/commit/0a4d78bf57fe7b3013dd6b82e9d12c5075581186))
* add DIRECT_URL to turbo.json globalEnv ([#26](https://github.com/J-Akiru5/FieldOps/issues/26)) ([27820ff](https://github.com/J-Akiru5/FieldOps/commit/27820ffbc4f938b39ace8fce1897c0d35e8ce1a1))
* add migrate deploy and Prisma engine tracing for Vercel ([#24](https://github.com/J-Akiru5/FieldOps/issues/24)) ([f69ea33](https://github.com/J-Akiru5/FieldOps/commit/f69ea33b54f2b6dae1ccd7fc8e260d2604d8e7e7))
* add migrate deploy to build and Prisma engine tracing for Vercel ([baa2c0a](https://github.com/J-Akiru5/FieldOps/commit/baa2c0a5670353367796f92be28276e2f63e7777))
* add Prisma binaryTargets for Vercel production runtime ([#23](https://github.com/J-Akiru5/FieldOps/issues/23)) ([39ff749](https://github.com/J-Akiru5/FieldOps/commit/39ff749f9af2e554ebb668bebd0ef80f091826ca))
* **db:** always cache Prisma singleton on globalThis, add DIRECT_URL to CI ([3f30537](https://github.com/J-Akiru5/FieldOps/commit/3f3053756c552ffdcd861b18274428e5d545f076))
* **db:** always cache Prisma singleton on globalThis, add DIRECT_URL to CI ([297af0a](https://github.com/J-Akiru5/FieldOps/commit/297af0a4f9e83e39bfae4f643e0e06d70195510d))
* **db:** split Prisma datasource url and directUrl for pooler mode ([1960380](https://github.com/J-Akiru5/FieldOps/commit/196038058a1482439312b90f1420b0656f405733))
* jobs Decimal serialization and seed authUserId lookup ([417f96c](https://github.com/J-Akiru5/FieldOps/commit/417f96cd32f90b079637abdc897d06c7dd041e96))
* **ops:** add avatar upload, storage docs, and favicon ([4963c00](https://github.com/J-Akiru5/FieldOps/commit/4963c0047c0b1d67ecc88bd30d3cc95453da53a6))
* **ops:** add error handling to schedule and jobs pages, exclude Decimal fields from serialization ([ca68a48](https://github.com/J-Akiru5/FieldOps/commit/ca68a482052e9dd9fd0cefda2981ddf5aa289b00))
* **ops:** add favicon, exclude manifest/sw from middleware, pre-complete tracker ([c518118](https://github.com/J-Akiru5/FieldOps/commit/c518118b9c1fd646552aff8f8b8dae595df511b4))
* **ops:** error handling for schedule and jobs pages ([4394c08](https://github.com/J-Akiru5/FieldOps/commit/4394c081caf248d6844b9f852557f61b29604756))
* **ops:** jobs crash and modernize jobs/inquiries ([625e5db](https://github.com/J-Akiru5/FieldOps/commit/625e5db5cc4f4b9de8e039623c4e9ba799147857))
* resolve build errors and apply final hardening pass ([09cc430](https://github.com/J-Akiru5/FieldOps/commit/09cc430a47f616d9546849b84ed03b7bf9a7ed8f))

## [1.10.0](https://github.com/J-Akiru5/FieldOps/compare/v1.9.0...v1.10.0) (2026-07-08)

### Added

- **ops:** Role-aware dashboard with two-tier layout: Tier 1 "Today" (Inquiries, Jobs Scheduled, Jobs Completed, Low Stock Alerts) and Tier 2 "Business Health" (Gross Sales, Net Profit, Your Share).
- **ops:** Dashboard stat cards are now clickable links to their respective pages.
- **ops:** Mobile 2x2 grid for Tier 1 cards; desktop two-column panel layout (Recent Inquiries wider left, Jobs by Status + Low Stock stacked right).
- **ops:** Personalized "Your Share" card on dashboard for OWNER/PARTNER roles — shows net entitlement from the 50/50 ledger.
- **ops:** Technician dashboard: "My Jobs Today" + Schedule shortcut; no financials.
- **ops:** Bookkeeper dashboard: Business Health tier front and center, Today tier de-emphasized.
- **ops:** Ledger page search — filters entries by particulars, remarks, partner name, job label in real-time.
- **ops:** Audit log page with filters (entity, action, actor, date range), pagination, and actor list.

### Changed

- **ops:** Dashboard data layer now fetches equity summary (net profit + partner share) for the current month.
- **ops:** Dashboard low stock stat uses threshold-based alert count instead of zero-quantity-only count.
- **ops:** Dashboard fetches technician's jobs-for-today count for personalized technician view.

### Migration Notes

- Audit log migration (`20260708000000_add_audit_log`) adds `AuditLog` table. The build script runs `prisma migrate deploy` automatically, but if deploying outside the build pipeline, run:
  ```
  pnpm --filter @syntaxure/db exec prisma migrate deploy
  ```

## [1.9.0](https://github.com/J-Akiru5/FieldOps/compare/v1.8.0...v1.9.0) (2026-07-08)

### Added

- **ops:** Ledger page modern redesign — 4-zone layout (header, filter bar, KPI strip, two-column body with analytics sidebar).
- **ops:** KPI cards with % change vs last month badges (TrendingUp/TrendingDown icons).
- **ops:** SVG donut chart for cash summary breakdown (income/expenses/partner draw) — zero new dependencies.
- **ops:** Top Categories sidebar card with progress bars (client-computed from visible entries).
- **ops:** Recent Activity timeline feed (last 10 entries).
- **ops:** Right slide-in panel replaces center modal for create/edit — Type pill toggles (Income/Expense/Draw), Particulars as textarea, ₱-prefixed amount input.
- **ops:** Edit functionality via kebab menu (⋮) — pre-fills slide-in panel with entry data, dispatches `updateLedgerEntryAction`.
- **ops:** Client-side filters (Category, Type, Partner/Job) — no page reload needed.
- **ops:** Client-side pagination (10 per page) with page controls.
- **ops:** Grid/list view toggle for entries table.
- **ops:** CSV export of filtered entries.

### Changed

- **ops:** Ledger page fetches prior-month equity summary for % change badges.
- **ops:** All `LedgerEntry` job includes now select `customer.displayName` for richer job labels.
- **data:** Added `getRecentActivity(limit)` to `lib/data/ledger.ts`.

## [1.8.0](https://github.com/J-Akiru5/FieldOps/compare/v1.7.0...v1.8.0) (2026-07-08)

### Added

- **ops:** Inventory CRUD — add, edit, adjust stock, delete items with dialogs (`inventory-client.tsx`).
- **ops:** Schedule calendar redesign — week view with 30-min time grid, day view, month view, list view, event cards, sidebar with summary/reminders/unassigned/low-stock widgets.
- **ops:** Jobs list card grid with search, status filter, color-coded type/status badges, inline status changes.
- **ops:** Inquiries card grid with source icons (phone/email/web/walk-in), message preview, pagination, inline status selector.
- **ops:** New Job form — sections for Customer (searchable combobox + quick-add), Job Details (serviceCategory, priority, description, estimatedDuration), Schedule, Pricing with live Job Summary sidebar.
- **ops:** Job schema fields — `description`, `serviceCategory`, `priority`, `estimatedDuration` (migration).
- **db:** Job `notes` field (migration `20260708000000_add_job_notes`).

### Changed

- **ops:** Reports page now uses `getReportMetrics()` data-layer function instead of inline Prisma queries (fixes crash from `fields.*` pattern).
- **ops:** Ledger page wrapped fetches in `Promise.allSettled` with safe fallbacks (fixes crash from column-reference comparison).
- **ops:** Inventory `getLowStockItems()` filters in memory instead of comparing columns directly (fixes crash).
- **ops:** Job queries (`getJobs`, `getJobById`, `jobs/[id]/page.tsx`) use explicit `select` instead of `include` — no longer depend on columns that may not exist if a migration is pending (fixes `/jobs` crash).

### Fixed

- Reports and Ledger production crashes caused by Prisma `fields.*` column references.
- Jobs page crash when `notes` column migration hadn't been applied on production.

### Migration Notes

- Two new migrations add columns to the `Job` table (`notes`, `description`, `serviceCategory`, `priority`, `estimatedDuration`). The build script runs `prisma migrate deploy` automatically, but if you deploy directly (outside the build), run:
  ```
  pnpm --filter @syntaxure/db exec prisma migrate deploy
  ```

## [1.7.0](https://github.com/J-Akiru5/FieldOps/compare/v1.6.0...v1.7.0) (2026-07-08)

### Features

- **ops:** add CustomerType enum (INDIVIDUAL, BUSINESS, GOVERNMENT) with customer entity type support ([28f0a6a](https://github.com/J-Akiru5/FieldOps/commit/28f0a6a))
- **ops:** add quick-add customer inline form on schedule screen with searchable combobox ([28f0a6a](https://github.com/J-Akiru5/FieldOps/commit/28f0a6a))
- **db:** rename customer fields via @map (name→displayName, phone→contactPhone, email→contactEmail) with backward-compatible DB columns ([28f0a6a](https://github.com/J-Akiru5/FieldOps/commit/28f0a6a))
- **ops:** add phone-based duplicate detection on quick-add with non-blocking warning ([28f0a6a](https://github.com/J-Akiru5/FieldOps/commit/28f0a6a))
- **ops:** add `/api/customers/search` endpoint for live combobox queries ([28f0a6a](https://github.com/J-Akiru5/FieldOps/commit/28f0a6a))

### Migration Notes

- New `CustomerType` enum and `contactPersonName`/`notes` columns require migration. Run `pnpm --filter @syntaxure/db exec prisma migrate dev` before deploying.

## [1.6.0](https://github.com/J-Akiru5/FieldOps/compare/v1.5.0...v1.6.0) (2026-07-07)

### Features

- **ops:** add partnership ledger and equity accounting system with LedgerEntry model, soft-void audit trail, and 50/50 profit split service ([f5a2512](https://github.com/J-Akiru5/FieldOps/commit/f5a2512))
- **db:** add `transactionDate` field to `SalesTransaction` for operational-date-aligned equity reporting ([f5a2512](https://github.com/J-Akiru5/FieldOps/commit/f5a2512))

### Migration Notes

- New `LedgerEntry` model and `LedgerCategory` enum require migration. Run `pnpm --filter @syntaxure/db exec prisma migrate dev` before deploying.

## [1.5.0](https://github.com/J-Akiru5/FieldOps/compare/v1.4.1...v1.5.0) (2026-07-07)


### Features

* **db:** add comprehensive mock data seeder with Prisma seed script ([6a6474f](https://github.com/J-Akiru5/FieldOps/commit/6a6474f84c0ed16b39b48d42e52a26b1a9149772))
* **db:** add db:push and db:reset scripts to package.json ([10c8804](https://github.com/J-Akiru5/FieldOps/commit/10c88041a43d7e4db7a3a10a5f6b58f27133275a))


### Bug Fixes

* **ops:** add avatar upload, storage docs, and favicon ([4963c00](https://github.com/J-Akiru5/FieldOps/commit/4963c00a4af62f41a0de2e8f7da4002e467c828d))
* **ops:** add favicon, exclude manifest/sw from middleware, pre-complete tracker ([c518118](https://github.com/J-Akiru5/FieldOps/commit/c518118a7836677e7f48e3eb33e0cf397e4a7ec6))
* **ops:** jobs Decimal serialization and seed authUserId lookup ([417f96c](https://github.com/J-Akiru5/FieldOps/commit/417f96c6889482d03e8f335952d49e4a9c7f3ab8))
* resolve build errors and apply final hardening pass ([09cc430](https://github.com/J-Akiru5/FieldOps/commit/09cc430a33c4d82e22e43c957d5c85c0468f87ee))


### Chores

* stop tracking generated PWA service worker files ([d294428](https://github.com/J-Akiru5/FieldOps/commit/d294428a7a8c81767b3d5d03c75b6e3a7f5034f1))

## [1.4.1](https://github.com/J-Akiru5/FieldOps/compare/v1.4.0...v1.4.1) (2026-07-06)


### Bug Fixes

* harden server actions with auth checks and error handling ([8e8540a](https://github.com/J-Akiru5/FieldOps/commit/8e8540a0609dce39106364fe0c41392bfbcd4c23))
* **ops:** harden server actions and data layers with proper auth, error handling, and types ([fed1f7f](https://github.com/J-Akiru5/FieldOps/commit/fed1f7fec69d7aa1579d7ff106aa4ede8f071b06))

## [1.4.0](https://github.com/J-Akiru5/FieldOps/compare/v1.3.0...v1.4.0) (2026-07-06)


### Features

* **ops:** add AppSettings and Notification models, settings page with company config and thresholds ([82af013](https://github.com/J-Akiru5/FieldOps/commit/82af013dfdc3bc9be50e9230871dbf945419a089))
* **ops:** add notifications, offline status, error boundaries, and a11y ([63aac86](https://github.com/J-Akiru5/FieldOps/commit/63aac8641714f749bdbfcb0120bfe71f2cfccd9c))
* **ops:** add sales list with payment tracking, reports dashboard, and live dashboard widgets ([6ace9ca](https://github.com/J-Akiru5/FieldOps/commit/6ace9cace3cc0ad5659ff3c76d1179642f713b6e))

## [1.3.0](https://github.com/J-Akiru5/FieldOps/compare/v1.2.0...v1.3.0) (2026-07-06)


### Features

* **ops:** add jobs module with list, detail, create, and inquiry conversion ([ddf76ee](https://github.com/J-Akiru5/FieldOps/commit/ddf76ee808fdb4c022e54748fa9be9cf46a6306e))
* **ops:** add sales and reports data layers ([748a0a7](https://github.com/J-Akiru5/FieldOps/commit/748a0a7b54bb9bd5ab2ca173adc7da771d162df4))
* **ops:** add schedule quick-action page and inventory data layer ([5792ea9](https://github.com/J-Akiru5/FieldOps/commit/5792ea95340ee22f626bc500ae13d817ab9e9a4c))

## [1.2.0](https://github.com/J-Akiru5/FieldOps/compare/v1.1.1...v1.2.0) (2026-07-06)


### Features

* **ops:** add customer directory CRUD with list, detail, and edit pages ([0508ffa](https://github.com/J-Akiru5/FieldOps/commit/0508ffa122ccbcd5e0b1ad16a90b4bf4deeb131b))
* **ops:** add full account CRUD with editable name and password reset ([b784be7](https://github.com/J-Akiru5/FieldOps/commit/b784be711ccdc212a7d1df3e944674846a233157))
* **ops:** add mobile bottom navigation with quick-action schedule button ([0ecde34](https://github.com/J-Akiru5/FieldOps/commit/0ecde345f858d3618594d1114b53b0fbfb06db1a))
* **ops:** add PWA manifest, icons, and next-pwa config ([eb8f314](https://github.com/J-Akiru5/FieldOps/commit/eb8f314c06f0b82237c1fedab8bba2f0ccc2a318))
* **ops:** add responsive app shell with top bar ([6424db0](https://github.com/J-Akiru5/FieldOps/commit/6424db0ded7fdb0fbb40fcc88b08c63d921cd162))
* **ops:** add role-based permission matrix, RBAC guards, and staff management ([4b5ad7b](https://github.com/J-Akiru5/FieldOps/commit/4b5ad7b99f4ba489a2691ea481dbf756f28dcdfa))
* **ops:** modernize login page with split-screen layout ([fbf46c1](https://github.com/J-Akiru5/FieldOps/commit/fbf46c1409f0945d1d57a73a8f551311caaf179b))
* **ops:** scaffold real page shells for jobs, inventory, sales, reports, staff, settings, schedule ([1828117](https://github.com/J-Akiru5/FieldOps/commit/1828117f13930b1c290ae3f57a48c0ecf11af8ba))

## [1.1.1](https://github.com/J-Akiru5/FieldOps/compare/v1.1.0...v1.1.1) (2026-07-06)


### Bug Fixes

* wrap middleware & dashboard in try/catch for production resilience ([95e1cdc](https://github.com/J-Akiru5/FieldOps/commit/95e1cdc030d35503df7d17267ced660cf5f73441))
* wrap middleware & dashboard in try/catch for production resilience ([fac5cd8](https://github.com/J-Akiru5/FieldOps/commit/fac5cd8a09aa49c0e9e47cb6fbcaf43d224e47b7))

## [1.1.0](https://github.com/J-Akiru5/FieldOps/compare/v1.0.0...v1.1.0) (2026-07-06)


### Features

* **config:** add status and sidebar color tokens ([00fb28c](https://github.com/J-Akiru5/FieldOps/commit/00fb28c0e137113062eada84e23efbe5fceb739c))
* **ops:** add auth-guard helper to server actions for defense-in-depth ([7f9b464](https://github.com/J-Akiru5/FieldOps/commit/7f9b4648dc24bd5447a79755173e9366d494e97e))
* **ops:** add coming-soon stub pages for all nav items ([cc6b30d](https://github.com/J-Akiru5/FieldOps/commit/cc6b30daa46a54531a901ffd05aa4373349d2f9e))
* **ops:** add inquiries page with status update and add inquiry modal ([950cc48](https://github.com/J-Akiru5/FieldOps/commit/950cc48a3807997328680099b27227638232ca35))
* **ops:** add profile page ([81206ef](https://github.com/J-Akiru5/FieldOps/commit/81206efb31b0a1c823a096a5afc7d3e7ccbca620))
* **ops:** add sidebar and dashboard route group layout ([8e36f6f](https://github.com/J-Akiru5/FieldOps/commit/8e36f6f7f2c54c5fc854d9c333a7fefa48e7d904))
* **ops:** rebuild dashboard with real inquiries and coming-soon cards ([8326262](https://github.com/J-Akiru5/FieldOps/commit/83262621c486100e2fdf3d794c7ffb1aeca55057))
* **site:** visual restyle — header, hero, services, why-us 4-col, CTA banner, footer ([0f040f8](https://github.com/J-Akiru5/FieldOps/commit/0f040f8ff9bfee92df384ddd0d99de12c14ce1be))
* **ui:** add Select, Dialog, Avatar, StatusBadge primitives ([5daca58](https://github.com/J-Akiru5/FieldOps/commit/5daca582c102fcede9eee35f32a8c40521b6cc8c))


### Bug Fixes

* **db:** run prisma generate before tsc in build script ([3c11174](https://github.com/J-Akiru5/FieldOps/commit/3c11174e25fd25db33732bbd071e4aef5bad3820))
* **deps:** regenerate lockfile with radix-ui packages ([5df86dc](https://github.com/J-Akiru5/FieldOps/commit/5df86dc0f6cd60f7970c2e25dcd34d0bb0f7b834))
* **ops:** add explicit return type to requireAuth for TS declaration emit ([07eaf4a](https://github.com/J-Akiru5/FieldOps/commit/07eaf4ac4db4f850f970366f0c7e22e6dc50d190))
* **ops:** extend auth middleware to all protected routes ([9aba253](https://github.com/J-Akiru5/FieldOps/commit/9aba25328ac62d8e5c2223b65909fa4e66c14f9a))

## [1.0.0] - 2026-07-05

### Added

- Monorepo scaffold with pnpm workspaces, Turborepo, Biome, and shared TypeScript/Tailwind config.
- Prisma schema for FieldOps domain: Customer, Appliance, Inquiry, StaffMember, Job, InventoryItem, SalesTransaction, and supporting entities.
- Supabase server/browser client helpers in `packages/db`.
- Shared shadcn/ui component package (`packages/ui`).
- Public marketing site (`apps/site`) with landing page, inquiry form, and thank-you page.
- Real business content for J.R.R. Air-conditioning and Refrigeration Services covering both the Air Conditioning/Refrigeration division and the Electronics Repair division.
- Internal dashboard shell (`apps/ops`) with Supabase Auth email/password login and a protected `/dashboard` route.
- Row-level security baseline for Supabase tables; `Inquiry` table allows anon INSERT from the public form while blocking anon SELECT/UPDATE/DELETE.
- Phase 2+ RLS policy TODOs documented in `docs/rls-todo.md`.
- Husky + lint-staged pre-commit and pre-push hooks.
- GitHub Actions CI workflow.
- Branching and release process documentation in `README.md` and `RELEASING.md`.
