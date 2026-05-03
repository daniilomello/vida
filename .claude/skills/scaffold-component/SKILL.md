---
description: Scaffold a React component and its Vitest test file, following project conventions
argument-hint: <component description> (e.g. "ExpenseCard display component" or "TransactionFilter form")
---

# Scaffold React Component

Request: $ARGUMENTS

## Context

- Existing components: !`find /Users/danilo/www/vida/frontend/src/components -name "*.tsx" ! -name "*.test.tsx" | sort`
- Existing UI primitives: !`find /Users/danilo/www/vida/frontend/src/components/ui -name "*.tsx" | sort`
- Existing types: !`find /Users/danilo/www/vida/frontend/src/types -name "*.ts" 2>/dev/null | sort`

## Your task

### Step 1 — Clarify the component

Parse $ARGUMENTS to determine:
- Component name in PascalCase (e.g. `ExpenseCard`, `TransactionFilter`)
- File name in kebab-case (e.g. `expense-card.tsx`, `transaction-filter.tsx`)
- Component category: `ui/` (generic primitive) or a feature subfolder (e.g. `expenses/`, `bills/`)
- Props interface name: `<ComponentName>Props`
- Whether it's presentational (no side effects) or connected (uses a store or makes API calls)

### Step 2 — Fetch docs

Use Context7 MCP to fetch current React docs:
1. `mcp__claude_ai_Context7__resolve-library-id` for `react`
2. `mcp__claude_ai_Context7__query-docs` for relevant hooks (useState, useEffect, forwardRef, etc.)

### Step 3 — Create the component file

Create `frontend/src/components/<subfolder>/<kebab-name>.tsx`:

```typescript
interface ComponentNameProps {
  // props here
}

export function ComponentName({ ...props }: ComponentNameProps) {
  return (
    <div className="">
      {/* content */}
    </div>
  );
}
```

Key rules:
- Named export only — no default exports
- File name in kebab-case; component in PascalCase
- All styling via Tailwind CSS — dark theme (bg-gray-950, text-white, text-gray-400)
- Use existing UI primitives from `components/ui/` (Button, Input, Label) instead of raw HTML where applicable
- Use `sonner` toast for user feedback: `import { toast } from "sonner"`
- Props interface defined in the same file unless shared across multiple components

### Step 4 — Create the test file

Create `frontend/src/components/<subfolder>/<kebab-name>.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ComponentName } from "./<kebab-name>";

describe("ComponentName", () => {
  it("should render without crashing", () => {
    render(<ComponentName />);
    // assert something visible
  });

  it("should display the correct content", () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText("expected text")).toBeInTheDocument();
  });
});
```

Test rules:
- All `it()` blocks must start with "should "
- Use `@testing-library/react` — no Enzyme, no shallow rendering
- Test behavior from the user's perspective, not implementation details
- Mock external dependencies (stores, services) at the module level

### Step 5 — Run checks

```bash
cd /Users/danilo/www/vida/frontend && npm run check && npm run test
```

Fix all failures. Report the component file path and test file path when done.
