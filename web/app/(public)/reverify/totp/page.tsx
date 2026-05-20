import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { ReverifyTotpForm } from '@/components/auth/ReverifyTotpForm'
import { ENROL_COOKIE, verifyEnrolToken } from '@/lib/session'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify this device · CRMA Smart Academy',
  description: 'Enter the 6-digit code from your authenticator to trust this device.',
}

export default async function ReverifyTotpPage() {
  const jar = await cookies()
  const token = jar.get(ENROL_COOKIE)?.value
  if (!token) redirect('/login')
  try {
    await verifyEnrolToken(token)
  } catch {
    redirect('/login')
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-slate-50 px-6 text-slate-900">
      <section
        aria-labelledby="reverify-totp-heading"
        className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <header className="space-y-2">
          <h1 id="reverify-totp-heading" className="text-2xl font-semibold">
            Verify this device
          </h1>
          <p className="text-sm text-slate-600">
            This looks like a new device. Open your authenticator app and enter the 6-digit code to
            continue.
          </p>
        </header>

        <ReverifyTotpForm />

        <p className="text-xs text-slate-500" data-testid="reverify-totp-phase-note">
          Lost device? Phase 10 admin reset.
        </p>
      </section>
    </main>
  )
}
