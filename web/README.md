# CRMA Smart Academy - LIFF App

Next.js 16 App Router + TypeScript + Tailwind v4 + Prisma 6 + LIFF v2.

This is the active application. The root `README.md` and `CLAUDE.md` explain which surrounding folders are active references and which are archived.

## Run

```bash
npm install
npm run dev             # http://localhost:3000
npm run lint
npm run build
npx prisma generate     # after schema edits
npx prisma migrate dev  # needs live DATABASE_URL
```

## Environment

Copy `.env.example` to `.env` when local secrets/config are needed.

- `DATABASE_URL` - optional for now; UI still uses local mock/data modules.
- `NEXT_PUBLIC_LIFF_ID` - optional for local dev; `src/lib/liff.ts` returns a mock profile when blank.
- `NEXT_PUBLIC_DEV_TOOLBAR` - production hides the dev toolbar unless this is set to `1`.

## Current Layout

```text
src/
  app/                  App Router pages
  components/home/      Home widgets
  components/shell/     LIFF shell: app bar, top bar, bottom nav, providers
  components/ui/        Reusable UI primitives for the rebuild
  lib/                  i18n, theme, LIFF, Prisma singleton, mock/data modules
prisma/
  schema.prisma         POC schema for cadets, courses, grades, schedule
```

## Active Routes

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

## Current Status

- Academy Teal visual direction is active.
- Bilingual Thai/English UI is wired through React context.
- Light/dark theme is available through the local dev toolbar.
- 5-tab bottom nav: Home, Class, Todo, Activity, Service.
- Implemented MVP-style pages: Home, Profile, Class, Calendar, Todo, Activity, Meals, Report, Service.
- Phase 2 placeholder routes remain for detail/create/settings/notifications flows.
- Old Health AI route is archived, not active.
- Prisma schema and LIFF helper are present, but DB/auth/push integrations are not yet wired.

## Notes

Do not import implementation from `docs/archive/`. It contains removed or historical files only.
