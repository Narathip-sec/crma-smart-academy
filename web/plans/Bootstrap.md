# Phase 1 — Bootstrap `web/` Workspace

> **Status:** DRAFT — pending user approval before execution.
> **Loop position:** brainstorming ✅ → **writing-plans (this doc)** → TDD → cross-AI review → commit
> **Date:** 2026-05-19
> **Inputs:** `README.md §3` (locked stack), `MIGRATION_LIFF.md §3` (target layout), `MIGRATION_LIFF.md §14` (Phase 1 row).
> **DoD:** `pnpm typecheck` clean, `pnpm test` green (1 smoke test minimum), `pnpm test:e2e` green (1 smoke test), CI workflow green on first push, `prisma generate` succeeds, `pnpm build` produces `.next/` artifact.

---

## 0. Goal

Stand up the empty-but-validated chassis so Phase 2 (Auth) can land a single-file change and ship through CI. **No business logic in Phase 1.** Only scaffolding, configs, one smoke test per layer, and a green CI pipeline.

Out of scope for Phase 1: any LIFF code, any LINE API code, any auth code, any UI beyond a placeholder, any Prisma model bodies (only the file + datasource block).

---

## 1. Decision lock-in (resolved up-front)

| # | Decision | Value | Source |
|---|---|---|---|
| 1 | Package manager | **pnpm** (v9+) | User decision 2026-05-19 |
| 2 | Node version | **22 LTS** (engines pin in `package.json`) | User decision 2026-05-19 |
| 3 | Workspace layout | flat `web/` subdir (not monorepo) | `MIGRATION_LIFF.md §3` |
| 4 | TypeScript | 5.4, `strict: true`, `noUncheckedIndexedAccess: true` | `README.md §3` |
| 5 | Styling | Tailwind v4 (CSS-first, no `tailwind.config.ts` needed) + class-variance-authority | `README.md §3` |
| 6 | DB driver | Prisma 5 → PostgreSQL; placeholder `DATABASE_URL` until Phase 2 | `README.md §3` |
| 7 | Test runner | Vitest + `@testing-library/react` + `@testing-library/jest-dom` + `jsdom` | `MIGRATION_LIFF.md §13` |
| 8 | E2E | Playwright (Chromium + WebKit; LINE webview UA configured but no LIFF code yet) | `MIGRATION_LIFF.md §13` |
| 9 | Lint/format | ESLint (Next preset + import order) + Prettier | implicit Next 15 default |
| 10 | Git hooks | Husky + lint-staged (pre-commit: typecheck + lint changed) | superpowers DoD |
| 11 | CI | GitHub Actions (`.github/workflows/ci.yml`) | `MIGRATION_LIFF.md §12` |

Open forks deferred (not needed Phase 1): `§1 row 7` (realtime), `§1 row 12` (Vercel Blob).

---

## 2. Target file tree after Phase 1

```
.
├─ .github/
│  └─ workflows/
│     └─ ci.yml
├─ web/
│  ├─ app/
│  │  ├─ layout.tsx              ← <html lang="th"> shell only
│  │  ├─ page.tsx                ← placeholder "Phase 1 chassis OK"
│  │  └─ globals.css             ← Tailwind v4 @import
│  ├─ lib/
│  │  └─ prisma.ts               ← singleton client (no models used yet)
│  ├─ prisma/
│  │  └─ schema.prisma           ← datasource + generator only
│  ├─ e2e/
│  │  └─ smoke.spec.ts           ← visits / and asserts placeholder text
│  ├─ __tests__/
│  │  └─ smoke.test.tsx          ← renders <Home /> and asserts placeholder
│  ├─ plans/
│  │  └─ Bootstrap.md            ← this file
│  ├─ .env.example               ← documented vars (no secrets)
│  ├─ .eslintrc.json
│  ├─ .prettierrc
│  ├─ next.config.mjs
│  ├─ playwright.config.ts
│  ├─ postcss.config.mjs
│  ├─ tsconfig.json
│  ├─ vitest.config.ts
│  ├─ vitest.setup.ts
│  └─ package.json
├─ .husky/
│  └─ pre-commit
└─ pnpm-workspace.yaml          ← single member: ["web"]
```

---

## 3. Execution order (TDD: write failing test → make pass → commit)

Each step is one atomic commit. Order matters — earlier steps unblock later ones.

### Step 3.1 — pnpm workspace root
- Create `pnpm-workspace.yaml` with `packages: ["web"]`.
- Create `web/` dir.
- Commit: `chore(phase1): init pnpm workspace`

### Step 3.2 — Next 15 + TS strict scaffold
- `cd web && pnpm create next-app@latest . --ts --app --tailwind --eslint --src-dir=false --import-alias="@/*" --no-turbopack` (non-interactive flags).
  *(If interactive prompts surface, abort and hand-write `package.json` per Appendix A — non-interactive run is mandatory.)*
- Patch `tsconfig.json`:
  - `"strict": true`
  - `"noUncheckedIndexedAccess": true`
  - `"forceConsistentCasingInFileNames": true`
- Patch `package.json`:
  - `"engines": { "node": ">=22", "pnpm": ">=9" }`
  - `"packageManager": "pnpm@9.x"`
  - scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`, `test:e2e:ui`, `prisma`, `prisma:migrate`, `format`.
- Verify: `pnpm typecheck` clean, `pnpm build` succeeds.
- Commit: `chore(phase1): scaffold Next 15 + TS strict`

### Step 3.3 — Tailwind v4 CSS-first
- Tailwind v4 uses `@import "tailwindcss";` in `globals.css` (no `tailwind.config.ts` required for stock).
- `postcss.config.mjs`: `{ plugins: { '@tailwindcss/postcss': {} } }`.
- Replace `app/page.tsx` body with `<main className="grid min-h-dvh place-items-center bg-slate-50 text-slate-900"><h1 className="text-2xl font-semibold">Phase 1 chassis OK</h1></main>`.
- Note: uses `min-h-dvh` not `min-h-screen` (LIFF iOS quirk per `MIGRATION_LIFF.md §9`).
- Commit: `chore(phase1): tailwind v4 + dvh placeholder`

### Step 3.4 — Vitest + RTL
- Install: `vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`.
- `vitest.config.ts`:
  ```ts
  import react from '@vitejs/plugin-react'
  import { defineConfig } from 'vitest/config'
  export default defineConfig({
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      globals: true,
      include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['e2e/**', 'node_modules/**'],
    },
    resolve: { alias: { '@': new URL('./', import.meta.url).pathname } },
  })
  ```
- `vitest.setup.ts`: `import '@testing-library/jest-dom/vitest'`.
- Failing test first (`__tests__/smoke.test.tsx`):
  ```tsx
  import { render, screen } from '@testing-library/react'
  import Home from '@/app/page'
  test('placeholder renders', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /phase 1 chassis ok/i })).toBeInTheDocument()
  })
  ```
- Run `pnpm test` → must pass (page already exists from Step 3.3, so this is a green-on-arrival pin — that's OK for chassis).
- Commit: `chore(phase1): vitest + RTL smoke`

### Step 3.5 — Playwright + LINE webview UA
- Install: `@playwright/test`, then `pnpm exec playwright install chromium webkit`.
- `playwright.config.ts`:
  ```ts
  import { defineConfig, devices } from '@playwright/test'
  const LINE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Line/13.0.0'
  export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
    projects: [
      { name: 'line-ios', use: { ...devices['iPhone 14'], userAgent: LINE_UA } },
      { name: 'line-android', use: { ...devices['Pixel 7'], userAgent: LINE_UA.replace('iPhone', 'Linux; Android 14') } },
      { name: 'safari', use: { ...devices['Desktop Safari'] } },
    ],
    webServer: {
      command: 'pnpm build && pnpm start',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  })
  ```
- Failing test (`e2e/smoke.spec.ts`):
  ```ts
  import { test, expect } from '@playwright/test'
  test('home renders placeholder', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /phase 1 chassis ok/i })).toBeVisible()
  })
  ```
- Run `pnpm test:e2e` → must pass.
- Commit: `chore(phase1): playwright + LINE webview UA matrix`

### Step 3.6 — Prisma 5 init (schema-only)
- Install: `prisma @prisma/client`.
- `web/prisma/schema.prisma`:
  ```prisma
  generator client {
    provider = "prisma-client-js"
  }
  datasource db {
    provider  = "postgresql"
    url       = env("DATABASE_URL")
    directUrl = env("DIRECT_URL")
  }
  ```
- `web/lib/prisma.ts`:
  ```ts
  import { PrismaClient } from '@prisma/client'
  const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
  export const prisma = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  ```
- `.env.example`:
  ```
  DATABASE_URL=postgresql://user:pass@localhost:5432/crma?schema=public
  DIRECT_URL=postgresql://user:pass@localhost:5432/crma?schema=public
  ```
- `pnpm prisma generate` must succeed (no models yet → empty client OK).
- Commit: `chore(phase1): prisma 5 init (schema-only)`

### Step 3.7 — ESLint + Prettier + import order
- Verify Next ESLint preset present; add `eslint-plugin-import` + `eslint-plugin-unused-imports`.
- `.prettierrc`: `{ "semi": false, "singleQuote": true, "trailingComma": "all", "printWidth": 100 }`.
- `pnpm lint` must pass.
- Commit: `chore(phase1): eslint + prettier`

### Step 3.8 — Husky + lint-staged
- Install: `husky lint-staged`.
- `package.json`:
  ```json
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{md,json,css}": ["prettier --write"]
  }
  ```
- `.husky/pre-commit`: `pnpm lint-staged && cd web && pnpm typecheck`.
- Commit: `chore(phase1): husky + lint-staged pre-commit`

### Step 3.9 — CI workflow
- `.github/workflows/ci.yml`:
  ```yaml
  name: ci
  on:
    pull_request:
    push:
      branches: [main]
  jobs:
    web:
      runs-on: ubuntu-latest
      defaults: { run: { working-directory: web } }
      steps:
        - uses: actions/checkout@v4
        - uses: pnpm/action-setup@v4
          with: { version: 9 }
        - uses: actions/setup-node@v4
          with: { node-version: 22, cache: pnpm, cache-dependency-path: web/pnpm-lock.yaml }
        - run: pnpm install --frozen-lockfile
        - run: pnpm prisma generate
        - run: pnpm lint
        - run: pnpm typecheck
        - run: pnpm test --run
        - run: pnpm exec playwright install --with-deps chromium webkit
        - run: pnpm test:e2e
  ```
- Note: `prisma migrate diff` deferred to Phase 2 (no models yet to diff).
- Commit: `ci(phase1): typecheck + lint + vitest + playwright`

### Step 3.10 — README progress tracker mirror
- `README.md §6`: Phase 1 row → `2026-05-XX | Phase 1 — Bootstrap web/ | Next 15 · Tailwind v4 · Prisma · Vitest · Playwright · CI green.`
- `README_TH.md §6`: same row in Thai (bilingual parity rule).
- Commit: `docs(phase1): mark phase 1 done in progress tracker`

---

## 4. What's NOT in Phase 1 (verify nothing leaks in)

- ❌ No `liff.init` import or LIFF SDK install (Phase 2).
- ❌ No real Prisma models beyond schema header (Phase 2).
- ❌ No `app/(public)` / `app/(app)` route groups (Phase 3).
- ❌ No Zustand store, no `useTabStore` (Phase 3).
- ❌ No `IphoneFrame` / `BottomNav` / `AppHeader` (Phase 3).
- ❌ No fixtures port from mobile (Phase 4+).
- ❌ No middleware, no JWT, no audit log (Phase 2).
- ❌ No Vercel deploy yet (do after CI green to avoid red preview spam).

If any of these sneak in during execution, abort that commit and split.

---

## 5. TDD discipline notes

Phase 1 is mostly chassis — true red-green-refactor applies only to Steps 3.4 and 3.5 (Vitest + Playwright). Pattern:

1. Write the failing test against the *intended* state (placeholder heading).
2. The Step 3.3 placeholder already satisfies it → green on arrival.
3. This pins the contract: any future regression that breaks the placeholder fails CI.

For chassis-only commits (Steps 3.1–3.3, 3.6–3.9), DoD is `pnpm typecheck && pnpm lint && pnpm build` clean. No new test required.

---

## 6. Risks specific to Phase 1

| Risk | Mitigation |
|---|---|
| `create-next-app` interactive prompts hang Windows shell | Use all flags shown in Step 3.2; if prompted, fall back to Appendix A handwritten config. |
| Tailwind v4 PostCSS plugin churn | Pin `@tailwindcss/postcss` exact version in lockfile. |
| Prisma `binaryTargets` on Windows dev → Linux CI mismatch | Add `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` to generator block if CI complains. Defer until red. |
| Playwright browser download in CI (slow) | Cache via `actions/cache` keyed on `playwright` version — defer to Phase 2 if Phase 1 CI runs ≤ 5 min. |
| Husky pre-commit blocks WIP commits | Document `git commit --no-verify` is **forbidden** per CLAUDE.md; if hook is wrong, fix the hook. |
| LINE webview UA test passes on Chromium but real LIFF differs | Phase 1 only smoke-tests UA injection works; real LIFF behavior is Phase 2. |

---

## 7. Approval gate

Before executing Steps 3.1–3.10:

- [ ] User confirms file tree (§2) — anything to add/move?
- [ ] User confirms commit sequence (§3) — split further or batch?
- [ ] User confirms `.env.example` placeholder values acceptable until Phase 2 provisions Supabase.
- [ ] User confirms cross-AI review will run on the Phase 1 PR before merge (per superpowers loop).

On approval → claim task #4 (Scaffold) in TaskList and proceed step-by-step.

---

## Appendix A — Handwritten `package.json` (fallback if `create-next-app` interactive)

```json
{
  "name": "crma-smart-academy-web",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "engines": { "node": ">=22", "pnpm": ">=9" },
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "prisma": "prisma",
    "prisma:migrate": "prisma migrate dev",
    "format": "prettier --write ."
  },
  "dependencies": {
    "next": "15.x",
    "react": "19.x",
    "react-dom": "19.x",
    "@prisma/client": "5.x"
  },
  "devDependencies": {
    "@playwright/test": "1.x",
    "@tailwindcss/postcss": "4.x",
    "@testing-library/jest-dom": "6.x",
    "@testing-library/react": "16.x",
    "@testing-library/user-event": "14.x",
    "@types/node": "22.x",
    "@types/react": "19.x",
    "@types/react-dom": "19.x",
    "@vitejs/plugin-react": "4.x",
    "eslint": "9.x",
    "eslint-config-next": "15.x",
    "eslint-plugin-import": "2.x",
    "eslint-plugin-unused-imports": "4.x",
    "husky": "9.x",
    "jsdom": "25.x",
    "lint-staged": "15.x",
    "prettier": "3.x",
    "prisma": "5.x",
    "tailwindcss": "4.x",
    "typescript": "5.4.x",
    "vitest": "2.x"
  }
}
```

---

## Appendix B — `tsconfig.json` overlay (apply after `create-next-app`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```
