'use client'

import { useCallback, useState } from 'react'

type VerifyResponse =
  | { status: 'ok' }
  | {
      error:
        | 'enrol_required'
        | 'enrol_invalid'
        | 'bad_code'
        | 'not_enrolled'
        | 'invalid_code'
        | 'replay'
        | 'decrypt_failed'
    }

function errorCopy(code: string): string {
  switch (code) {
    case 'bad_code':
      return 'Enter the 6-digit code from your authenticator.'
    case 'not_enrolled':
      return 'TOTP is not paired for this account. Pair it first via /enrol/totp.'
    case 'invalid_code':
      return 'Wrong code. Wait for the next 30-second window and try again.'
    case 'replay':
      return 'That code was already used. Wait for the next 30-second window.'
    case 'decrypt_failed':
      return 'Server error while reading your secret. Contact support.'
    case 'enrol_required':
    case 'enrol_invalid':
      return 'Sign in with LINE again to continue.'
    default:
      return 'Something went wrong. Try again.'
  }
}

export function ReverifyTotpForm() {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setBusy(true)
      setError(null)
      try {
        const res = await fetch('/api/auth/totp/reverify', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ code }),
        })
        const body = (await res.json()) as VerifyResponse
        if (!res.ok || !('status' in body)) {
          setError(errorCopy('error' in body ? body.error : 'unknown'))
          return
        }
        window.location.assign('/')
      } catch {
        setError(errorCopy('unknown'))
      } finally {
        setBusy(false)
      }
    },
    [code],
  )

  return (
    <form className="space-y-3" onSubmit={submit} data-testid="reverify-totp-form">
      <label className="block text-sm font-medium text-slate-700" htmlFor="reverify-totp-input">
        6-digit code
      </label>
      <input
        id="reverify-totp-input"
        type="text"
        required
        inputMode="numeric"
        pattern="\d{6}"
        maxLength={6}
        autoComplete="one-time-code"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        placeholder="123456"
        data-testid="reverify-totp-input"
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl tracking-widest outline-none focus:border-emerald-500"
      />
      <button
        type="submit"
        disabled={busy || code.length !== 6}
        data-testid="reverify-totp-submit"
        className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-base font-semibold text-white transition disabled:opacity-60"
      >
        {busy ? 'Verifying…' : 'Trust this device'}
      </button>
      {error ? (
        <p role="alert" className="text-xs text-rose-600" data-testid="reverify-totp-error">
          {error}
        </p>
      ) : null}
    </form>
  )
}
