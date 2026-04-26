# CLAUDE.md

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

## Branching Strategy
Git Flow: work from `develop`, PRs target `develop`, releases merge to `main`.
Never push directly to `main`.

## Local Development
_To be documented once scaffolding (issues #36 and #37) is complete._

## Issue Labels in Use
`infra`, `frontend`, `backend`, `auth`, `ci`, `pwa`, `database`
