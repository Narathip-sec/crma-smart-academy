// AppShell — persistent layout around the (app) route group.
// Header fixed at top (h-14). Content area takes remaining height.
// On phone: BottomNav is pinned via position:fixed so we add pb-14
// to content to prevent overlap. On md+: NavRail sits in a flex row.

import { AppHeader } from './AppHeader'
import { BottomNav } from './BottomNav'
import { NavRail } from './NavRail'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-dvh">
      <AppHeader />

      {/* Below header: rail (md+) + content side by side */}
      <div className="flex flex-1 min-h-0 pt-14">
        <NavRail />

        <main
          id="main-content"
          data-testid="main-content"
          // Extra bottom padding on phone to clear the fixed BottomNav.
          // On md+ BottomNav is hidden so no padding needed.
          className="flex-1 overflow-y-auto pb-14 md:pb-0"
        >
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
