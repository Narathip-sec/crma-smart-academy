# Sonnet 5 Execution Playbook — CRMA Smart Academy UI Unification

**Authored by:** Fable 5 (analysis + process design) · **Executed by:** Sonnet 5 sessions
**Date:** 2026-07-09 · **Deadline context:** professor demo 2026-08-10, see `docs/AUDIT-AND-TIMELINE-2026-07-09.md`

## How to use this file

Start a Claude Code session on Sonnet 5 in this repo and say:

> Read `docs/SONNET-EXECUTION-PLAYBOOK.md` and execute the next unchecked task. Follow the Method and Guardrails exactly. Check the box and commit when the task's acceptance criteria pass.

One task per session is fine; several per session is fine too. **Work top-to-bottom — tasks are dependency-ordered.** Update the checkboxes in this file as you go (that is the shared state between sessions).

---

## 1. Frozen context (do not re-derive, do not second-guess)

Facts verified 2026-07-09 by full-codebase audit:

- Stack: Next.js 16 App Router (**read `web/AGENTS.md` — this Next version has breaking changes; check `node_modules/next/dist/docs/` when unsure**), React 19, Tailwind v4 CSS-first (no `tailwind.config`; theme lives in `web/src/app/globals.css` under `@theme inline`), Prisma 6 + Postgres, `@line/liff` 2.29.
- App is **mobile-only LIFF** — max width 420px, centered. No tablet/desktop breakpoints, ever.
- All commands run from `web/`: `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run dev`.
- Verified green baseline: lint OK, tsc OK, production build OK (after Fable's token pass below).

### Already done — never redo, never revert

1. Legacy alias vars (`--paper`, `--ink2`, `--crimson`, `--gold`, `--bone`, `--bone2`, `--gray`, `--gray2`, `--rule`, `--shade`, `--shade2`, `--good`) **deleted** from `globals.css`. If you see one referenced anywhere, that is a bug — replace with a real token.
2. Category tokens exist with light + dark values: `--cat-exam`, `--cat-academic`, `--cat-military`, `--cat-activity`, `--cat-notice`. All old Material hexes were mapped onto them.
3. **Alpha-concat is banned and was purged.** The old pattern `someColor + "18"` produced invalid CSS whenever the color was a `var()`. The replacement idiom, used ~20 places already:
   ```ts
   background: `color-mix(in srgb, ${someColor} 10%, transparent)`
   ```
   (12% for warning washes, 10% for the rest.) Never concatenate alpha hex digits onto a color string.
4. Geometry canon: cards **16px** (`rounded-2xl` / `CARD_RADIUS`), buttons + inputs **12px** (`rounded-xl` / `CONTROL_RADIUS`), chips/pills `rounded-full`/`999`. CSS vars `--radius-card` and `--radius-control` exist. No other radii allowed (exception: `CampusPinMap` container 16 is fine).
5. Type scale utilities exist in `@theme`: `text-caption` (11px), `text-body` (13px), `text-title` (15px), `text-heading` (20px). These are the only four sizes screens should use. Font stack: `var(--font-sans)` (Sarabun).
6. Root `web/src/app/error.tsx` and `not-found.tsx` exist (Thai-first bilingual, token-styled).
7. Lint errors fixed: `meals/page.tsx` fetch is now week-keyed state (no setState-in-effect); keep that pattern when touching fetch code.

### Color decision table (memorize; apply without asking)

| Meaning | Token |
|---|---|
| Brand / primary action / active nav | `var(--brand)`, darker text-on-tint: `var(--brand-dark)` |
| Page background / card / divider | `var(--bg)` / `var(--surface)` / `var(--line)` |
| Primary / secondary text | `var(--ink)` / `var(--muted)` |
| Danger, urgent, lost, Sunday | `var(--danger)` |
| Success, resolved, found, done | `var(--success)` |
| Pending, in-progress, holiday, meals-accent | `var(--warning)` |
| Exams / สอบ | `var(--cat-exam)` |
| Academic / วิชาการ / grades / "new" badges | `var(--cat-academic)` |
| Military / ทหาร | `var(--cat-military)` |
| Activities / กิจกรรม / sports | `var(--cat-activity)` |
| General notices / ประกาศ / deadlines / "matched" / dinner | `var(--cat-notice)` |
| Tint wash behind icon/badge | `color-mix(in srgb, <token> 10%, transparent)` |
| White text on colored bg | literal `#fff` — allowed, do not tokenize |
| `rgba(255,255,255,.N)` overlays on hero gradients | allowed as-is |

---

## 2. Method (the Fable process — follow per task)

1. **Read before edit.** Read the whole target file first. Read `web/src/components/ui/index.ts` exports so you know what the kit already offers.
2. **Inventory, then classify.** List each inline `style={{}}` in the file into three buckets:
   - **(a) kit-replaceable** — hand-rolled card/button/badge/header → replace with kit component;
   - **(b) token-normalizable** — stays inline but values must be tokens (`var(--…)`, `--radius-*`, the 4 type sizes);
   - **(c) legitimate** — dynamic values (computed colors, positions), gradients, safe-area padding. Leave alone.
   Target is **zero ad-hoc constants**, not zero inline styles.
3. **Normalize typography.** Inline `font: "600 13px var(--font-sans)"` shorthands: keep the ones that match the scale (11/13/15/20 → weight + size fine), bump off-scale sizes to the nearest step (9px, 10px → 11px caption; 12px → 13px; 14px → 13px or 15px by role; 16–18px → 15px title or 20px heading by role). **Judgment rule:** labels/timestamps/badges = caption; body/list text = body; card titles = title; page/hero titles = heading.
4. **Do not change behavior.** No data-flow, fetch, state, or routing changes during a UI sweep task, except where the task spec explicitly says so.
5. **Verify every task:** `npm run lint && npx tsc --noEmit` must pass. If you changed a page's structure heavily, also `npm run build`.
6. **Eyeball it.** Run `npm run dev`, open the page at 390×844 viewport, compare against neighboring pages for sameness. If a change looks worse, prefer the look of `/todo` and `/class` (best-condition pages).
7. **Commit per task**, message format below, then check the box in §3.

Commit format:

```
fix(ui): <task id> <short description>

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

### Guardrails (hard rules)

- Never introduce a hex color, a new radius, or a font size outside the scale. Grep yourself before committing: `grep -rnE '#[0-9a-fA-F]{6}' src --include='*.tsx' | grep -viE '#fff'` should show **no new lines** vs. baseline (baseline leftovers: `layout.tsx` themeColor, `profile-banner.tsx` `#4cff91`, `lib/tokens.ts` BRAND, orphaned `lib/data/activity.ts`, `lib/mock-data.ts`).
- Never edit `prisma/`, `src/app/api/` (except T14), `src/lib/db.ts`, `src/lib/rbac.ts`.
- Keep every string bilingual TH/EN exactly as found; never drop the Thai.
- Do not delete `mock-data.ts` or mock imports (that is Week 2 scope, not yours).
- Do not add dependencies. Do not create new files unless the task says to.
- Do not touch `docs/archive/**`.
- If a task turns out to require >3 files beyond its spec, stop, write what you found under "Notes" at the bottom of this file, and end the session — Fable/user will re-scope.

---

## 3. Task queue

### T1 — Strengthen the UI kit ☑ (done by Fable 2026-07-09; PageHeader skipped — AppBar already covers the need)

Files: `web/src/components/ui/button.tsx`, new `list-item.tsx`, new `form-field.tsx`, new `page-header.tsx`, update `index.ts`.

1. **Button**: add `size?: "sm" | "md" | "lg"` (md default). Padding: sm `6px 12px`, md `10px 16px`, lg `14px 16px` + `width:100%` when `full`. Font: sm caption-11/600, md body-13/600, lg 14→use 15/600. Radius: `var(--radius-control)`. Add `disabled` visual (opacity .5, cursor not-allowed). Keep existing variants and prop API — nothing that compiles today may break.
2. **ListItem** (new): the row pattern hand-rolled on service/settings/notifications pages — `flex items-center gap-3` row with optional leading icon bubble (40×40, rounded-xl, tinted bg), title (body/600, ink), optional subtitle (caption, muted), optional trailing element or chevron. Props: `icon?, iconBg?, title: ReactNode, subtitle?, trailing?, chevron?, onClick?, href?` (render `Link` when href).
3. **FormField** (new): label + control + error wrapper used by report/lost-found-new/activity-new forms. Props: `label: ReactNode, required?, error?, children` — caller localizes label via `useTx`/`t({th,en})` (API adjusted during T2: pages toggle languages at runtime, so a combined `labelTh · labelEn` render was wrong). Label row: caption/600 muted with required `*` in danger. Error line: caption in danger.
4. **PageHeader** (new): thin wrapper around existing `AppBar` (`shell/app-bar.tsx`) adding optional subtitle — check AppBar first; if AppBar already covers everything the pages need, skip this component and note it.
5. Export all from `ui/index.ts`.

Accept: lint+tsc green; no page visually changes yet (kit additions only).

### T2 — Sweep `/report` (329 lines, worst) ☑ (done by Fable 2026-07-09 — use as the reference example for T3–T10: FormField for labeled controls incl. photo/map sections, Button size="lg" full for submit, inputStyle radius via --radius-control, 12px→13 body / 10px→caption)
`src/app/report/page.tsx`. Replace hand-rolled form rows with `FormField`, submit button with `Button size="lg" full`, input radius → `var(--radius-control)` (there's a shared `inputStyle` object at top — normalize it once), font shorthands → scale. Keep photo upload + fetch logic untouched.

### T3 — Sweep `/todo` (288) ☑ (done by Fable 2026-07-09 — filter row + sheet chips use ui Chip/ChipRow; sheet form uses FormField + Button ghost/primary lg; FAB kept custom)
`src/app/todo/page.tsx`. FAB stays custom (it's fine). Filter chips → check `ui/seg.tsx` or `ui/chip.tsx` fit; if props don't fit, normalize inline values only. Bottom-sheet form → `FormField` + `Button`. Off-scale 9/10px fonts → caption.

### T4 — Sweep `/profile` (155) + `/settings` (108) ☐
Settings rows → `ListItem`. Profile stat tiles/semester segments: token-normalize; hero header (teal gradient) is legitimate-inline, leave structure.

### T5 — Sweep `/calendar` (293) ☐
Dense custom grid = mostly legitimate inline. Normalize fonts to scale, radii, and any `rgba(0,0,0,…)` shadows → copy the shadow used by `ui/card.tsx` for consistency.

### T6 — Sweep `/service` (225) ☐
Service list rows → `ListItem`. Popular tiles keep custom layout, tokens only. This file has an uncommitted 1-line change in the working tree — look at `git diff` first; keep it if it's the version-label tweak, and fold it into your commit.

### T7 — Sweep `/activity`, `/activity/[id]`, `/activity/new` (170+177+303) ☐
`activity/new` form → `FormField`/`Button` (same treatment as T2, reuse its shared `inputStyle` normalization). Detail hero gradient legitimate. RSVP button → `Button size="lg" full` only if visual identical-or-better; otherwise token-normalize.

### T8 — Sweep `/lost-found`, `/lost-found/[id]`, `/lost-found/new` (131+164+270) ☐
Same recipe as T7. Claim button colored by `typeColor` — keep dynamic color, use `Button` only if it accepts style override cleanly (it spreads `style`, so it does).

### T9 — Sweep `/meals` (202), `/announcements` ×2 (116+127), `/class` (169), `/report/tickets` (122), `/notifications` (96) ☐
Lighter pass: fonts → scale, radii → canon, hand-rolled rows → `ListItem` where obvious. `/class` and `/todo` are reference-quality — minimal touch.

### T10 — Sweep home components ☐
`components/home/*` (my-day 198, hero-carousel 128, news-feed 96, quick-services 84, profile-banner 65). Fonts → scale (lots of 9/10px → caption 11). Carousel/banner gradients legitimate. Keep `#4cff91` online dot.

### T11 — Touch feedback + tap targets ☐
Global pass: every tappable gets `active:opacity-70` (or `active:scale-[0.98]` for cards/tiles — pick ONE per element type and use it everywhere: opacity for buttons/rows, scale for cards). Verify BottomNav items and list rows ≥44px tall. Submit buttons: `disabled` during in-flight state (report, activity/new, lost-found/new, todo sheet — the state flags already exist).

### T12 — Loading/empty/error consistency ☐
Every client page that fetches must render, from `ui/states.tsx`: skeleton/spinner while `data === null`, empty state for `[]`, error state with retry on catch. Audit found fetch pages: activity ×3, calendar, lost-found ×3, meals, home, profile, report ×2, todo. Add missing states using the existing components — extend `states.tsx` only if a needed variant is missing.

### T13 — Dead code cleanup ☐
Delete `src/lib/data/activity.ts` (orphaned, zero imports — verify with grep first). Add `/announcements` to the active-routes list in `CRMA Smart Academy Line LIFF/CLAUDE.md`. Do NOT touch `mock-data.ts`.

### T14 — Upload endpoint auth (security, audit C2) ☐
`src/app/api/upload/route.ts` — the TODO at line ~36. Before issuing the Blob client token: resolve the current user the same way other API routes do (see `src/lib/rbac.ts` / how `/api/me` resolves identity), reject 401 when absent; restrict `allowedContentTypes` to `image/jpeg`, `image/png`, `image/webp`; set `maximumSizeInBytes` to 5MB. Follow `@vercel/blob` `handleUpload` docs. This is the only task allowed to touch `src/app/api/`. Test: photo upload still works from `/report` and `/activity/new` in dev.

---

## 4. Definition of done (whole playbook)

- All boxes checked, lint + tsc + build green, dev-server tap-through of all 16 routes shows one coherent visual language (four font sizes, two radii + pills, token colors everywhere).
- `grep -rnE 'font: "[0-9]+ (9|10|12|14|16|17|18)px' src --include='*.tsx'` → no matches (off-scale sizes gone).
- No new hexes (grep in §2 Guardrails).
- Each task = one commit.

## Notes (Sonnet sessions write below this line)

- (empty)
