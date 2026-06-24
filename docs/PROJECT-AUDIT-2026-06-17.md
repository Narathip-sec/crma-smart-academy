# Project Audit - 2026-06-17

Purpose: separate active implementation files from old prototype/design material so future agents do not mix the legacy Claude bundle into the current Next.js app.

## Summary

- Active app is `web/`.
- User-confirmed latest requirements are `docs/CLAUDE-CODE-BUILD-PLAN.md` and `docs/CLAUDE-CODE-TASK-BREAKDOWN.md`.
- Root folder is not currently a git repository.
- `web/` passed lint and production build before cleanup.
- Old hidden design bundle moved out of root.
- Research documents moved under `docs/`.
- Removed web files were archived instead of deleted.
- `/health` was removed from active routes because the current plan says Lost & Found replaces Health AI.
- Generated `web/.next/` and `web/tsconfig.tsbuildinfo` were removed after verification.

## Active Source

Use these for current development:

- `docs/CLAUDE-CODE-BUILD-PLAN.md`
- `docs/CLAUDE-CODE-TASK-BREAKDOWN.md`
- `web/src/app/`
- `web/src/components/`
- `web/src/lib/`
- `web/prisma/schema.prisma`
- `docs/design-handoff/claude-design/CRMA Smart Academy Standalone.html`
- `docs/ingested/`
- `docs/sources/`
- `docs/research/`

## Archived Material

Historical or removed files are here:

- `docs/archive/legacy-claude-design-2026-05-22/`
- `docs/archive/removed-from-web-2026-06-17/`

Do not use archived material as active source unless the user explicitly asks for restoration or comparison.

## Files Moved

Moved for clarity:

```text
.design-tmp/ -> docs/archive/legacy-claude-design-2026-05-22/
Documents/ -> docs/research/
```

Moved out of active `web/` source:

```text
web/src/app/health/ -> docs/archive/removed-from-web-2026-06-17/src/app/health/
web/src/components/shell/chip.tsx -> docs/archive/removed-from-web-2026-06-17/src/components/shell/chip.tsx
web/src/components/shell/image-placeholder.tsx -> docs/archive/removed-from-web-2026-06-17/src/components/shell/image-placeholder.tsx
web/public/file.svg -> docs/archive/removed-from-web-2026-06-17/public/file.svg
web/public/globe.svg -> docs/archive/removed-from-web-2026-06-17/public/globe.svg
web/public/next.svg -> docs/archive/removed-from-web-2026-06-17/public/next.svg
web/public/vercel.svg -> docs/archive/removed-from-web-2026-06-17/public/vercel.svg
web/public/window.svg -> docs/archive/removed-from-web-2026-06-17/public/window.svg
```

## Kept Intentionally

These may look unused today but should stay:

- `web/src/components/ui/*` - planned shared UI primitives from the current rebuild plan.
- `web/src/lib/db.ts` - Prisma singleton for future DB wiring.
- `web/src/lib/liff.ts` - LIFF helper with local mock fallback.
- `web/prisma/schema.prisma` - planned data model.
- `web/src/lib/mock-data.ts` and `web/src/lib/data/*` - current mock/CSV data layer before DB integration.
- `lucide-react` dependency - planned icon library; current source has not fully migrated to it yet.

## Behavior Fix

`web/src/app/layout.tsx` now hides `DevToolbar` in production unless `NEXT_PUBLIC_DEV_TOOLBAR=1`.

## Current Active Routes

```text
/
/class
/todo
/activity
/activity/[id]
/activity/new
/service
/profile
/calendar
/meals
/report
/report/tickets
/lost-found
/lost-found/[id]
/notifications
/settings
```

`/health` is archived and no longer active.

## Verification

Passed from `web/` after cleanup:

```bash
npm run lint
npm run build
```

Production build route list no longer includes `/health`.
