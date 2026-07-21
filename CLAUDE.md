# CRMA Smart Academy LIFF - Agent Guide

This file is for coding agents working in this folder.

## Active Project

The active application is:

- `web/` - Next.js 16 App Router LIFF app
- `web/src/` - current production source
- `web/prisma/schema.prisma` - planned database schema

Run app commands from `web/`.

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Current Sources Of Truth

Read in this order:

1. `README.md` - project map and active/archived folders.
2. `docs/CLAUDE-CODE-BUILD-PLAN.md` - approved latest requirements.
3. `docs/CLAUDE-CODE-TASK-BREAKDOWN.md` - approved executable task breakdown.
4. `docs/PROJECT-AUDIT-2026-06-17.md` - cleanup/audit notes and file boundaries.
5. `docs/design-handoff/claude-design/CRMA Smart Academy Standalone.html` - approved visual reference.
6. `docs/research/` - thesis/source research.
7. `docs/ingested/` and `docs/sources/` - imported pilot schedule/calendar data.

When implementation details conflict, the latest Build Plan and Task Breakdown win over older docs and archived files. Use the audit only to avoid reviving stale files or old routes.

## Important Boundaries

- Do not use `docs/archive/` as active implementation input unless the user explicitly asks for historical comparison or restoration.
- The old Claude Design bundle was moved from `.design-tmp/` to `docs/archive/legacy-claude-design-2026-05-22/`.
- The old Health AI route was moved to `docs/archive/removed-from-web-2026-06-17/`; it is not active scope.
- Lost & Found replaces Health in the current app scope.
- Default Next public SVG assets were archived because they were unused.
- Generated output such as `web/.next/` and `web/tsconfig.tsbuildinfo` is not source.

## Current App Scope

Active routes:

- `/`
- `/class`
- `/todo`
- `/activity`
- `/activity/[id]`
- `/activity/new`
- `/service`
- `/profile`
- `/calendar`
- `/meals`
- `/report` (list-first; `/report/tickets` now redirects here)
- `/report/new`
- `/lost-found`
- `/lost-found/[id]`
- `/lost-found/new`
- `/announcements`
- `/announcements/[id]`
- `/notifications`
- `/settings`
- `/settings/pdpa`

Keep bilingual Thai/English UI, LIFF-first mobile layout, PDPA-aware data handling, and the approved Academy Teal visual direction.
