# CRMA Smart Academy LINE LIFF

Project folder for the CRMA Smart Academy cadet service app.

## Start Here

- Active app: `web/`
- Current source code: `web/src/`
- Database schema: `web/prisma/schema.prisma`
- Approved latest requirements: `docs/CLAUDE-CODE-BUILD-PLAN.md`
- Approved executable task list: `docs/CLAUDE-CODE-TASK-BREAKDOWN.md`
- Latest cleanup notes: `docs/PROJECT-AUDIT-2026-06-17.md`

Run development commands from `web/`:

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Folder Map

```text
web/                         Active Next.js LIFF app
docs/                        Planning, handoff, imported data, research
docs/design-handoff/         Approved design reference and screenshots
docs/ingested/               Parsed pilot CSV/text data
docs/sources/                Source PDFs for imported data
docs/research/               Thesis/research files moved from old Documents/
docs/archive/                Historical or removed files, not active source
.claude/                     Local Claude settings
```

## Current Source Boundaries

Use `web/src` for implementation work.

Use `docs/CLAUDE-CODE-BUILD-PLAN.md` and `docs/CLAUDE-CODE-TASK-BREAKDOWN.md` as the approved current requirements. The audit file only explains cleanup and file boundaries.

Use `docs/design-handoff/claude-design/CRMA Smart Academy Standalone.html` as the approved visual reference.

Do not revive files from `docs/archive/` unless the task explicitly asks for historical comparison or restoration. The archived Claude Design bundle and removed Health AI route are kept there only so they are not lost.

Generated files such as `web/.next/` and `web/tsconfig.tsbuildinfo` are not source and can be recreated by Next.js.

## Active Routes

The active app currently includes:

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

`/health` is not active scope. Its old implementation is archived at `docs/archive/removed-from-web-2026-06-17/`.
