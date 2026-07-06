# Releasing

This project uses a **semi-automated release process** powered by [Conventional Commits](https://www.conventionalcommits.org/). Commit messages are validated automatically; version bumps and changelog entries are computed by `release-please` on `master`.

## Branching model

- `develop` is the default integration branch. Do daily work here or on short-lived feature branches cut from `develop`.
- `master` is the protected production branch. It requires a passing CI status check and must be updated via pull request.
- Flow: `feature/*` → PR into `develop` → merge (advisory bump comment appears) → PR from `develop` into `master` → merge → `release-please` opens its PR → merge that to create the tag and GitHub Release.

## Versioning

This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html):

- **PATCH** (`1.0.x`): bug fixes (`fix:` commits).
- **MINOR** (`1.x.0`): new backward-compatible features (`feat:` commits).
- **MAJOR** (`x.0.0`): breaking changes (`feat!:` or `fix!:` commits, or any commit with `BREAKING CHANGE:` in the footer).

## Commit message convention

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/). The `commit-msg` hook (Husky) enforces this automatically — invalid messages will be rejected.

Valid prefixes: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:`, `revert:`.

## Automated tooling

### commit-msg hook
Validates every commit message against the Conventional Commits spec. Bad messages are rejected at commit time.

### `develop-bump-flag` workflow
When a PR is merged into `develop`, a workflow inspects all commits in that PR and posts an advisory comment on the PR indicating what version bump the promotion would trigger (MAJOR / MINOR / PATCH / NONE). This is informational only — it does not modify any files.

### `release-please` on `master`
Every time new commits land on `master` (after a `develop` → `master` PR is merged), the `release-please` workflow:
1. Scans commits since the last release tag.
2. Computes the correct bump level (major > minor > patch).
3. Opens (or updates) its own PR against `master` with the computed `CHANGELOG.md` entry and `package.json` version bump.

**Merging that `release-please` PR is what creates the git tag and GitHub Release.** This is the one moment where version/tag/changelog become official.

## Release flow

1. **On `develop`**: Make changes, write Conventional Commits, open PR → CI passes → merge. Watch for the advisory bump-level comment from `develop-bump-flag`.

2. **Promote to `master`**: Open PR from `develop` → `master` → CI passes → merge.

3. **`release-please` activates**: Within seconds of the merge to `master`, it opens a PR titled `chore(release): vX.Y.Z` with the correct version and changelog entry.

4. **Merge the release PR**: Review and merge the `release-please` PR. This creates the git tag and GitHub Release. Vercel production deployments for both apps trigger automatically from the `master` push that follows the tag.

5. **Done**: No manual version editing, no hand-written changelog entries, no tag pushing.

## If `release-please` gets the bump level wrong

Because commit messages are written by humans, a mis-tagged commit (e.g. a `feat:` that should have been `docs:`) can cause an incorrect bump. If the `release-please` PR shows the wrong level, simply edit the `package.json` version and `CHANGELOG.md` entry in that PR before merging. The changelog entry is just a list of commit subjects — you can rewrite it freely at that point.

## Vercel production deploys

Pushing to `master` (including from the merged `release-please` PR) automatically triggers Vercel production deployments for both `jrr-fieldops-site` and `jrr-fieldops-ops`.

> Note: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Vercel project Environment Variables before building — these are inlined at build time and required by `@supabase/ssr` client initialization.
