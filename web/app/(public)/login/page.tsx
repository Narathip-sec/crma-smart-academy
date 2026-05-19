import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in · CRMA Smart Academy',
  description: 'Sign in with your CRMA LINE account.',
}

type LoginPageProps = {
  searchParams: Promise<{ return?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { return: returnTo } = await searchParams
  const safeReturn = returnTo && returnTo.startsWith('/') ? returnTo : '/'

  return (
    <main className="grid min-h-dvh place-items-center bg-slate-50 px-6 text-slate-900">
      <section
        aria-labelledby="login-heading"
        className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <header className="space-y-2">
          <h1 id="login-heading" className="text-2xl font-semibold">
            Sign in to CRMA Smart Academy
          </h1>
          <p className="text-sm text-slate-600">
            CRMA cadets, instructors, and staff sign in with LINE, then verify a
            <code className="mx-1 rounded bg-slate-100 px-1 py-0.5 text-xs">@crma.ac.th</code>
            email and TOTP.
          </p>
        </header>

        <button
          type="button"
          disabled
          aria-disabled="true"
          data-testid="login-line-button"
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-base font-semibold text-white opacity-60"
        >
          Sign in with LINE
        </button>

        <p className="text-xs text-slate-500" data-testid="login-phase-note">
          The LINE sign-in flow lands in Phase 2b. This page is the Phase 2a chassis: it documents
          the contract and the middleware redirect target.
        </p>

        <input type="hidden" name="return" value={safeReturn} />
      </section>
    </main>
  )
}
