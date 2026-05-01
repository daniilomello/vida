# Vida — Personal Finance PWA

A serverless Progressive Web App for tracking daily expenses, recurring bills, and credit card usage. Built for single-user, frictionless financial visibility without bank integrations.

This repo is an **npm workspaces** monorepo: `frontend/` (Vite SPA) and `backend/` (Serverless Framework on AWS).

## Tech Stack

![Stack](https://skills.syvixor.com/api/icons?i=claudeai,reactjs,vitejs,nodejs,aws,githubactions,typescript)

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS v4, React Router v7, Zustand; |
| **Backend** | AWS Lambda, API Gateway, TypeScript, Middy |
| **Database** | DynamoDB (single-table design) |
| **Auth** | Amazon Cognito (with email OTP) |
| **Messaging** | Amazon SES (OTP delivery), EventBridge (monthly bill generation cron) |
| **IaC** | Serverless Framework v4 |
| **Lint/Format** | Biome |
| **Tests** | Vitest (frontend), Jest (backend) |
| **CI/CD** | GitHub Actions — staging on `develop`, production on `main` |

## Features

- **Quick Add** — log an expense (amount, category, payment method) in under 5 seconds
- **Bills Tracker** — monthly checklist of recurring bills; auto-generated on the 1st via EventBridge cron
- **Credit Card Audit** — filter all transactions by card to see the running total per card
- **Monthly Snapshot** — spending breakdown by category and payment method
- **PWA** — installable to iOS/Android home screen; service worker caching for offline load

## Local Development

```bash
# 1. Install dependencies (workspaces)
npm install

# 2. Copy env files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Fill **frontend** `.env` with `VITE_API_BASE_URL` (e.g. `http://localhost:3000` for serverless-offline) and Cognito identifiers for client-side auth. Fill **backend** `.env` with AWS credentials (if calling real AWS), `FRONTEND_ORIGIN`, and Cognito/SES variables when exercising OTP or deployed resources locally — see `backend/.env.example`.

```bash
# 3. Start both services concurrently
npm run dev
```

- Frontend: http://localhost:5173  
- Backend (serverless-offline): http://localhost:3000  
- Health check: `GET http://localhost:3000/api/v1/health`

Root scripts: `npm run dev` (both apps), `npm run check` / `npm run check:fix` (Biome across the repo).

## Documentation

- [Product Requirements (PRD)](docs/prd.md)
- [Technical Specification](docs/spec.md)
- [Code Standards](docs/standards.md)
- [API Collection (Yaak/Postman)](docs/yaak.json)
- [CLAUDE.md](CLAUDE.md) — contributor workflow, pre-PR checks, GitHub/project conventions, release process

## Claude Code Skills

This project includes custom Claude Code slash commands in `.claude/commands/` to accelerate development:

| Command | Description |
|---|---|
| `/implement-issue <number>` | Full end-to-end: reads the issue, branches from `develop`, implements, runs pre-PR checks, commits, pushes, and opens a PR |
| `/pre-pr [frontend\|backend\|both]` | Runs Biome lint+format and tests; auto-detects changed scope from git diff |
| `/scaffold-lambda <description>` | Scaffolds a new Lambda handler, unit test, `serverless.yml` entry, and `yaak.json` update |
| `/scaffold-page <description>` | Scaffolds a React page, route in `app.tsx`, API service, and optional Zustand store |
| `/new-issue <title>` | Creates a GitHub issue with labels and adds it to the Vida Roadmap project board |
| `/release <version>` | Preflight checks + guided release via `npm run release` (PR → merge → tag → sync) |

## Branching

This project follows [Git Flow](docs/standards.md#5-git-flow):

- Work from `develop`, open PRs targeting `develop`
- Releases merge `develop` → `main` via `npm run release`
- Never push directly to `main`

## Release

```bash
# Full automated release from develop (clean working tree required)
npm run release -- v1.2.3
```

See [Release Process in CLAUDE.md](CLAUDE.md#release-process) for full details.
