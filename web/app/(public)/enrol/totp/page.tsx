import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { EnrolTotpForm } from '@/components/auth/EnrolTotpForm'
import { ENROL_COOKIE, verifyEnrolToken } from '@/lib/session'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pair your authenticator · CRMA Smart Academy',
  description: 'Scan the QR with Google Authenticator / Authy and enter the 6-digit code.',
}

export default async function EnrolTotpPage() {
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
        aria-labelledby="enrol-totp-heading"
        className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <header className="space-y-2">
          <h1 id="enrol-totp-heading" className="text-2xl font-semibold">
            Pair your authenticator
          </h1>
          <p className="text-sm text-slate-600">
            Scan the QR with Google Authenticator, Authy, 1Password, or Microsoft Authenticator,
            then enter the 6-digit code it shows.
          </p>
        </header>

        <EnrolTotpForm />

        <p className="text-xs text-slate-500" data-testid="enrol-totp-phase-note">
          Device-fingerprint re-verify ships in Phase 2e.
        </p>
      </section>
    </main>
  )
}
