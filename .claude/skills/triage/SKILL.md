---
description: List and prioritize open GitHub issues grouped by label — surfaces what to work on next
argument-hint: [label] — optional filter (e.g. "frontend" or "backend")
---

# Triage

Filter: $ARGUMENTS

## Context

- Open issues: !`gh issue list --repo daniilomello/vida --state open --limit 50 --json number,title,labels,createdAt,updatedAt,assignees`
- Project board items: !`gh project item-list 13 --owner daniilomello --format json 2>/dev/null | head -100`
- Recent PRs merged to develop: !`gh pr list --repo daniilomello/vida --state merged --base develop --limit 10 --json number,title,mergedAt`

## Your task

### Step 1 — Filter

If $ARGUMENTS specifies a label (e.g. `frontend`), show only issues with that label. Otherwise show all open issues.

### Step 2 — Group by label

Organize issues into sections by their primary label:

- **backend** — Lambda, API, DynamoDB issues
- **frontend** — React, UI, Vite issues
- **auth** — Cognito, session, login issues
- **infra** — Serverless Framework, AWS resources
- **database** — DynamoDB schema, indexes
- **ci** — GitHub Actions, pipelines
- **pwa** — Service worker, offline support
- **unlabeled** — issues with no label

### Step 3 — Priority signals

Within each group, flag issues that look high-priority:
- Opened more than 7 days ago with no recent activity (stale)
- Title contains words like "bug", "fix", "broken", "error", "crash"
- Low issue number (older, may be blocking)

### Step 4 — Report

For each group, output:

```
## Backend (3 issues)
#42  Add transactions list endpoint              [7 days old]  ⚠ stale
#38  Fix DynamoDB GSI query for date range       [2 days old]
#35  Implement recurring bills scheduler         [14 days old] ⚠ stale

## Frontend (2 issues)
#44  Build expense entry form                    [1 day old]   🐛 bug
#40  Add loading skeleton for dashboard          [5 days old]
```

### Step 5 — Recommendation

Based on the triage, suggest the top 3 issues to tackle next, with brief reasoning (blocks other work, longest open, high user impact, etc.).
