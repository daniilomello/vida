---
description: Diff .env against .env.example for frontend and backend — reports missing or extra vars
argument-hint: [frontend|backend|both] — defaults to both
---

# Env Sync

Scope: $ARGUMENTS

## Context

- Frontend .env.example: !`cat /Users/danilo/www/vida/frontend/.env.example 2>/dev/null || echo "NOT FOUND"`
- Frontend .env: !`cat /Users/danilo/www/vida/frontend/.env 2>/dev/null | sed 's/=.*/=<hidden>/' || echo "NOT FOUND"`
- Backend .env.example: !`cat /Users/danilo/www/vida/backend/.env.example 2>/dev/null || echo "NOT FOUND"`
- Backend .env: !`cat /Users/danilo/www/vida/backend/.env 2>/dev/null | sed 's/=.*/=<hidden>/' || echo "NOT FOUND"`

## Your task

### Step 1 — Determine scope

If $ARGUMENTS is `frontend`, check only frontend. If `backend`, check only backend. Otherwise check both.

### Step 2 — Compare keys (not values)

For each scope, extract variable names (left side of `=`) from both `.env` and `.env.example`, then produce:

**Missing from .env** (in .env.example but not in .env):
These are required variables the developer needs to set.

**Extra in .env** (in .env but not in .env.example):
These may be stale/local-only variables that should be documented or removed.

**Present in both:**
Confirm these are set (non-empty value in .env).

### Step 3 — Report

Produce a table for each scope:

| Variable | In .env.example | In .env | Value set | Status |
|----------|----------------|---------|-----------|--------|
| VITE_API_URL | ✓ | ✓ | yes | ✓ ok |
| VITE_COGNITO_CLIENT_ID | ✓ | ✗ | — | ✗ missing |
| OLD_VAR | ✗ | ✓ | yes | ⚠ extra |

### Step 4 — Fix suggestions

For any missing variables:
- Look up the value in `backend/serverless.yml` outputs, CLAUDE.md, or `docs/spec.md` if possible
- If the value can be fetched from AWS (e.g. an ARN or endpoint), suggest the `aws` CLI command to retrieve it
- If the value is secret (keys, secrets), instruct the user to set it manually

If .env files are missing entirely, instruct the user to run:
```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```
