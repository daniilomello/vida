---
description: Run the automated release flow — preflight checks, then npm run release to PR, merge, tag, and sync develop
argument-hint: <version> (e.g. v1.2.3)
---

# Release

Version: $ARGUMENTS

## Context

- Current branch: !`git branch --show-current`
- Git status: !`git status --short`
- Recent tags: !`git tag --sort=-version:refname | head -5`
- Commits on develop since last tag: !`git log $(git describe --tags --abbrev=0)..origin/develop --oneline`

## Your task

### Step 1 — Preflight checks

Verify all of the following before proceeding:

1. You are on the `develop` branch
2. Working tree is clean (no uncommitted changes)
3. Version $ARGUMENTS follows `vMAJOR.MINOR.PATCH` format
4. Version $ARGUMENTS is higher than the most recent tag above

If any check fails, report it and stop — do not proceed.

### Step 2 — Show release scope and confirm

Show the user:
- The version being released: $ARGUMENTS
- The commits that will be included (from context above)
- Estimated version bump type (patch/minor/major) with reasoning

**Ask for explicit confirmation before running the release script.**

### Step 3 — Run the release

After confirmation:

```bash
cd /Users/danilo/www/vida && npm run release -- $ARGUMENTS
```

This script (`scripts/release.mjs`) handles everything end-to-end:
1. Bumps `version` in `package.json`, `frontend/package.json`, and `backend/package.json`, commits, then pushes `develop`
2. Opens a PR from `develop` → `main` titled `release: $ARGUMENTS`
3. Merges the PR immediately
4. Checks out `main`, pulls, creates + pushes the `$ARGUMENTS` tag
5. Checks out `develop`, merges `main` back in, pushes

GitHub Actions (`release.yml`) then automatically creates a GitHub Release with notes compiled from all merged PRs since the previous tag.

### Step 4 — Report

Confirm the tag was pushed and report the GitHub Release URL once Actions complete.
