# Technical Specifications Document (Spec)

## 1. System Architecture Overview
The application will be built as a Serverless Progressive Web App (PWA) entirely hosted on Amazon Web Services (AWS). 
* **Frontend:** ReactJS (Single Page Application) bootstrapped with Vite.
* **Authentication:** Amazon Cognito (User Pools).
* **API Layer:** Amazon API Gateway routing to AWS Lambda functions.
* **Infrastructure as Code:** Serverless Framework (managing API Gateway, Lambda, and DynamoDB).
* **Database:** Amazon DynamoDB (Single-Table Design).
* **Automation:** Amazon EventBridge (CloudWatch Events) for recurring cron jobs.

## 2. Frontend Specifications (React + Vite PWA)
* **Framework:** React 18+
* **Build Tool:** Vite
* **PWA Plugin:** `vite-plugin-pwa` (handles manifest.json and service worker generation).
* **Styling:** Tailwind CSS for rapid UI development.
* **State Management:** React Context API or Zustand (Redux is too heavy for this MVP).
* **Routing:** React Router v6.
* **Auth Client:** Direct calls to the Cognito REST API (no Amplify dependency). JWT tokens are stored exclusively in `httpOnly` cookies to prevent XSS exposure.

## 3. Backend & API Specifications

### 3.1. Authentication Flow

The app supports two login methods on the same Cognito User Pool. The user chooses their preferred method on the login screen.

#### Method 1 — Email + Password (`USER_SRP_AUTH`)
1. User submits email and password via the login form.
2. Frontend calls Cognito's `InitiateAuth` with `AuthFlow: USER_SRP_AUTH` directly (no Amplify).
3. Cognito returns `AccessToken`, `IdToken`, and `RefreshToken`.
4. Frontend forwards the tokens to `POST /auth/session`, which sets them as `httpOnly; Secure; SameSite=Strict` cookies — tokens never touch `localStorage` or JS-accessible memory.
5. All subsequent API requests are made with `credentials: 'include'`; the browser sends the cookies automatically.

#### Method 2 — Email OTP (Passwordless)
1. User enters their email and requests a one-time code.
2. Frontend calls Cognito's `InitiateAuth` with `AuthFlow: CUSTOM_AUTH` to trigger the OTP flow.
3. Cognito invokes the `CreateAuthChallenge` Lambda trigger, which generates a 6-digit code and sends it to the user's email via SES.
4. User enters the code in the app; frontend calls `RespondToAuthChallenge` to submit the code.
5. Cognito invokes the `VerifyAuthChallengeResponse` Lambda trigger to validate the code.
6. Cognito returns tokens; same session creation flow as Method 1 (step 4 onwards).

**Required Cognito Lambda Triggers for OTP:**
* `DefineAuthChallenge` — orchestrates the custom auth flow steps.
* `CreateAuthChallenge` — generates the OTP and sends it via SES.
* `VerifyAuthChallengeResponse` — validates the submitted code and marks the challenge as passed or failed.

#### Session & Token Refresh
* A token-refresh Lambda handles `RefreshToken` rotation before expiry, keeping the session alive transparently.
* API Gateway uses a **custom Lambda Authorizer** to extract the `IdToken` from the request cookie, validate it against the Cognito JWKS endpoint, and return an IAM policy granting or denying access.

#### Password Reset Flow
> These calls go **directly from the frontend to Cognito** — they do not pass through API Gateway or any backend Lambda.

1. User clicks "Forgot password?" on the login screen.
2. Frontend calls Cognito's `ForgotPassword` directly — Cognito sends a reset code to the user's email natively (no custom Lambda required).
3. User enters the code and a new password on the reset screen.
4. Frontend calls Cognito's `ConfirmForgotPassword` directly to complete the reset.
5. User is redirected to the login screen to authenticate with the new password.

**Authorizer rules per endpoint:**
* `POST /auth/session` — **no authorizer** (public; receives raw Cognito tokens from the frontend login form).
* `POST /auth/refresh` — **no Lambda Authorizer**; the Lambda itself reads and validates the `refreshToken` cookie directly, since the `idToken` may already be expired at this point.
* `DELETE /auth/session` — **Lambda Authorizer required**; ensures only authenticated users can trigger a logout (prevents unauthenticated cookie-clearing abuse).
* All other endpoints — **Lambda Authorizer required**.

### 3.2. REST API Endpoints (Serverless Framework)
The API will follow RESTful principles. All endpoints are prefixed with `/api/v1`.

| Method | Endpoint | Description | Lambda Function |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/session` | Exchange Cognito tokens for httpOnly cookies (public — no authorizer) | `createSession` |
| `POST` | `/auth/refresh` | Rotate RefreshToken and reissue cookies (requires valid `refreshToken` cookie) | `refreshSession` |
| `DELETE` | `/auth/session` | Clear session cookies — logout (requires valid `idToken` cookie) | `deleteSession` |
| `POST` | `/cards` | Create a new credit card | `createCard` |
| `GET` | `/cards` | List cards (Query param: `active=true\|false\|all`, default `active=true`) | `getCards` |
| `PUT` | `/cards/{id}` | Update card nickname | `updateCard` |
| `DELETE` | `/cards/{id}` | Soft-delete a credit card (`active = false`) | `deleteCard` |
| `PUT` | `/cards/{id}/reactivate` | Reactivate a soft-deleted card (`active = true`) | `reactivateCard` |
| `POST` | `/transactions` | Create a new daily expense | `createTransaction` |
| `GET` | `/transactions` | Get transactions (Query params: `month=YYYY-MM` defaults to current month, `paidVia=<value>`) | `getTransactions` |
| `DELETE` | `/transactions/{id}` | Soft-delete a transaction (`deleted = true`) — preserves history for monthly snapshots | `deleteTransaction` |
| `POST` | `/bills` | Create a new recurring bill definition | `createBill` |
| `GET` | `/bills` | List bills (Query param: `active=true\|false\|all`, default `active=true`) | `getBills` |
| `PUT` | `/bills/{id}` | Update a recurring bill definition | `updateBill` |
| `DELETE` | `/bills/{id}` | Soft-delete a bill (`active = false`) | `deleteBill` |
| `PUT` | `/bills/{id}/reactivate` | Reactivate a soft-deleted bill (`active = true`) | `reactivateBill` |
| `PUT` | `/transactions/{id}/pay` | Mark a transaction (BILL_PAYMENT) as paid — sets `status: PAID` and `paidAt` timestamp | `markBillPaid` |
| `GET` | `/summary` | Monthly aggregation (Query param: `month=YYYY-MM`, defaults to current month) | `getMonthlySummary` |

### 3.3. API Response Examples

**`GET /transactions?month=2026-04`**
```json
[
  {
    "id": "a1b2c3d4-...",
    "type": "EXPENSE",
    "amount": 45.90,
    "description": "Lunch",
    "category": "FOOD",
    "paidVia": "CASH",
    "status": "PAID",
    "month": "2026-04",
    "date": "2026-04-10T12:30:00"
  },
  {
    "id": "e5f6g7h8-...",
    "type": "BILL_PAYMENT",
    "amount": 39.90,
    "description": null,
    "category": "ENTERTAINMENT",
    "paidVia": "CREDIT_CARD#card-uuid-123",
    "status": "UNPAID",
    "month": "2026-04",
    "date": "2026-04-15T00:00:00",
    "billId": "bill-uuid-456"
  }
]
```

**`GET /transactions?month=2026-04&paidVia=CREDIT_CARD%23card-uuid-123`** (Credit Card Audit filter)
```json
[
  {
    "id": "e5f6g7h8-...",
    "type": "BILL_PAYMENT",
    "amount": 39.90,
    "description": null,
    "category": "ENTERTAINMENT",
    "paidVia": "CREDIT_CARD#card-uuid-123",
    "status": "UNPAID",
    "month": "2026-04",
    "date": "2026-04-15T00:00:00",
    "billId": "bill-uuid-456"
  }
]
```

**`GET /bills`**
```json
[
  {
    "id": "bill-uuid-456",
    "type": "BILL_DEFINITION",
    "name": "Netflix",
    "amount": 39.90,
    "dueDay": 15,
    "category": "ENTERTAINMENT",
    "paidVia": "CREDIT_CARD#card-uuid-123",
    "active": true
  }
]
```

**`GET /cards`**
```json
[
  {
    "id": "card-uuid-123",
    "nickname": "Nubank",
    "active": true
  }
]
```

**`GET /summary?month=2026-04`**
```json
{
  "month": "2026-04",
  "totalSpent": 485.70,
  "byCategory": [
    { "category": "FOOD", "total": 210.00 },
    { "category": "ENTERTAINMENT", "total": 119.80 },
    { "category": "TRANSPORT", "total": 95.90 },
    { "category": "OTHER", "total": 60.00 }
  ],
  "byPaymentMethod": [
    { "paidVia": "CASH", "total": 155.90 },
    { "paidVia": "DEBIT", "total": 95.90 },
    { "paidVia": "CREDIT_CARD#card-uuid-123", "nickname": "Nubank", "total": 233.90 }
  ]
}
```

### 3.4. API Cross-Cutting Concerns

#### CORS
* `Access-Control-Allow-Origin` must be set to the **exact frontend origin** (e.g., `https://app.yourdomain.com`) — wildcard (`*`) is forbidden when credentials are included.
* `Access-Control-Allow-Credentials: true` is required for the browser to send cookies.
* Allowed headers: `Content-Type`, `X-Requested-With`.
* The `Authorization` header is no longer needed since tokens travel via cookies, not request headers.

#### Rate Limiting
* API Gateway Usage Plan: **100 req/s burst, 50 req/s steady-state** (sufficient for single-user MVP; revisit for V2).

#### Error Handling
All Lambda functions must return consistent error envelopes:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description"
  }
}
```
Standard HTTP status codes:
* `400` — validation / malformed request
* `401` — missing or expired JWT
* `403` — resource belongs to a different user
* `404` — resource not found
* `500` — unexpected Lambda error (logged to CloudWatch)

### 3.5. Event-Driven Automation (EventBridge)
* **Cron Job:** `cron(0 0 1 * ? *)` (Runs at midnight UTC on the 1st of every month).
* **Lambda Target:** `generateMonthlyBills`
* **Retry Policy:** EventBridge native retry — **3 attempts** with **1-hour backoff** between attempts (maximum retry window: 3 hours). Failures beyond that are sent to a **Dead Letter Queue (DLQ)** on SQS for manual inspection via CloudWatch.
* **Idempotency:** The Lambda must be idempotent — if retried, it must not generate duplicate transactions. Before inserting, it should check whether a `BILL_PAYMENT` with the same `billId` and `month` already exists for the user.
* **Logic:**
    1. Queries the `GSI-Type` index for all items where `type == 'BILL_DEFINITION'` and `active == true`.
    2. For each bill, checks idempotency (no duplicate for the current month).
    3. Creates a new `TRANSACTION` item (`type: BILL_PAYMENT`, `status: UNPAID`) for the new month.
    4. The frontend queries these unpaid transactions to build the "Upcoming Bills" checklist.

## 4. Database Schema: DynamoDB Single-Table Design
Given the NoSQL nature of DynamoDB, we will use a single table to store both recurring bill definitions and daily transactions.

**Table Name:** `FinanceApp-Data`
* **Partition Key (PK):** `String` (Represents the User ID to ensure data isolation)
* **Sort Key (SK):** `String` (Represents the entity type and date/ID for sorting and querying)

**Global Secondary Index — `GSI-Type`:**
* **GSI PK:** `type` (e.g., `"BILL_DEFINITION"`, `"EXPENSE"`, `"BILL_PAYMENT"`)
* **GSI SK:** `PK` (the User ID, enabling per-user filtering)
* **Purpose:** Allows `generateMonthlyBills` to `Query` only `BILL_DEFINITION` items instead of scanning the entire table. Also useful for analytics queries by type.

### Entity 1: Transaction (Daily Expense or Generated Bill)
* **PK:** `USER#<Cognito_User_ID>`
* **SK:** `TX#<YYYY-MM-DDTHH:mm:ss>#<UUID>` (ISO timestamp + UUID suffix avoids collisions; allows querying by prefix, e.g., `begins_with(SK, "TX#2026-04")` to get all April 2026 transactions).
* **Attributes:**
    * `id`: UUID (mirrors the UUID portion of the SK for convenience)
    * `type`: "EXPENSE" | "BILL_PAYMENT"
    * `amount`: Number
    * `description`: String (optional free-text note about the expense)
    * `category`: Enum (see canonical values in section 4.1)
    * `paidVia`: `"CASH"` | `"DEBIT"` | `"CREDIT_CARD#<Card_UUID>"` (references a Card entity for credit card payments)
    * `status`: "PAID" | "UNPAID" (Expenses are always PAID; generated bills start as UNPAID)
    * `billId`: String (Only present if `type == 'BILL_PAYMENT'`; links back to the parent `BILL#<UUID>` SK for traceability)
    * `month`: String `YYYY-MM` (denormalized field to simplify queries and GSI filtering)
    * `date`: String ISO 8601 (the effective date of the transaction; defaults to today for expenses, set to `dueDay` of the month for generated bills)
    * `deleted`: Boolean (soft-delete flag; deleted transactions are excluded from all queries and snapshots but preserved in storage)
    * `paidAt`: String ISO 8601 (only present if `status == 'PAID'`; set by `markBillPaid` for BILL_PAYMENTs, or equal to `date` for EXPENSE)
    * `createdAt`: String ISO 8601 (set on creation, never updated)
    * `updatedAt`: String ISO 8601 (updated on every write)

### Entity 2: Recurring Bill Definition (The Template)
* **PK:** `USER#<Cognito_User_ID>`
* **SK:** `BILL#<Bill_UUID>`
* **Attributes:**
    * `id`: UUID (mirrors the UUID portion of the SK for convenience)
    * `type`: `"BILL_DEFINITION"` (fixed value; used as GSI-Type PK)
    * `name`: String (e.g., "Netflix")
    * `amount`: Number
    * `dueDay`: Number (1-31; if `dueDay` exceeds the last day of a given month, the Lambda clamps it to the last valid day — e.g., `dueDay: 31` in February becomes the 28th/29th)
    * `category`: Enum (see canonical values in section 4.1)
    * `paidVia`: `"CASH"` | `"DEBIT"` | `"CREDIT_CARD#<Card_UUID>"` (references a Card entity)
    * `active`: Boolean (soft-delete flag; inactive bills are excluded from monthly generation)
    * `createdAt`: String ISO 8601
    * `updatedAt`: String ISO 8601

### Entity 3: Credit Card
* **PK:** `USER#<Cognito_User_ID>`
* **SK:** `CARD#<Card_UUID>`
* **Attributes:**
    * `id`: UUID (mirrors the UUID portion of the SK for convenience)
    * `nickname`: String (user-defined label, e.g., "Nubank", "Inter") — no card type, number, or network stored
    * `active`: Boolean (soft-delete flag; preserves historical traceability in transactions that reference this card)
    * `createdAt`: String ISO 8601
    * `updatedAt`: String ISO 8601

### 4.1. Category Enum (Fixed for MVP)
Categories are a fixed enum validated on both frontend and backend. The Lambda functions must reject any `category` value outside this list with a `400` error. `OTHER` is the catch-all for expenses that don't fit the defined categories.

| Value | Label |
| :--- | :--- |
| `FOOD` | Food |
| `TRANSPORT` | Transport |
| `UTILITIES` | Utilities |
| `ENTERTAINMENT` | Entertainment |
| `HEALTH` | Health |
| `HOUSING` | Housing |
| `OTHER` | Other |

## 5. Deployment Pipeline (Recommended)
* **Frontend:** Hosted on AWS S3 with CloudFront as the CDN. Deployment via a simple GitHub Actions script running `npm run build` and `aws s3 sync`.
* **Backend:** Deployed using `serverless deploy` which compiles `serverless.yml` into a CloudFormation template, provisioning API Gateway, Lambda, DynamoDB, and Cognito automatically.
