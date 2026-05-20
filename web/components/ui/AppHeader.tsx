'use client'

// Phase 3: stub header. Phase 4 replaces with real cadet avatar + SWR
// notification poll.

export function AppHeader() {
  return (
    <header
      data-testid="app-header"
      className="fixed top-0 inset-x-0 z-30 flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200"
    >
      <span className="text-base font-semibold text-slate-800 tracking-tight">
        CRMA Smart Academy
      </span>

      {/* Avatar stub — Phase 4 wires real cadet data */}
      <div
        aria-label="โปรไฟล์"
        data-testid="app-header-avatar"
        className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold"
      >
        —
      </div>
    </header>
  )
}
