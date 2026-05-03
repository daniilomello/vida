---
description: Analyze the frontend bundle and list the largest dependencies
argument-hint: (no arguments needed)
---

# Bundle Size

## Context

- Frontend package.json dependencies: !`node -p "Object.keys(require('/Users/danilo/www/vida/frontend/package.json').dependencies || {}).join(', ')"`
- Vite config: !`cat /Users/danilo/www/vida/frontend/vite.config.ts`

## Your task

### Step 1 — Build with rollup stats

Run a production build with bundle stats enabled:

```bash
cd /Users/danilo/www/vida/frontend && npm run build -- --mode production 2>&1
```

If `rollup-plugin-visualizer` is not installed, check if `vite-bundle-visualizer` or similar is available:
```bash
cd /Users/danilo/www/vida/frontend && npx vite-bundle-visualizer --open false 2>/dev/null || \
  npm run build 2>&1
```

### Step 2 — Measure output sizes

After build, measure the dist output:
```bash
find /Users/danilo/www/vida/frontend/dist -name "*.js" -o -name "*.css" | \
  xargs ls -lh | sort -k5 -rh | head -20
```

Also get total bundle size:
```bash
du -sh /Users/danilo/www/vida/frontend/dist
```

### Step 3 — Identify large dependencies

Using the build output or a quick analysis:
```bash
cd /Users/danilo/www/vida/frontend && node -e "
const pkg = require('./package.json');
const deps = {...(pkg.dependencies||{}), ...(pkg.devDependencies||{})};
Object.entries(deps).forEach(([k,v]) => console.log(k, v));
"
```

Cross-reference the chunk names in `dist/assets/` with known large libraries.

### Step 4 — Report

Produce a report:

```
Total bundle size: X MB

Top 10 largest chunks:
1. index-[hash].js     — 420 KB   (main app bundle)
2. vendor-[hash].js    — 280 KB   (likely: react, react-dom)
3. charts-[hash].js    — 95 KB    (likely: recharts)

Dependency sizes (estimated):
- react + react-dom    ~130 KB gzipped
- zustand              ~3 KB gzipped
- sonner               ~7 KB gzipped
```

### Step 5 — Recommendations

Flag any chunk over 200 KB uncompressed and suggest:
- Code splitting with `React.lazy()` + `Suspense`
- Dynamic imports for rarely-used routes
- Lighter alternatives for oversized deps
- Whether tree-shaking is working correctly for utility libs (lodash, date-fns, etc.)
