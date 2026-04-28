# Vida — Personal Finance PWA

A serverless Progressive Web App for tracking daily expenses, recurring bills, and credit card usage. Built for single-user, frictionless financial visibility without bank integrations.

## Tech Stack

![Stack](https://skills.syvixor.com/api/icons?i=claudeai,typescript,reactjs,vitejs,tailwindcss,nodejs,aws,,vitest,githubactions)

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS v4, React Router v6, Zustand |
| **Backend** | AWS Lambda (Node.js 20), API Gateway, TypeScript |
| **Database** | DynamoDB (single-table design) |
| **Auth** | Amazon Cognito — email+password and email OTP (passwordless) |
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

## Project Structure

```
/
├── frontend/          # React 18 + Vite PWA (TypeScript)
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Route-level components
│       ├── services/    # API calls per resource
│       ├── store/       # Zustand stores
│       └── lib/         # Utilities and Cognito client
├── backend/           # Serverless Framework + AWS Lambda (TypeScript)
│   └── src/
│       ├── handlers/    # One file per Lambda function
│       └── lib/         # Shared DynamoDB client, response helpers
├── docs/              # PRD, Technical Spec, Code Standards, API collection
├── scripts/           # Release automation
└── .github/           # GitHub Actions workflows and issue templates
```

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# 3. Start both services concurrently
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health check: `GET http://localhost:3000/api/v1/health`

## Documentation

- [Product Requirements (PRD)](docs/prd.md)
- [Technical Specification](docs/spec.md)
- [Code Standards](docs/standards.md)
- [API Collection (Yaak/Postman)](docs/yaak.json)

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
