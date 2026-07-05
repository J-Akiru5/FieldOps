# Syntaxure FieldOps

Field Service Management system with integrated job-costing for an aircon and electronics repair/maintenance business in the Philippines.

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

1. Copy `.env.example` to `.env` and fill in your Supabase credentials.
2. Run `pnpm install`.
3. Run `pnpm --filter db exec prisma migrate dev --name init`.
4. Run `pnpm dev`.

## Tech stack

- pnpm workspaces + Turborepo
- Next.js App Router + TypeScript strict
- Supabase (Postgres + Auth + RLS)
- Prisma
- Tailwind CSS + shadcn/ui
- Biome
