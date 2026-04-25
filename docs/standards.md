# Code Standards

## 1. Language
- **TypeScript** (strict mode) for both frontend and backend.
- `any` is forbidden — use `unknown` and narrow when necessary.
- Prefer `interface` for object shapes; prefer `type` for unions, aliases, and primitives.

## 2. Tooling

| Concern | Tool |
| :--- | :--- |
| Lint & Format | Biome (replaces ESLint + Prettier) |
| Frontend Tests | Vitest |
| Backend Tests | Jest |

### Biome
- Single config at the repo root (`biome.json`), shared by frontend and backend.
- Formatting and linting run together: `biome check --apply`.
- CI must fail on any Biome warning or error.

### Vitest (Frontend)
- Test files alongside source: `button.test.tsx` next to `button.tsx`.
- Coverage threshold: 80% for `src/components/` and `src/hooks/`.

### Jest (Backend)
- Test files alongside handlers: `create-transaction.test.ts` next to `create-transaction.ts`.
- Coverage threshold: 80% for `src/handlers/` and `src/lib/`.

## 3. File Naming
- **kebab-case** for all files in both frontend and backend.
- React component files use `.tsx`; non-JSX TypeScript uses `.ts`.

```
# Frontend examples
src/components/bill-card.tsx
src/hooks/use-auth.ts
src/services/transactions-service.ts

# Backend examples
src/handlers/create-transaction.ts
src/lib/dynamo-client.ts
src/types/transaction.ts
```

## 4. Naming Conventions

| Element | Convention | Example |
| :--- | :--- | :--- |
| React components | PascalCase | `BillCard`, `QuickAdd` |
| Functions & variables | camelCase | `createTransaction`, `billId` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Types & Interfaces | PascalCase | `Transaction`, `BillDefinition` |
| Enum values | UPPER_SNAKE_CASE | `FOOD`, `BILL_PAYMENT` |
| DynamoDB keys | UPPER_SNAKE_CASE prefix | `USER#`, `TX#`, `BILL#` |

## 5. Git Flow

```
main          ← production; protected, never commit directly
develop       ← integration branch; all features merge here first
feature/*     ← new features (branch from develop)
fix/*         ← bug fixes (branch from develop)
release/*     ← release preparation (branch from develop, merges into main + develop)
hotfix/*      ← urgent production fixes (branch from main, merges into main + develop)
```

**Rules:**
- `main` and `develop` are protected branches — PRs required, no direct push.
- Branch names must follow the pattern: `feature/short-description`, `fix/short-description`.
- Delete branches after merge.

## 6. Conventional Commits

All commit messages must follow the format:
```
<type>(optional scope): <description>

[optional body]
```

| Type | When to use |
| :--- | :--- |
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Maintenance, dependencies, config |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `refactor` | Code change that is not a fix or feature |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |

**Examples:**
```
feat(auth): add email OTP login flow
fix(bills): clamp dueDay to last valid day of month
chore(deps): upgrade vite to 6.x
```

## 7. Frontend Structure

```
frontend/
├── public/
├── src/
│   ├── components/     # Reusable UI components (kebab-case.tsx)
│   ├── pages/          # Route-level components (kebab-case.tsx)
│   ├── hooks/          # Custom React hooks (use-*.ts)
│   ├── services/       # API calls (*-service.ts)
│   ├── types/          # Shared TypeScript types (*.ts)
│   ├── store/          # Global state (Zustand stores)
│   └── lib/            # Utilities and helpers
├── biome.json          # Extends root config
└── vite.config.ts
```

## 8. Backend Structure

```
backend/
├── src/
│   ├── handlers/       # One file per Lambda function (kebab-case.ts)
│   ├── lib/            # Shared utilities (dynamo-client.ts, response.ts, etc.)
│   ├── types/          # Shared TypeScript types
│   └── authorizer/     # Lambda Authorizer logic
├── biome.json          # Extends root config
└── serverless.yml
```

## 9. Pull Request Standards
- PR title must follow Conventional Commits format.
- PR must reference the related GitHub Issue (`Closes #123`).
- At least one approval required before merge (even for solo dev — use self-review checklist).
- All CI checks (Biome, tests) must pass before merge.
