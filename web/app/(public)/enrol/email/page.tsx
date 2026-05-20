import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { EnrolEmailForm } from '@/components/auth/EnrolEmailForm'
import { ENROL_COOKIE, verifyEnrolToken } from '@/lib/session'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify your CRMA email · CRMA Smart Academy',
  description: 'Verify your @crma.ac.th email with a one-time code.',
}

export default async function EnrolEmailPage() {
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
        aria-labelledby="enrol-email-heading"
        className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <header className="space-y-2">
          <h1 id="enrol-email-heading" className="text-2xl font-semibold">
            Verify your CRMA email
          </h1>
          <p className="text-sm text-slate-600">
            Enter your{' '}
            <code className="mx-1 rounded bg-slate-100 px-1 py-0.5 text-xs">@crma.ac.th</code>{' '}
            address. We&apos;ll send a 6-digit code that expires in 10 minutes.
          </p>
        </header>

        <EnrolEmailForm />

        <p className="text-xs text-slate-500" data-testid="enrol-email-phase-note">
          TOTP enrolment ships in Phase 2d.
        </p>
      </section>
    </main>
  )
}
