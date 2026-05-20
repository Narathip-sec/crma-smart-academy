'use client'

import { useCallback, useState } from 'react'

type Stage = 'email' | 'code'

type StartResponse =
  | { ok: true; expiresAt: string }
  | {
      error:
        | 'enrol_required'
        | 'enrol_invalid'
        | 'bad_email'
        | 'email_in_use'
        | 'rate_limited'
        | 'send_failed'
      retryAt?: string
    }

type VerifyResponse =
  | { status: 'needs_totp' | 'ok' }
  | {
      error:
        | 'enrol_required'
        | 'enrol_invalid'
        | 'bad_code'
        | 'not_found'
        | 'expired'
        | 'mismatch'
        | 'attempts_exceeded'
    }

function errorCopy(code: string): string {
  switch (code) {
    case 'bad_email':
      return 'Use a @crma.ac.th address.'
    case 'email_in_use':
      return 'That email already belongs to another cadet.'
    case 'rate_limited':
      return 'Hold on — codes can only be sent once per minute.'
    case 'send_failed':
      return 'Could not send the code. Try again shortly.'
    case 'bad_code':
      return 'Enter the 6-digit code.'
    case 'not_found':
      return 'No active code — request a new one.'
    case 'expired':
      return 'Code expired. Request a new one.'
    case 'mismatch':
      return 'Wrong code.'
    case 'attempts_exceeded':
      return 'Too many attempts. Request a new code.'
    case 'enrol_required':
    case 'enrol_invalid':
      return 'Sign in with LINE again to continue.'
    default:
      return 'Something went wrong. Try again.'
  }
}

export function EnrolEmailForm() {
  const [stage, setStage] = useState<Stage>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitEmail = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setBusy(true)
      setError(null)
      try {
        const res = await fetch('/api/auth/email/start', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        const body = (await res.json()) as StartResponse
        if (!res.ok || !('ok' in body)) {
          setError(errorCopy('error' in body ? body.error : 'unknown'))
          return
        }
        setStage('code')
      } catch {
        setError(errorCopy('unknown'))
      } finally {
        setBusy(false)
      }
    },
    [email],
  )

  const submitCode = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setBusy(true)
      setError(null)
      try {
        const res = await fetch('/api/auth/email/verify', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ code }),
        })
        const body = (await res.json()) as VerifyResponse
        if (!res.ok || !('status' in body)) {
          setError(errorCopy('error' in body ? body.error : 'unknown'))
          return
        }
        window.location.assign(body.status === 'ok' ? '/' : '/enrol/totp')
      } catch {
        setError(errorCopy('unknown'))
      } finally {
        setBusy(false)
      }
    },
    [code],
  )

  if (stage === 'email') {
    return (
      <form className="space-y-3" onSubmit={submitEmail} data-testid="enrol-email-form">
        <label className="block text-sm font-medium text-slate-700" htmlFor="enrol-email-input">
          CRMA email
        </label>
        <input
          id="enrol-email-input"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="cadet@crma.ac.th"
          data-testid="enrol-email-input"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={busy || email.length === 0}
          data-testid="enrol-email-submit"
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-base font-semibold text-white transition disabled:opacity-60"
        >
          {busy ? 'Sending…' : 'Send code'}
        </button>
        {error ? (
          <p role="alert" className="text-xs text-rose-600" data-testid="enrol-email-error">
            {error}
          </p>
        ) : null}
      </form>
    )
  }

  return (
    <form className="space-y-3" onSubmit={submitCode} data-testid="enrol-otp-form">
      <label className="block text-sm font-medium text-slate-700" htmlFor="enrol-otp-input">
        6-digit code
      </label>
      <input
        id="enrol-otp-input"
        type="text"
        required
        inputMode="numeric"
        pattern="\d{6}"
        maxLength={6}
        autoComplete="one-time-code"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        placeholder="123456"
        data-testid="enrol-otp-input"
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl tracking-widest outline-none focus:border-emerald-500"
      />
      <button
        type="submit"
        disabled={busy || code.length !== 6}
        data-testid="enrol-otp-submit"
        className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-base font-semibold text-white transition disabled:opacity-60"
      >
        {busy ? 'Verifying…' : 'Verify code'}
      </button>
      <button
        type="button"
        onClick={() => {
          setStage('email')
          setCode('')
          setError(null)
        }}
        data-testid="enrol-otp-back"
        className="w-full rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-700"
      >
        Use a different email
      </button>
      {error ? (
        <p role="alert" className="text-xs text-rose-600" data-testid="enrol-otp-error">
          {error}
        </p>
      ) : null}
    </form>
  )
}
