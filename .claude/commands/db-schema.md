---
description: Describe a DynamoDB table's key schema, GSIs, TTL config, and item counts for the deployed stage
argument-hint: <table-name-or-resource> [--stage dev|prod] (e.g. "expenses" or "vida-dev-main-table")
---

# DynamoDB Schema

Request: $ARGUMENTS

## Context

- Tables defined in serverless.yml: !`grep -A2 "Type: AWS::DynamoDB::Table" /Users/danilo/www/vida/backend/serverless.yml | grep -E "TableName|LogicalId" | head -20`
- Stage resources: !`grep -E "TableName:|tableName:" /Users/danilo/www/vida/backend/serverless.yml | head -10`

## Your task

### Step 1 — Resolve the table name

Parse $ARGUMENTS to determine:
- Stage: default `dev`, or `--stage prod`
- Table resource: if a short name is given (e.g. `expenses`), look it up in `serverless.yml` to get the full DynamoDB table name (e.g. `vida-dev-expenses`)

If ambiguous, list all known table names from serverless.yml and ask the user to confirm.

### Step 2 — Describe the table

```bash
aws dynamodb describe-table --table-name <full-table-name> \
  --query "Table.{Keys:KeySchema, Attrs:AttributeDefinitions, GSIs:GlobalSecondaryIndexes, LSIs:LocalSecondaryIndexes, TTL:TimeToLiveSpecification, Count:ItemCount, Size:TableSizeBytes, Status:TableStatus}" \
  --output json
```

### Step 3 — Get TTL config

```bash
aws dynamodb describe-time-to-live --table-name <full-table-name>
```

### Step 4 — Report

Produce a structured schema summary:

```
Table: vida-dev-expenses
Status: ACTIVE
Item count: 1,243
Size: 48 KB

Primary Key:
  PK (HASH)  — String  → USER#<userId>
  SK (RANGE) — String  → EXPENSE#<expenseId>

GSIs:
  DateIndex
    PK: userId (HASH)
    SK: date (RANGE)
    Projection: ALL

TTL:
  Attribute: expiresAt
  Status: ENABLED
```

### Step 5 — Scan sample items (optional)

If the user asks for sample data, run a limited scan:
```bash
aws dynamodb scan --table-name <full-table-name> --limit 3 \
  --query "Items[*]" --output json
```

Mask any PII before displaying (replace actual user IDs, emails, amounts with `<redacted>`).

### Step 6 — Access pattern analysis

Cross-reference the key schema and GSIs against the handler code at `backend/src/handlers/` to confirm all access patterns have supporting indexes. Flag any query patterns that would trigger a full table scan.
