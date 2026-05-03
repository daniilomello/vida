---
description: Seed DynamoDB with dev test data for local or deployed dev stage
argument-hint: [--stage local|dev] [--user <email>] — defaults to local
---

# Seed

Request: $ARGUMENTS

## Context

- Seed scripts: !`find /Users/danilo/www/vida -name "seed*" -o -name "*seed*" | grep -v node_modules | grep -v ".git" | sort`
- Backend handlers (to understand data shape): !`find /Users/danilo/www/vida/backend/src/handlers -name "*.ts" ! -name "*.test.ts" | sort`
- DynamoDB tables in serverless.yml: !`grep -E "TableName:" /Users/danilo/www/vida/backend/serverless.yml`

## Your task

### Step 1 — Parse arguments

- Stage: `local` (uses localhost:8000 DynamoDB local) or `dev` (uses real AWS dev table)
- User email: email to associate seed data with — defaults to `danilodemellow@gmail.com`

### Step 2 — Check for existing seed script

If a seed script exists at `backend/scripts/seed.ts` or similar, run it:
```bash
cd /Users/danilo/www/vida/backend && npx ts-node scripts/seed.ts
```

### Step 3 — If no seed script exists, generate seed data

Based on the DynamoDB table schema (read from serverless.yml and handler files), create realistic seed data:

**Expenses** (10–20 items):
- Varied categories: food, transport, entertainment, health, utilities
- Dates spread over the last 30 days
- Realistic amounts (BRL currency, R$ 10–500 range)

**Bills** (3–5 recurring):
- Monthly subscriptions: Netflix, Spotify, rent, gym, internet
- dueDay between 1–28
- active: true

**Credit cards** (1–2):
- closingDay and dueDay populated
- limit in BRL

Use the PK format `USER#<userId>` where userId comes from a Cognito lookup or a fixed test value.

### Step 4 — Write items to DynamoDB

For local:
```bash
aws dynamodb put-item \
  --endpoint-url http://localhost:8000 \
  --table-name <table-name> \
  --item '<json-item>'
```

For dev stage (real AWS):
```bash
aws dynamodb put-item \
  --table-name vida-dev-<table> \
  --item '<json-item>'
```

### Step 5 — Verify

After seeding, do a quick count:
```bash
aws dynamodb scan --table-name <table-name> \
  --select COUNT --filter-expression "begins_with(PK, :pk)" \
  --expression-attribute-values '{":pk":{"S":"USER#<userId>"}}' \
  --query Count
```

Report how many items were written to each table.
