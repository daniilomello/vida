# CLAUDE.md

## Documentation Lookups
Always use **Context7 MCP** to fetch current documentation before working with any library, framework, SDK, API, or CLI tool in this stack — including React, Vite, Tailwind, Zustand, React Router, AWS SDK, Serverless Framework, DynamoDB, Cognito, Biome, Vitest, and Jest.

1. Resolve the library ID: `mcp__claude_ai_Context7__resolve-library-id`
2. Fetch the docs: `mcp__claude_ai_Context7__query-docs`

Use this even for well-known APIs — training data may be outdated.

## GitHub Operations
Always use the **GitHub MCP** (preferred) or `gh` CLI for all GitHub operations — never ask the user which to use.

- Listing/reading issues and PRs → `mcp__github__list_issues`, `mcp__github__issue_read`, `mcp__github__pull_request_read`
- Creating/updating issues → `mcp__github__issue_write`
- Adding issues to the project board → `gh project item-add 13 --owner daniilomello --url <issue-url>`
- Listing project items → `gh project item-list 13 --owner daniilomello`

**Repo:** `daniilomello/vida`
**GitHub Project:** "Vida — Roadmap" (project number `13`, ID `PVT_kwHOAniTAM4BVrxy`)

## Project Overview
Personal Finance PWA for tracking daily expenses, recurring bills, and credit card usage.

**Stack:**
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS + Zustand + React Router v6
- Backend: AWS Lambda + API Gateway + DynamoDB + Cognito + EventBridge
- IaC: Serverless Framework
- Auth: Amazon Cognito (email+password + email OTP via SES)
- Lint/Format: Biome
- Tests: Vitest (frontend), Jest (backend)

**Docs:**
- PRD: `docs/prd.md`
- Spec: `docs/spec.md`
- Standards: `docs/standards.md`
- Postman collection: `docs/vida-api.postman_collection.json`

## Git Workflow
Always follow this process end-to-end when implementing any issue — no exceptions.

### Branch naming
```
feature/<issue-number>-<short-description>   ← new features and setup
fix/<issue-number>-<short-description>        ← bug fixes
```
- Always branch from `develop`
- When a branch depends on another unmerged branch, branch from it and set that branch as the PR base

### Commit messages
Follow Conventional Commits (see `docs/standards.md` section 6):
```
<type>(scope): <description>
```
Examples: `feat(auth): add OTP login`, `chore(config): add Biome config`, `fix(bills): clamp dueDay`

### End-to-end flow (always complete all steps)
1. Branch from `develop` → `feature/<issue-number>-<short-description>`
2. Implement the changes
3. Commit with Conventional Commits message including `Closes #<issue-number>` in the body
4. Push the branch to `origin`
5. Open a PR targeting `develop` using GitHub MCP or `gh pr create`
6. PR body must include `Closes #<issue-number>` to auto-close the issue on merge

Never stop at commit — always push and open the PR.

## Branching Strategy
Git Flow: work from `develop`, PRs target `develop`, releases merge to `main`.
Never push directly to `main`.

## Local Development
Run both services concurrently from the root:
```bash
npm run dev
```
- Frontend: http://localhost:5173 (Vite)
- Backend: http://localhost:3000 (serverless-offline)
- Health check: `GET http://localhost:3000/api/v1/health`

Copy `.env.example` files before running:
```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

## Issue Labels in Use
`infra`, `frontend`, `backend`, `auth`, `ci`, `pwa`, `database`
