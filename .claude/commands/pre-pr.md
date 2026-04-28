---
description: Run pre-PR verification (Biome lint+format + tests) for frontend, backend, or both — auto-detects from changed files
argument-hint: [frontend|backend|both] — optional, auto-detects if omitted
---

# Pre-PR Verification

Scope: $ARGUMENTS

## Context

- Changed files (staged + unstaged vs develop): !`git diff --name-only origin/develop...HEAD`
- Current branch: !`git branch --show-current`

## Your task

Run all applicable pre-PR checks. If $ARGUMENTS specifies `frontend`, `backend`, or `both`, run only those. Otherwise auto-detect from the changed files list above.

**Backend checks** (run if any `backend/` file changed):
```bash
cd /Users/danilo/www/vida/backend && npm run check
cd /Users/danilo/www/vida/backend && npm run test
```

**Frontend checks** (run if any `frontend/` file changed):
```bash
cd /Users/danilo/www/vida/frontend && npm run check
cd /Users/danilo/www/vida/frontend && npm run test
```

**Infrastructure checks** (run if `serverless.yml`, IAM roles, or CloudFormation resources changed):
```bash
cd /Users/danilo/www/vida/backend && serverless deploy --stage dev
```

Run all applicable checks in parallel where possible. Fix all failures before reporting success — do not just report them and stop.

When done, output a concise summary table:

| Check | Scope | Result |
|-------|-------|--------|
| Biome | backend | ✓ pass |
| Jest  | backend | ✓ pass |
| Biome | frontend | ✓ pass |
| Vitest | frontend | ✓ pass |
