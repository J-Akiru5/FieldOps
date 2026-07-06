# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
