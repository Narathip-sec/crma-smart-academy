'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type StartResponse =
  | { ok: true; otpAuthUri: string; qrDataUrl: string }
  | {
      error: 'enrol_required' | 'enrol_invalid' | 'user_missing' | 'already_enrolled'
    }

type VerifyResponse =
  | { status: 'ok' }
  | {
      error:
        | 'enrol_required'
        | 'enrol_invalid'
        | 'bad_code'
        | 'enrol_not_started'
        | 'invalid_code'
        | 'decrypt_failed'
    }

function errorCopy(code: string): string {
  switch (code) {
    case 'already_enrolled':
      return 'TOTP is already paired for this account.'
    case 'user_missing':
      return 'Account not found. Sign in with LINE again.'
    case 'bad_code':
      return 'Enter the 6-digit code from your authenticator.'
    case 'enrol_not_started':
      return 'Enrolment session expired. Refresh the page.'
    case 'invalid_code':
      return 'Wrong code. Wait for the next 30-second window and try again.'
    case 'decrypt_failed':
      return 'Server error while reading your secret. Contact support.'
    case 'enrol_required':
    case 'enrol_invalid':
      return 'Sign in with LINE again to continue.'
    default:
      return 'Something went wrong. Try again.'
  }
}

function secretFromUri(uri: string): string {
  try {
    const url = new URL(uri.replace('otpauth://', 'https://otpauth.invalid/'))
    return url.searchParams.get('secret') ?? ''
  } catch {
    return ''
  }
}

export function EnrolTotpForm() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [secret, setSecret] = useState<string>('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    void (async () => {
      try {
        const res = await fetch('/api/auth/totp/enrol/start', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: '{}',
        })
        const body = (await res.json()) as StartResponse
        if (!res.ok || !('ok' in body)) {
          setStartError(errorCopy('error' in body ? body.error : 'unknown'))
          return
        }
        setQrDataUrl(body.qrDataUrl)
        setSecret(secretFromUri(body.otpAuthUri))
      } catch {
        setStartError(errorCopy('unknown'))
      }
    })()
  }, [])

  const submitCode = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setBusy(true)
      setError(null)
      try {
        const res = await fetch('/api/auth/totp/enrol/verify', {
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

  if (startError) {
    return (
      <p role="alert" className="text-sm text-rose-600" data-testid="enrol-totp-start-error">
        {startError}
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid place-items-center rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="TOTP QR code"
            width={192}
            height={192}
            data-testid="enrol-totp-qr"
          />
        ) : (
          <p className="text-sm text-slate-500" data-testid="enrol-totp-qr-loading">
            Generating QR…
          </p>
        )}
      </div>

      {secret ? (
        <p className="break-all text-center text-xs text-slate-500">
          Manual entry: <code data-testid="enrol-totp-secret">{secret}</code>
        </p>
      ) : null}

      <form className="space-y-3" onSubmit={submitCode} data-testid="enrol-totp-form">
        <label className="block text-sm font-medium text-slate-700" htmlFor="enrol-totp-input">
          6-digit code
        </label>
        <input
          id="enrol-totp-input"
          type="text"
          required
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="123456"
          data-testid="enrol-totp-input"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl tracking-widest outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={busy || code.length !== 6 || !qrDataUrl}
          data-testid="enrol-totp-submit"
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-base font-semibold text-white transition disabled:opacity-60"
        >
          {busy ? 'Verifying…' : 'Verify and finish'}
        </button>
        {error ? (
          <p role="alert" className="text-xs text-rose-600" data-testid="enrol-totp-error">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  )
}
