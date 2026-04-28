---
description: Scaffold a new Lambda endpoint — handler, unit test, serverless.yml entry, and yaak.json update
argument-hint: <endpoint description> (e.g. "POST /transactions create a new expense")
---

# Scaffold Lambda Endpoint

Request: $ARGUMENTS

## Context

- Current functions in serverless.yml: !`grep -E "^  [a-zA-Z]" /Users/danilo/www/vida/backend/serverless.yml | grep -v "handler:\|events:\|http:\|cors:\|path:\|method:\|authorizer:"`
- Existing handlers: !`find /Users/danilo/www/vida/backend/src/handlers -name "*.ts" ! -name "*.test.ts" | sort`
- API spec (endpoint table): see docs/spec.md section 3.2

## Your task

### Step 1 — Clarify the endpoint

Parse $ARGUMENTS to determine:
- HTTP method (GET, POST, PUT, DELETE)
- Path (e.g. `/api/v1/transactions`, `/api/v1/bills/{id}`)
- Handler function name in camelCase (e.g. `createTransaction`, `getBills`)
- File name in kebab-case (e.g. `create-transaction.ts`, `get-bills.ts`)
- Subfolder if it groups with related handlers (e.g. `transactions/`, `bills/`, `cards/`)
- Whether it requires the Lambda Authorizer (all endpoints except `POST /auth/session` and `POST /auth/refresh`)

Cross-reference `docs/spec.md` section 3.2 to confirm the endpoint spec before creating anything.

### Step 2 — Fetch docs

Use Context7 MCP to fetch current AWS Lambda + DynamoDB SDK docs before writing any handler code:
1. `mcp__claude_ai_Context7__resolve-library-id` for `@aws-sdk/lib-dynamodb`
2. `mcp__claude_ai_Context7__query-docs` for the relevant DynamoDB operations

### Step 3 — Create the handler file

Create `backend/src/handlers/<subfolder>/<kebab-name>.ts` following this pattern:

```typescript
import type { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.principalId;
    if (!userId) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }),
      };
    }

    // TODO: implementation

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }),
    };
  }
};
```

Key rules:
- `userId` comes from `event.requestContext.authorizer?.principalId` (set by the Lambda Authorizer)
- Always validate `userId` first on protected endpoints
- DynamoDB PK is always `USER#${userId}`
- Error envelope must follow spec section 3.4: `{ error: { code, message } }`
- Use `@aws-sdk/lib-dynamodb` (`DynamoDBDocumentClient`) — never raw `DynamoDBClient` calls
- File name in kebab-case, handler export always named `handler`

### Step 4 — Create the unit test

Create `backend/src/handlers/<subfolder>/<kebab-name>.test.ts`:

```typescript
import { handler } from "./<kebab-name>";

describe("<HandlerName>", () => {
  it("returns 401 when userId is missing", async () => {
    const event = {
      requestContext: { authorizer: {} },
      body: null,
      pathParameters: null,
      queryStringParameters: null,
    } as any;

    const result = await handler(event, {} as any, () => {});
    expect((result as any).statusCode).toBe(401);
  });

  it("returns 200 on success", async () => {
    // TODO: mock DynamoDB and assert happy path
  });
});
```

### Step 5 — Add to serverless.yml

Add a new function entry under `functions:` in `backend/serverless.yml`:

```yaml
  <camelCaseName>:
    handler: src/handlers/<subfolder>/<kebab-name>.handler
    events:
      - http:
          path: api/v1/<resource-path>
          method: <method>
          cors: *cors
          authorizer:                          # omit this block only for public endpoints
            name: lambdaAuthorizer
            resultTtlInSeconds: 300
            identitySource: method.request.header.Cookie
            type: request
```

### Step 6 — Update docs/yaak.json

Add the new request to the appropriate folder in `docs/yaak.json` following the existing Postman collection structure. Include:
- Name, method, URL using `{{base_url}}` or `{{local_url}}`
- Request body (JSON) if POST/PUT
- Query params if GET
- Path params using `{{variable}}` references for IDs

### Step 7 — Run checks

```bash
cd /Users/danilo/www/vida/backend && npm run check && npm run test
```

Fix all failures. Report the handler file path, test file path, and the serverless.yml function name when done.
