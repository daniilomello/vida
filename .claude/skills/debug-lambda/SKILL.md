---
description: Fetch and analyze CloudWatch logs for a Lambda function — filter errors, surface stack traces
argument-hint: <function-name> [--since 1h|6h|24h] (e.g. "createTransaction" or "getExpenses --since 6h")
---

# Debug Lambda

Request: $ARGUMENTS

## Context

- Deployed functions (serverless.yml): !`grep -E "^  [a-zA-Z][a-zA-Z0-9]+:$" /Users/danilo/www/vida/backend/serverless.yml`
- Current AWS_PROFILE / stage: !`cd /Users/danilo/www/vida/backend && cat .env | grep -E "AWS_PROFILE|STAGE" 2>/dev/null || echo "check backend/.env"`

## Your task

### Step 1 — Parse arguments

From $ARGUMENTS extract:
- Function name (e.g. `createTransaction`)
- Time window: `--since 1h` (default), `6h`, or `24h`
- Stage: `--stage dev` (default) or `prod`

Derive the full CloudWatch log group name:
```
/aws/lambda/vida-<stage>-<functionName>
```

### Step 2 — Fetch recent log events

```bash
aws logs filter-log-events \
  --log-group-name "/aws/lambda/vida-dev-<functionName>" \
  --start-time $(date -v-1H +%s000) \
  --filter-pattern "" \
  --query "events[*].message" \
  --output text \
  | tail -100
```

For errors only, use `--filter-pattern "ERROR"`.

If `--since 6h`: replace `-v-1H` with `-v-6H`. For 24h: `-v-24H`.

### Step 3 — Analyze the output

Scan the log output and produce a structured report:

**Error summary:**
- Count of ERROR lines
- Distinct error messages (deduplicated)
- Stack traces (extract and format clearly)

**Request summary:**
- Count of invocations (START lines)
- Cold starts (INIT_START lines)
- Average / max duration (REPORT lines)
- Any 4xx/5xx status codes returned

**Raw errors section:**
Paste the full error+stack trace block for each distinct error.

### Step 4 — Suggest fixes

For each distinct error pattern, suggest the likely root cause and a fix. Cross-reference the handler source at `backend/src/handlers/` if needed.

### Step 5 — Tail mode (optional)

If the user wants live tailing, run:
```bash
aws logs tail "/aws/lambda/vida-dev-<functionName>" --follow --format short
```
