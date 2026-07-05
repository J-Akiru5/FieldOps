# Syntaxure FieldOps

Field Service Management system with integrated job-costing for J.R.R. Air-conditioning and Refrigeration Services in Iloilo City, Philippines.

## Monorepo structure

```
syntaxure-fieldops/
├── apps/
│   ├── site/    # Public marketing site + inquiry form
│   └── ops/     # Internal dashboard (auth-gated)
├── packages/
│   ├── config/  # Shared Biome, TypeScript, Tailwind config
│   ├── db/      # Prisma schema + Supabase helpers
│   └── ui/      # Shared shadcn/ui components
```

## Getting started

1. Run `pnpm install`.
2. Copy the per-app environment examples to `.env.local` files:
   - `cp apps/site/.env.example apps/site/.env.local`
   - `cp apps/ops/.env.example apps/ops/.env.local`
3. Fill in real Supabase credentials in both `.env.local` files. Next.js reads env files per-app, not from the repo root.
4. Run `pnpm --filter db exec prisma migrate dev --name init`.
5. Apply the RLS baseline: `pnpm --filter db exec prisma db execute --file supabase/migrations/20260105000000_enable_rls_and_inquiry_policy.sql --schema prisma/schema.prisma`.
6. Run `pnpm dev`.

## Branching model

- `develop` is the default working/integration branch.
- `master` is the protected production branch.
- Daily work happens on feature branches cut from `develop`.
- Flow: `feature/*` → PR into `develop` → release PR from `develop` into `master`.

See [RELEASING.md](./RELEASING.md) for the version-bump and tag process.

## Deployments

Two Vercel projects are configured against this repo:

| Project | Root Directory | Production Branch | Environment |
|---------|---------------|-------------------|-------------|
| `jrr-fieldops-site` | `apps/site` | `master` | Production domain |
| `jrr-fieldops-ops` | `apps/ops` | `master` | Production domain |

- `develop` deploys to Preview/staging URLs.
- Only `master` promotes to the production domain.
- Ignored Build Step (`turbo-ignore`) is enabled per project so a change scoped to `apps/ops` does not rebuild `apps/site`, and vice versa.
- Required environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`) are set per project and scoped to Production vs. Preview.

## Tech stack

- pnpm workspaces + Turborepo
- Next.js App Router + TypeScript strict
- Supabase (Postgres + Auth + RLS)
- Prisma
- Tailwind CSS + shadcn/ui
- Biome
