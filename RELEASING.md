# Releasing

This repository uses a manual release process suitable for a solo developer. Automating this (e.g. with conventional commits + a release-notes bot) is a fine Phase 2+ improvement, but is not required for v1.0.0.

## Branching model

- `develop` is the default integration branch. Do daily work here or on short-lived feature branches cut from `develop`.
- `master` is the protected production branch. It requires a passing CI status check and must be updated via pull request.
- Flow: `feature/*` → PR into `develop` → PR from `develop` into `master` for releases.

## Versioning

This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html):

- **PATCH** (`1.0.x`): bug fixes and content-only changes.
- **MINOR** (`1.x.0`): new backward-compatible features, e.g. a new dashboard zone.
- **MAJOR** (`x.0.0`): breaking changes, e.g. schema changes that require data migration or a restructured API.

## Release steps

1. Make sure `develop` is green:
   ```bash
   pnpm --filter db exec prisma validate
   pnpm biome check .
   pnpm --filter site build
   pnpm --filter ops build
   ```
2. Update the root `package.json` version field to the new version.
3. Add a new dated entry to the top of `CHANGELOG.md` describing what changed, grouped under `Added`, `Changed`, and `Fixed` per Keep a Changelog convention.
4. Commit the version and changelog changes:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore(release): vX.Y.Z"
   ```
5. Push `develop` and open a PR from `develop` → `master`.
6. Wait for CI to pass, then merge the PR.
7. On the updated `master` branch, create and push the release tag:
   ```bash
   git checkout master
   git pull origin master
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```
8. Vercel production deployments are triggered automatically from pushes to `master` for both `apps/site` and `apps/ops`.
