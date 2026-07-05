# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
