---
description: Run frontend and backend tests with coverage reporting — flags files below threshold
argument-hint: [frontend|backend|both] — defaults to both
---

# Coverage

Scope: $ARGUMENTS

## Context

- Changed files vs develop: !`git diff --name-only origin/develop...HEAD 2>/dev/null | head -30`

## Your task

### Step 1 — Determine scope

If $ARGUMENTS is `frontend`, run only frontend. If `backend`, run only backend. Otherwise run both.

### Step 2 — Run with coverage

**Backend** (Jest with coverage):
```bash
cd /Users/danilo/www/vida/backend && npm run test -- --coverage --coverageReporters=text
```

**Frontend** (Vitest with coverage):
```bash
cd /Users/danilo/www/vida/frontend && npm run test -- --coverage --reporter=verbose
```

Run both in parallel if scope is `both`.

### Step 3 — Parse and report

Read the coverage output and produce a summary table:

| File | Statements | Branches | Functions | Lines | Status |
|------|-----------|----------|-----------|-------|--------|
| path/to/file.ts | 87% | 72% | 90% | 87% | ✓ |
| path/to/other.ts | 45% | 30% | 50% | 45% | ✗ below threshold |

**Threshold:** flag any file with statement coverage below 70%.

### Step 4 — Highlight uncovered code

For files below threshold, list which specific functions or branches are uncovered (extract from the detailed coverage output).

### Step 5 — Overall summary

```
Backend:  Statements: X%  Branches: X%  Functions: X%  Lines: X%
Frontend: Statements: X%  Branches: X%  Functions: X%  Lines: X%
```

If coverage dropped compared to what's reasonable for the changed files, call it out and suggest which tests to add.
