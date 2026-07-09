# CRMA Smart Academy — UI/UX Audit, Health Check & Presentation Timeline

**Date:** 2026-07-09 · **Deadline:** 2026-08-10 (professor presentation)
**Scope scanned:** `web/` — 80 source files, ~7,460 lines. Next.js 16 App Router, React 19, Tailwind CSS v4 (CSS-first, no `tailwind.config`), Prisma 6 + Postgres, `@line/liff` 2.29, Vercel Blob, Leaflet. Deployed: `crma-smart-academy.vercel.app`.

---

## Task 1 — UI/UX & Consistency Audit

### Verdict

The design *foundation* is good: a real token system exists (`globals.css` CSS vars + Tailwind v4 `@theme inline`, `src/lib/tokens.ts`), there is a UI kit (`src/components/ui/` — Button, Card, Chip, Badge, Seg, Sheet, Toast, states…), and a consistent shell (TopBar/AppBar/BottomNav, 420px capped width). The "weird, disjointed" feeling comes from **how inconsistently the pages consume that foundation**, not from a missing one.

### Root causes of the inconsistency (ranked by impact)

1. **Two competing styling systems on every page — Tailwind classes AND large inline `style={{}}` objects.**
   Every page mixes both, heavily: `report/page.tsx` has 32 inline style objects, `todo` 31, `profile` 30, `calendar` 27, `service` 26… (~500 inline style blocks across the app). Inline styles encode ad-hoc values (font shorthands like `font: "600 13px var(--font-sans)"`, one-off paddings, shadows) that drift page by page. This is the #1 source of visual drift: two pages that "should" look the same were hand-tuned separately.

2. **Legacy design vocabulary still alive via alias variables.**
   `globals.css` maps old-theme names to the new Academy Teal palette: `--crimson → var(--brand)`, `--gold → var(--warning)`, `--bone`, `--bone2`, `--paper`, `--ink2`, `--shade`, `--rule`, `--gray`… Pages written at different times use different names for the same color (or subtly *different* colors: `--bone2: #cfe9e6` is not any token). Two vocabularies = two eras of pages that don't feel related.

3. **53 unique hardcoded hex colors across `src/`.**
   Beyond `globals.css` (which legitimately defines tokens), hex values leak into pages and data files: `todo/page.tsx` (`#fdeaec`), `profile/page.tsx` (`#fbf1dc`, `#f0d080`), `states.tsx`, `chip.tsx`, `toast.tsx` (`#fff`)… Worst offender: **category colors in data files** — `announcements.ts` and `class.ts` hardcode a Material-Design-era palette (`#c62828`, `#1565c0`, `#2e7d32`, `#6a1a9a`, `#37474f`). These reds/blues/purples belong to a different color family than Academy Teal and are a big reason screens feel like they come from different apps. They also **break the dark theme** (`[data-theme="dark"]` exists, but hardcoded hex never flips).

4. **No unified geometry/typography scale.**
   Radius: `rounded-2xl` (16px, 43×) vs `rounded-xl` (12px, 16×) vs Button's inline `borderRadius: 12` vs `CARD_RADIUS = 20` in tokens.ts — four values for "card roundness". Padding: 29 distinct p/px/py values in use. Type sizes are set via inline `font:` shorthand in dozens of places instead of a fixed scale, so label/body/heading sizes wobble between screens.

5. **The UI kit itself is inline-style-based and under-specified.**
   `Button` has variants but a hardcoded 13px font, radius 12, single size; `Card` similar. Because the kit is rigid, page authors bypass it and hand-roll divs — which is exactly how the drift happened. The kit exists but doesn't *win* over hand-rolling.

### Recommendations — unify for a native LIFF feel

Do these in order; 1–3 are the 80/20.

1. **Kill the legacy aliases.** Grep-replace `--crimson|--gold|--bone2?|--paper|--ink2|--shade2?|--rule|--gray2?|--good` with the real tokens, then delete the alias block from `globals.css`. One vocabulary. (~1 day, mechanical.)
2. **Move category colors into tokens.** Add `--cat-urgent`, `--cat-academic`, `--cat-sport`, etc. to `globals.css` (teal-harmonized: pick hues at similar saturation/lightness to `#0BA8A0`), reference by token name from `announcements.ts` / `class.ts`. This single change removes most of the "different app per screen" feeling. (~half day.)
3. **Define one geometry + type scale and enforce it.**
   - Radius: cards `rounded-2xl` (16px), buttons/inputs `rounded-xl` (12px), chips `rounded-full`. Fix `CARD_RADIUS`/Button to match. Nothing else.
   - Type: 4 sizes only — 11px caption, 13px body, 15px title, 20px page heading. Put them in `@theme` as `--text-caption/body/title/heading` utilities.
   - Spacing: page gutter `px-4`, card padding `p-4`, stack gap `gap-3`. Delete the rest opportunistically.
4. **Strengthen the kit, then migrate pages to it.** Give Button `size` prop + token-based radius/type; add `ListItem`, `FormField` (label + input + error), `PageHeader` — the three patterns every page hand-rolls today. Then sweep pages worst-first (report, todo, profile, calendar, service) replacing inline-style blocks with kit components + Tailwind tokens. Don't aim for zero inline styles — aim for zero *ad-hoc values* in them (CSS vars only).
5. **LIFF-native touches** (cheap, high perceived quality): active-state feedback on every tappable (`active:scale-[0.98]` or opacity), `overscroll-behavior-y: none` on body, 44px minimum touch targets in BottomNav/list rows, skeletons from `states.tsx` on every fetch (already exists — use consistently), disable buttons during submit.

### Tablet/desktop breakpoints — needed?

**No. Mobile-only is correct — keep it.** LIFF opens inside LINE's in-app webview, which is phone-sized in practice; your `MAX_W = 420` capped, centered layout already handles the "opened in desktop browser" case gracefully (phone-like column on a stage background). For a one-stop cadet service app there is no tablet use case worth the time before Aug 10. The only additions worth making:

- Polish the desktop-preview stage (subtle `--stage` background + soft shadow on the 420px column) so the professor demoing on a projector/laptop sees something deliberate, not accidental.
- Verify `viewport-fit=cover` + `safe-area-inset-bottom` (BottomNav already does this — good) on a real device.

---

## Task 2 — Codebase Health Check

**Overall: healthy for its size.** TypeScript compiles clean (`tsc --noEmit` passes), ESLint is nearly clean, structure is idiomatic App Router, API routes are thin and consistent, RBAC/audit scaffolding exists. Main risks below.

### Critical (fix before presentation)

| # | Issue | Where | Why it matters |
|---|-------|-------|----------------|
| C1 | **No real LIFF → user identity.** `liff.ts` is a stub when `NEXT_PUBLIC_LIFF_ID` unset; API routes resolve user via `DEV_USER_EMAIL` env. `LineAccount` model exists but no login flow ties a LINE userId to a `User`. | `src/lib/liff.ts`, `src/lib/rbac.ts`, `/api/me` | The demo is "app running in LINE". Without this, the core pitch doesn't work end-to-end. Biggest single work item left. |
| C2 | **Upload endpoint issues Blob tokens with no auth** — flagged by its own TODO. | `src/app/api/upload/route.ts:36` | Anyone can upload to your Blob store on the public Vercel URL. Add identity + RBAC check, restrict content types/size. |
| C3 | **ESLint error: `setState` synchronously in effect** causes cascading renders. | `src/app/meals/page.tsx:57` | Blocks a clean `lint`; move the `setMeals(null)` reset into the fetch flow (or key the component on `from/to`). |
| C4 | **No `error.tsx` / `loading.tsx` / `not-found.tsx` anywhere.** | `src/app/**` | One thrown error during the live demo = unstyled crash screen. Add a root error boundary + not-found at minimum. |

### High (production hygiene)

- **Mock data remnants:** `profile/page.tsx`, `home/my-day.tsx`, `home/profile-banner.tsx` still import `mock-data.ts` while sibling pages are DB-backed. Profile screen will show fake data next to real data — visibly fake in a demo.
- **Zero tests.** Accept for the deadline, but add a smoke script (hit every route + every GET API, expect 200) so regressions surface before demo day, not during it.
- **Everything is `"use client"`** (45 of 47 components, including all pages). Works, but home/announcements/meals could be server components fetching directly — faster first paint inside LINE's webview. Only do this if time remains in Week 4; not a correctness issue.
- **Doc drift:** `/announcements` route exists but is missing from the active-routes list in `CLAUDE.md`; uncommitted `service/page.tsx` change (1 line) sitting in the working tree — commit or drop it.

### Not problems (verified)

No `alert()`/`confirm()` usage, no stray `console.log` in pages, only 4 Tailwind arbitrary values, env var surface is small and sane (`DATABASE_URL`, `NEXT_PUBLIC_LIFF_ID`, `DEV_USER_EMAIL`, `NEXT_PUBLIC_DEV_TOOLBAR`), Prisma schema is comprehensive (40+ models) and ahead of the UI — schema work is *done*.

---

## Task 3 — Timeline & Checklist (July 9 → August 10)

Ground rules:
- **Definition of "presentation-ready":** app opens from a LINE rich menu on a real phone, logged-in cadet sees their own data, every active route works with real (seeded) DB data, zero crash screens, one coherent visual language.
- **Feature freeze after Week 2.** Weeks 3–4 are stabilization only. New ideas go to a `POST-DEMO.md` list.
- Every day ends with: `npm run lint && npx tsc --noEmit`, deploy to Vercel, 2-minute tap-through on your phone.

### Week 1 (Jul 9–15): UI/UX overhaul + critical bug fixes

- [ ] **Day 1 (Jul 9):** Commit/drop the pending `service/page.tsx` change. Fix C3 (meals lint error) + unused-var warning → `lint` green. Add root `error.tsx`, `not-found.tsx`, per-route `loading.tsx` for the 5 data-heavy routes (C4).
- [ ] **Day 1–2:** Token consolidation — remove legacy alias vars from `globals.css` + all usages; move category colors from `announcements.ts`/`class.ts` into teal-harmonized `--cat-*` tokens.
- [ ] **Day 2:** Lock the scales: 2 radii + 4 text sizes + 3 spacing rules into `@theme`. Fix Button/Card/`CARD_RADIUS` to match. Add `ListItem`, `FormField`, `PageHeader` to the kit.
- [ ] **Day 3–5:** Page-by-page consistency sweep, worst-first: `report` → `todo` → `profile` → `calendar` → `service` → `activity/*` → `lost-found/*` → `meals` → `announcements` → `class` → `settings`/`notifications`. Replace ad-hoc inline styles with kit + tokens. Screenshot each page before/after (side-by-side is also great thesis material).
- [ ] **Day 5–6:** Touch feedback pass (active states, 44px targets, disabled-while-submitting), consistent skeleton/empty/error states via `states.tsx` on every fetching page.
- [ ] **Day 7:** Fix C2 — auth + validation on `/api/upload`. Buffer.
- **Exit criteria:** lint+tsc green · one color vocabulary · all pages visually coherent · no crash screens possible.

### Week 2 (Jul 16–22): Feature completion — LINE integration is the week

- [ ] **Day 1–3 (biggest item, C1):** Real LIFF login flow — register LIFF app, set `NEXT_PUBLIC_LIFF_ID` on Vercel, `liff.init` → `getProfile()` → `/api/auth/line` endpoint that finds-or-creates `User` via `LineAccount`, session (signed cookie is enough), API routes resolve identity from session instead of `DEV_USER_EMAIL` (keep the env fallback for local dev).
- [ ] **Day 3–4:** Kill mock data — wire `profile`, `my-day`, `profile-banner` to `/api/me`/`/api/home`. Delete `mock-data.ts` when nothing imports it.
- [ ] **Day 4–5:** Seed production DB with realistic, presentation-quality Thai data (`db:seed` + `import:all` scripts already exist — run them against prod; real class schedule, real calendar, plausible meals/announcements). A demo is only as convincing as its data.
- [ ] **Day 6:** LINE surface polish: rich menu image linking to the LIFF URL, app icon/OG metadata, verify share/deep-link into `activity/[id]`.
- [ ] **Day 7:** Buffer (LIFF review/config always eats a day).
- **Exit criteria:** open app from LINE on your phone → see *your* name from LINE profile → every route shows real DB data.

### Week 3 (Jul 23–29): Testing, refinement, LIFF edge cases

- [ ] **Day 1–2:** Device matrix: iOS LINE + Android LINE + external browser. Check: safe areas/notch, keyboard covering form inputs (report/lost-found/activity forms), photo upload from LINE camera roll, back behavior, slow-3G loading states.
- [ ] **Day 2–3:** Edge cases: LIFF token expiry / re-login mid-session, user with no `CadetProfile`, empty DB states for every list, double-tap submit, offline/failed fetch (every page shows retry, not blank).
- [ ] **Day 3–4:** Write the smoke script (hit all routes + GET APIs, assert 200/no-error) and run it in CI or pre-deploy.
- [ ] **Day 5–6:** Fix everything found. Re-test on both phones.
- [ ] **Day 7:** Performance pass in LINE webview: bundle check (Leaflet is heavy — confirm `CampusPinMap` is dynamically imported, load only on lost-found pages), image sizes, Lighthouse mobile.
- **Exit criteria:** full user journey completes on both OSes with zero dead ends.

### Week 4 (Jul 30–Aug 5): Final polish + presentation prep

- [ ] **Day 1–2:** Visual last-mile: dark theme either works everywhere or **remove the toggle** (a broken toggle is worse than none); Thai/English switch verified on every screen; transitions/scroll behavior.
- [ ] **Day 2–3:** Demo script: the 5-minute golden path (open from LINE → home → check today's class → submit a report with photo → RSVP an activity → lost & found). Rehearse it 3×. Prepare seeded data that makes each step look meaningful.
- [ ] **Day 3–4:** Presentation materials: architecture slide (LIFF → Next.js → Prisma/Postgres → Vercel), before/after UI screenshots from Week 1, thesis-objective mapping (you have `RESEARCH-OBJECTIVE-ALIGNMENT` docs — connect features to research objectives explicitly).
- [ ] **Day 5–6:** Full dress rehearsal on the actual demo device + projector/screen-share setup. Fix only what the rehearsal exposes.
- [ ] **Day 7:** Buffer.
- **Exit criteria:** you can run the demo start-to-finish without touching a keyboard.

### Final stretch (Aug 6–9): Freeze

- [ ] **Aug 6:** **Code freeze.** Tag the release (`git tag v1.0-presentation`). Only fixes for demo-blocking bugs, each verified on device before merge.
- [ ] **Aug 7:** Fallback plan: record a screen-capture video of the golden path on the phone (venue Wi-Fi/LINE outage insurance); export key screens as images.
- [ ] **Aug 8:** Verify Vercel prod is healthy, DB seeded, envs set; second rehearsal.
- [ ] **Aug 9:** Rest. Charge the phone. Do not deploy anything.
- [ ] **Aug 10:** 🎓 Present.

### Cut-list (if behind schedule, drop in this order)

1. Dark theme (remove toggle, ship light-only)
2. Server-component refactor
3. Smoke-test automation (test manually instead)
4. `/settings` + `/notifications` depth (keep as simple functional screens)
5. Never cut: LIFF login (C1), upload auth (C2), the Week 1 visual sweep — these three *are* the presentation.
