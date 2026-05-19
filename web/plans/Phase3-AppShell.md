# Phase 3 - Responsive App Shell

> **Status:** DRAFT - supersedes older iPhone-only shell wording.
> **Date:** 2026-05-19
> **Inputs:** `README.md` progress tracker, `MIGRATION_LIFF.md` routing contract, predecessor mobile visual reference.
> **DoD:** phone, tablet, and desktop layouts pass Playwright snapshots; `activeTab <-> ?tab=` stays stable; no production UI is locked inside a fixed iPhone frame.

---

## 0. Goal

Build one responsive app shell for every device class:

- Phone: LIFF-first layout with safe-area aware bottom navigation.
- Tablet: wider content, optional navigation rail, no artificial phone frame.
- Desktop: full browser workspace with left navigation or rail, readable max widths, and keyboard-friendly navigation.

The shell must preserve the mobile prototype interaction model: one `activeTab` string drives view selection, and the URL mirrors it through `?tab=`.

---

## 1. Decision Change

Old Phase 3 wording said:

```text
IphoneFrame + AppHeader + BottomNav + TabStore <-> URL sync
```

New Phase 3 wording is:

```text
AppShell + AppHeader + AdaptiveNav + TabStore <-> URL sync across phone, tablet, and desktop
```

`IphoneFrame` is not a production shell component. If a device preview is useful later, it can live in a demo or test-only preview, not around the real app.

---

## 2. Target Components

```text
web/
  app/
    (app)/
      layout.tsx
      page.tsx
      views/
        HomeView.tsx
        ClassScheduleView.tsx
        HealthView.tsx
        ActivityView.tsx
        ServiceView.tsx
        GradesView.tsx
        MeView.tsx
  components/
    ui/
      AppShell.tsx
      AppHeader.tsx
      AdaptiveNav.tsx
      BottomNav.tsx
      NavRail.tsx
  store/
    useTabStore.ts
```

---

## 3. Responsive Contract

| Viewport         | Shell behavior                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------- |
| `< 768px`        | Full-width LIFF phone layout, `100dvh`, safe-area padding, bottom nav fixed to bottom.    |
| `768px - 1199px` | Tablet layout with content breathing room and nav rail or compact side nav.               |
| `>= 1200px`      | Desktop layout with left nav, sticky header, and content areas that avoid over-wide text. |

Rules:

- Never force a `390px` iPhone frame around production pages.
- Use `100dvh` and `env(safe-area-inset-*)` for mobile webviews.
- Keep `BottomNav` only where bottom navigation is ergonomic.
- Use one shared tab definition for `BottomNav`, `NavRail`, and future desktop nav.
- Preserve test IDs from the mobile prototype where practical.

---

## 4. Routing Contract

`app/(app)/page.tsx` still renders from a `VIEWS` map:

```ts
const VIEWS = {
  home: HomeView,
  class_schedule: ClassScheduleView,
  health: HealthView,
  activity: ActivityView,
  service: ServiceView,
  grades: GradesView,
  me: MeView,
} as const
```

`useTabStore` owns `activeTab`; URL sync owns `?tab=`.

No nested route layouts for each tab. Deep links use `?tab=health`, not `/health`.

---

## 5. Test Matrix

Playwright projects must cover:

- LINE iOS phone UA.
- LINE Android phone UA.
- Tablet viewport, at least `768x1024`.
- Desktop viewport, at least `1440x900`.

Assertions:

- Active tab from URL renders correct view.
- Changing nav updates store and URL.
- Mobile nav does not overlap content or safe area.
- Tablet/desktop layouts do not show fixed phone frame.
- Header and nav remain reachable at each viewport.

---

## 6. Out Of Scope

- Real Home/Class/Health/Activity content ports.
- Auth implementation details.
- Desktop-only feature redesign.
- Device preview frame for marketing/demo screenshots.

Phase 3 builds shell only. View content lands in Phases 4-8.
