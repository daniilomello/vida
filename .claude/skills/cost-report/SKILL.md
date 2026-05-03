---
description: Query AWS Cost Explorer and generate a weekly cost report for the Vida project
argument-hint: [--weeks 1|4] — number of weeks to look back (default 1)
---

# Cost Report

Request: $ARGUMENTS

## Context

- AWS account services in use: Lambda, API Gateway, DynamoDB, Cognito, SES, EventBridge, CloudWatch, S3
- Serverless stage names: `dev`, `prod`

## Your task

### Step 1 — Determine date range

Parse $ARGUMENTS:
- `--weeks 1` → last 7 days (default)
- `--weeks 4` → last 28 days

Calculate start date: today minus N weeks. Format: `YYYY-MM-DD`.

### Step 2 — Fetch total cost by service

```bash
aws ce get-cost-and-usage \
  --time-period Start=<start-date>,End=<today> \
  --granularity MONTHLY \
  --metrics "BlendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE \
  --query "ResultsByTime[*].Groups[*].{Service:Keys[0],Cost:Metrics.BlendedCost.Amount}" \
  --output json
```

### Step 3 — Fetch daily trend

```bash
aws ce get-cost-and-usage \
  --time-period Start=<start-date>,End=<today> \
  --granularity DAILY \
  --metrics "BlendedCost" \
  --query "ResultsByTime[*].{Date:TimePeriod.Start,Cost:Total.BlendedCost.Amount}" \
  --output json
```

### Step 4 — Generate report

```
AWS Cost Report — <start-date> to <today>
==========================================

Total: $X.XX USD

By service:
  Lambda           $X.XX  (X%)
  DynamoDB         $X.XX  (X%)
  API Gateway      $X.XX  (X%)
  CloudWatch       $X.XX  (X%)
  Cognito          $X.XX  (X%)
  SES              $X.XX  (X%)
  Other            $X.XX  (X%)

Daily trend:
  Mon May 27   $0.12
  Tue May 28   $0.08
  ...

Free tier status:
  Lambda:     X of 1M requests/month used
  DynamoDB:   X of 25 GB storage used
  SES:        X of 62K emails/month used
```

### Step 5 — Anomaly detection

Flag anything that looks unusual:
- Daily cost more than 2× the average
- Any service that appeared this week but not last week
- Total cost trending above $5/month threshold (this is a personal project — should be near-zero)

### Step 6 — Recommendations

If costs are non-zero, suggest which optimizations apply:
- DynamoDB on-demand vs provisioned
- Lambda memory tuning
- CloudWatch log retention policies
- Unused resources to delete
