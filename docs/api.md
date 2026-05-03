# Vida API — Reference

Base URL: `https://api.yourdomain.com/api/v1`

All endpoints (except `/auth/session` and `/auth/refresh`) require authentication via `httpOnly` session cookie set by `POST /auth/session`.

## Implementation Status

| Method | Endpoint | Status |
| :--- | :--- | :--- |
| `POST` | `/auth/session` | ✅ Implemented |
| `POST` | `/auth/refresh` | ✅ Implemented |
| `DELETE` | `/auth/session` | ✅ Implemented |
| `POST` | `/cards` | ✅ Implemented |
| `GET` | `/cards` | ✅ Implemented |
| `PUT` | `/cards/{id}` | ✅ Implemented |
| `DELETE` | `/cards/{id}` | ✅ Implemented |
| `PUT` | `/cards/{id}/reactivate` | ✅ Implemented |
| `POST` | `/bills` | 🔜 Planned |
| `GET` | `/bills` | 🔜 Planned |
| `PUT` | `/bills/{id}` | 🔜 Planned |
| `DELETE` | `/bills/{id}` | 🔜 Planned |
| `PUT` | `/bills/{id}/reactivate` | 🔜 Planned |
| `POST` | `/transactions` | 🔜 Planned |
| `GET` | `/transactions` | 🔜 Planned |
| `DELETE` | `/transactions/{id}` | 🔜 Planned |
| `PUT` | `/transactions/{id}/pay` | 🔜 Planned |
| `GET` | `/summary` | 🔜 Planned |

---

## Auth

### POST /auth/session ✅
Exchange Cognito tokens for session cookies. Public endpoint — no auth required.

**Request**
```json
{
  "accessToken": "eyJ...",
  "idToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**Response** `200 OK`
```json
{ "message": "Session created" }
```
Sets `httpOnly; Secure; SameSite=Strict` cookies: `idToken`, `accessToken`, `refreshToken`.

---

### POST /auth/refresh ✅
Rotate RefreshToken and reissue cookies. Reads `refreshToken` cookie directly.

**Request** — no body required.

**Response** `200 OK`
```json
{ "message": "Session refreshed" }
```

---

### DELETE /auth/session ✅
Clear session cookies (logout).

**Response** `200 OK`
```json
{ "message": "Session terminated" }
```

---

## Cards

### POST /cards ✅
Create a new credit card.

**Request**
```json
{ "nickname": "Nubank" }
```

| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `nickname` | string | yes | Whitespace is trimmed |

**Response** `201 Created`
```json
{
  "id": "card-uuid-123",
  "nickname": "Nubank",
  "active": true,
  "createdAt": "2026-04-25T10:00:00.000Z",
  "updatedAt": "2026-04-25T10:00:00.000Z"
}
```

---

### GET /cards ✅
List credit cards.

**Query params**
| Param | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `active` | `true\|false\|all` | `true` | Filter by active status |

**Response** `200 OK`
```json
[
  {
    "id": "card-uuid-123",
    "nickname": "Nubank",
    "active": true,
    "createdAt": "2026-04-25T10:00:00.000Z",
    "updatedAt": "2026-04-25T10:00:00.000Z"
  }
]
```

---

### PUT /cards/{id} ✅
Update card nickname.

**Request**
```json
{ "nickname": "Nubank Black" }
```

| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `nickname` | string | yes | Whitespace is trimmed |

**Response** `200 OK` — updated card object.

**Error** `404 Not Found` — card not found.

---

### DELETE /cards/{id} ✅
Soft-delete a card (`active = false`). Historical transactions referencing this card are preserved.

**Response** `200 OK`
```json
{ "message": "Card deactivated" }
```

**Error** `404 Not Found` — card not found.

---

### PUT /cards/{id}/reactivate ✅
Reactivate a soft-deleted card.

**Response** `200 OK`
```json
{ "message": "Card reactivated" }
```

**Error** `404 Not Found` — card not found.

---

## Bills

### POST /bills 🔜
Create a recurring bill definition.

**Request**
```json
{
  "name": "Netflix",
  "amount": 39.90,
  "dueDay": 15,
  "category": "ENTERTAINMENT",
  "paidVia": "CREDIT_CARD#card-uuid-123"
}
```

**Response** `201 Created`
```json
{
  "id": "bill-uuid-456",
  "type": "BILL_DEFINITION",
  "name": "Netflix",
  "amount": 39.90,
  "dueDay": 15,
  "category": "ENTERTAINMENT",
  "paidVia": "CREDIT_CARD#card-uuid-123",
  "active": true,
  "createdAt": "2026-04-25T10:00:00.000Z",
  "updatedAt": "2026-04-25T10:00:00.000Z"
}
```

---

### GET /bills 🔜
List bill definitions.

**Query params**
| Param | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `active` | `true\|false\|all` | `true` | Filter by active status |

**Response** `200 OK` — array of bill definition objects.

---

### PUT /bills/{id} 🔜
Update a bill definition.

**Request** — any subset of bill fields:
```json
{ "amount": 45.90, "dueDay": 20 }
```

**Response** `200 OK` — updated bill object.

---

### DELETE /bills/{id} 🔜
Soft-delete a bill (`active = false`). Excluded from future monthly generation.

**Response** `200 OK`
```json
{ "message": "Bill deactivated" }
```

---

### PUT /bills/{id}/reactivate 🔜
Reactivate a soft-deleted bill.

**Response** `200 OK`
```json
{ "message": "Bill reactivated" }
```

---

## Transactions

### POST /transactions 🔜
Create a new expense.

**Request**
```json
{
  "amount": 45.90,
  "description": "Lunch",
  "category": "FOOD",
  "paidVia": "CASH",
  "date": "2026-04-25T12:30:00"
}
```

**Response** `201 Created`
```json
{
  "id": "a1b2c3d4-...",
  "type": "EXPENSE",
  "amount": 45.90,
  "description": "Lunch",
  "category": "FOOD",
  "paidVia": "CASH",
  "status": "PAID",
  "month": "2026-04",
  "date": "2026-04-25T12:30:00",
  "deleted": false,
  "paidAt": "2026-04-25T12:30:00",
  "createdAt": "2026-04-25T12:30:00.000Z",
  "updatedAt": "2026-04-25T12:30:00.000Z"
}
```

---

### GET /transactions 🔜
List transactions with optional filters.

**Query params**
| Param | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `month` | `YYYY-MM` | current month | Filter by month |
| `paidVia` | string | — | Filter by payment method (e.g. `CASH`, `DEBIT`, `CREDIT_CARD%23card-uuid-123`) |

**Response** `200 OK`
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
    "date": "2026-04-10T12:30:00",
    "deleted": false,
    "paidAt": "2026-04-10T12:30:00",
    "createdAt": "2026-04-10T12:30:00.000Z",
    "updatedAt": "2026-04-10T12:30:00.000Z"
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
    "billId": "bill-uuid-456",
    "deleted": false,
    "paidAt": null,
    "createdAt": "2026-04-01T00:00:00.000Z",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
]
```

---

### DELETE /transactions/{id} 🔜
Soft-delete a transaction (`deleted = true`). Excluded from queries but preserved for audit.

**Response** `200 OK`
```json
{ "message": "Transaction deleted" }
```

---

### PUT /transactions/{id}/pay 🔜
Mark a `BILL_PAYMENT` transaction as paid.

**Request** — no body required.

**Response** `200 OK`
```json
{
  "id": "e5f6g7h8-...",
  "status": "PAID",
  "paidAt": "2026-04-15T09:30:00.000Z",
  "updatedAt": "2026-04-15T09:30:00.000Z"
}
```

---

## Summary

### GET /summary 🔜
Monthly aggregation computed by the backend.

**Query params**
| Param | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `month` | `YYYY-MM` | current month | Month to summarize |

**Response** `200 OK`
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

---

## Error Envelope

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description"
  }
}
```

| Status | Code | Meaning |
| :--- | :--- | :--- |
| `400` | `VALIDATION_ERROR` | Malformed request or invalid enum value |
| `401` | `UNAUTHORIZED` | Missing or expired session cookie |
| `403` | `FORBIDDEN` | Resource belongs to another user |
| `404` | `NOT_FOUND` | Resource not found |
| `500` | `INTERNAL_ERROR` | Unexpected server error |
