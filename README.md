# Vida — Personal Finance PWA

A serverless Progressive Web App for tracking daily expenses, recurring bills, and credit card usage.

## Documentation
- [Product Requirements (PRD)](docs/prd.md)
- [Technical Specification](docs/spec.md)
- [Code Standards](docs/standards.md)

## Structure

```
/
├── docs/          # PRD, Spec, and Code Standards
├── frontend/      # React 18 + Vite PWA (TypeScript)
├── backend/       # Serverless Framework + AWS Lambda (TypeScript)
└── .github/       # GitHub Actions workflows and issue templates
```

## Stack
- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Zustand
- **Backend:** AWS Lambda, API Gateway, DynamoDB, Cognito, EventBridge
- **IaC:** Serverless Framework
- **Auth:** Amazon Cognito (email + password and email OTP)
- **Lint/Format:** Biome
- **Tests:** Vitest (frontend), Jest (backend)

## Branching
This project follows [Git Flow](docs/standards.md#5-git-flow). Work from `develop`, open PRs targeting `develop`, releases merge into `main`.
