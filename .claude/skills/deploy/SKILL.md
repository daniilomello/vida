---
description: Deploy backend to dev or prod after running pre-PR checks — wraps serverless deploy with safety gates
argument-hint: <stage> (dev|prod) — defaults to dev
---

# Deploy

Stage: $ARGUMENTS

## Context

- Current branch: !`git branch --show-current`
- Git status: !`git status --short`
- Recent commits: !`git log --oneline -5`
- Current package version: !`node -p "require('./package.json').version"`

## Your task

### Step 1 — Determine stage

If $ARGUMENTS is empty, default to `dev`.
If $ARGUMENTS is `prod`, require explicit confirmation from the user before proceeding (see Step 2b).

### Step 2a — Dev deploy

Run pre-checks first:
```bash
cd /Users/danilo/www/vida/backend && npm run check
cd /Users/danilo/www/vida/backend && npm run test
```

If either check fails, stop and report failures — do not deploy.

Then deploy:
```bash
cd /Users/danilo/www/vida/backend && npx serverless deploy --stage dev
```

### Step 2b — Prod deploy (requires confirmation)

Before deploying to prod, verify:
1. Current branch is `main` or working tree matches a tagged release
2. All tests pass (run `npm run check && npm run test`)
3. User has explicitly confirmed: "yes, deploy to prod"

If all conditions met:
```bash
cd /Users/danilo/www/vida/backend && npx serverless deploy --stage prod
```

### Step 3 — Post-deploy verification

After deploy completes, run a health check:
```bash
curl -s https://$(cd /Users/danilo/www/vida/backend && npx serverless info --stage <stage> 2>/dev/null | grep "endpoint:" | head -1 | awk '{print $2}' | sed 's|https://||' | cut -d/ -f1)/api/v1/health
```

Or for dev:
```bash
curl -s http://localhost:3000/api/v1/health 2>/dev/null || echo "local server not running"
```

Report:
- Deployed stage and region
- Service endpoint URL
- Health check result
- Any Lambda functions updated
