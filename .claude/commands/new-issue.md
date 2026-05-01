---
description: Create a GitHub issue with proper labels and add it to the Vida Roadmap project board
argument-hint: <issue title or description>
---

# New Issue

Request: $ARGUMENTS

## Context

- Repo: `daniilomello/vida`
- Project: "Vida — Roadmap" (project number `13`, owner `daniilomello`)
- Available labels: `infra`, `frontend`, `backend`, `auth`, `ci`, `pwa`, `database`
- Open issues (for context/deduplication): !`gh issue list --repo daniilomello/vida --state open --limit 20`

## Your task

### Step 1 — Clarify (if needed)

If $ARGUMENTS is vague or missing, ask the user for:
- Full issue title (clear, actionable)
- Description and acceptance criteria
- Which labels apply

If $ARGUMENTS is clear enough, proceed directly.

### Step 2 — Draft the issue

Choose labels based on what area is affected:
- `frontend` — React/Vite/UI changes
- `backend` — Lambda/API/DynamoDB changes
- `auth` — Cognito/login/session changes
- `infra` — Serverless Framework, AWS resources, CloudFormation
- `ci` — GitHub Actions, deploy pipeline
- `pwa` — Service worker, manifest, offline support
- `database` — DynamoDB schema, indexes, access patterns

Write an issue body with:
- **What**: one-paragraph description of the goal
- **Acceptance criteria**: bulleted checklist of done conditions

### Step 3 — Create the issue

Use `mcp__github__issue_write`:
- repo: `daniilomello/vida`
- title: clear, actionable title
- body: as drafted above
- labels: selected from the list

### Step 4 — Add to project board

```bash
gh project item-add 13 --owner daniilomello --url <issue-url>
```

Report the issue number and URL.
