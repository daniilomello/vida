---
description: Scaffold a new React page — page component, route in app.tsx, API service, and optional Zustand store
argument-hint: <page description> (e.g. "transactions list page" or "add expense form")
---

# Scaffold React Page

Request: $ARGUMENTS

## Context

- Existing pages: !`find /Users/danilo/www/vida/frontend/src/pages -name "*.tsx" | sort`
- Existing services: !`find /Users/danilo/www/vida/frontend/src/services -name "*.ts" 2>/dev/null | sort`
- Existing stores: !`find /Users/danilo/www/vida/frontend/src/store -name "*.ts" | sort`
- Current routes in app.tsx: !`grep -E "path=" /Users/danilo/www/vida/frontend/src/app.tsx`
- Existing components: !`find /Users/danilo/www/vida/frontend/src/components -name "*.tsx" | sort`

## Your task

### Step 1 — Clarify the page

Parse $ARGUMENTS to determine:
- Page name in PascalCase (e.g. `TransactionsPage`, `AddExpensePage`)
- File name in kebab-case (e.g. `transactions-page.tsx`, `add-expense-page.tsx`)
- Route path (e.g. `/transactions`, `/add-expense`)
- Whether it requires authentication (uses `<ProtectedRoute>` — almost always yes)
- What API calls it makes (cross-reference `docs/spec.md` section 3.2)
- Whether it needs a dedicated Zustand store or can use an existing one

### Step 2 — Fetch docs

Use Context7 MCP to fetch current React, React Router v6, and Zustand docs before writing any component code:
1. `mcp__claude_ai_Context7__resolve-library-id` for `react-router-dom` and `zustand`
2. `mcp__claude_ai_Context7__query-docs` for the relevant hooks and patterns

### Step 3 — Create the service file

Create `frontend/src/services/<resource>-service.ts` if no service exists for this resource yet:

```typescript
const API_BASE = import.meta.env.VITE_API_URL;

export async function getResource(): Promise<ResourceType[]> {
  const res = await fetch(`${API_BASE}/api/v1/<resource>`, {
    credentials: "include",
  });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error?.message ?? "Failed to fetch");
  }
  return res.json();
}
```

Key rules:
- Always use `credentials: "include"` so cookies are sent automatically
- Parse the error envelope `{ error: { code, message } }` on non-ok responses
- One service file per resource (e.g. `transactions-service.ts`, `bills-service.ts`)

### Step 4 — Create or update the Zustand store

If the page needs global state (list of items, selected filters, loading state), create `frontend/src/store/<resource>.store.ts`:

```typescript
import { create } from "zustand";

interface ResourceStore {
  items: ResourceType[];
  isLoading: boolean;
  setItems: (items: ResourceType[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useResourceStore = create<ResourceStore>((set) => ({
  items: [],
  isLoading: false,
  setItems: (items) => set({ items }),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

If the page only needs local state (e.g. a form), skip the store and use `useState`.

### Step 5 — Create the page component

Create `frontend/src/pages/<kebab-name>.tsx`:

```typescript
import { useEffect } from "react";

export function PageName() {
  // TODO: implementation using store/service

  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <h1 className="text-xl font-bold text-white">Page Title</h1>
      {/* TODO: content */}
    </main>
  );
}
```

Key rules:
- File name: kebab-case `.tsx`; component export: PascalCase named export (no default exports)
- Use Tailwind CSS for all styling — dark theme (bg-gray-950, text-white)
- Use `sonner` toast for user feedback: `import { toast } from "sonner"`
- Use existing UI components from `frontend/src/components/ui/` (Button, Input, Label)
- Follow patterns from `LoginPage.tsx` and `SignupPage.tsx` for structure

### Step 6 — Add the route to app.tsx

Add the new route inside the `<Routes>` block in `frontend/src/app.tsx`:

```tsx
import { PageName } from "@/pages/<kebab-name>";

// Inside <Routes>:
<Route
  path="/<route-path>"
  element={
    <ProtectedRoute>
      <PageName />
    </ProtectedRoute>
  }
/>
```

Import at the top of the file with the existing imports.

### Step 7 — Run checks

```bash
cd /Users/danilo/www/vida/frontend && npm run check && npm run test
```

Fix all failures. Report all created/modified files when done.
