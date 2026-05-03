---
description: Full end-to-end implementation of a GitHub issue — branch, implement, verify, commit, push, open PR
argument-hint: <issue-number>
---

# Implement Issue

Issue number: $ARGUMENTS

## Context

- Current branch: !`git branch --show-current`
- Current git status: !`git status`
- Recent develop commits: !`git log origin/develop --oneline -5`

## Your task

Follow the complete Git workflow from CLAUDE.md end-to-end for issue #$ARGUMENTS. Do not stop at any step — complete all steps.

### Step 1 — Read the issue

Use `mcp__github__issue_read` for repo `daniilomello/vida`, issue number $ARGUMENTS. Understand the full scope, acceptance criteria, and labels before touching any code.

### Step 2 — Branch from develop

```bash
git checkout develop && git pull origin develop
git checkout -b feature/$ARGUMENTS-<short-kebab-description>
```

Derive the short description from the issue title (lowercase, hyphenated, ≤4 words).

If the issue label is `fix` or describes a bug, use `fix/$ARGUMENTS-<description>` instead.

### Step 3 — Fetch docs before implementation

For every library, framework, or SDK you will touch, use Context7 MCP first:
1. `mcp__claude_ai_Context7__resolve-library-id` — get the library ID
2. `mcp__claude_ai_Context7__query-docs` — fetch current docs

Do this even for well-known libraries (React, Tailwind, DynamoDB, etc.) — training data may be outdated.

### Step 4 — Implement

Implement the changes required by the issue. Follow existing code patterns and conventions strictly. Do not add features, refactor, or introduce abstractions beyond what the issue requires.

### Step 5 — Pre-PR verification (fix all failures before continuing)

Auto-detect which checks apply from the files you changed:

**Backend** (`backend/` files changed):
```bash
cd /Users/danilo/www/vida/backend && npm run check
cd /Users/danilo/www/vida/backend && npm run test
```

**Frontend** (`frontend/` files changed):
```bash
cd /Users/danilo/www/vida/frontend && npm run check
cd /Users/danilo/www/vida/frontend && npm run test
```

**Infrastructure** (`serverless.yml`, IAM, CloudFormation resources changed):
```bash
cd /Users/danilo/www/vida/backend && serverless deploy --stage dev
```

Do not open a PR until all checks pass.

### Step 6 — Commit

Use Conventional Commits format. Include `Closes #$ARGUMENTS` in the body.

```
<type>(scope): <description>

Closes #$ARGUMENTS
```

Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `ci`
Scope: the area affected (e.g. `auth`, `bills`, `frontend`, `infra`)

**Never** include `Co-Authored-By: Claude` or any Anthropic attribution.

### Step 7 — Push

```bash
git push -u origin HEAD
```

### Step 8 — Open PR

Use `mcp__github__create_pull_request`:
- **title**: same as the commit summary line
- **body**: must include `Closes #$ARGUMENTS`; add a brief description of what changed and why
- **base**: `develop`
- **head**: current branch

### Step 9 — Add to project board

```bash
gh project item-add 13 --owner daniilomello --url <issue-url>
```

Report the PR URL when done.
