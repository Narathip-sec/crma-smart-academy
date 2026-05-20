'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

type CallbackResponse =
  | { status: 'needs_email' }
  | { status: 'needs_totp' }
  | { status: 'needs_reverify' }
  | { status: 'ok' }

type LiffSignInButtonProps = {
  returnTo: string
}

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID ?? ''

async function deriveDeviceFp(): Promise<string> {
  const parts = [
    navigator.userAgent,
    `${window.screen.width}x${window.screen.height}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join('|')
  const data = new TextEncoder().encode(parts)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function signInViaLiff(returnTo: string): Promise<void> {
  if (!LIFF_ID) throw new Error('LIFF_ID missing')

  // Dynamic import keeps the SDK out of SSR bundles.
  const liff = (await import('@line/liff')).default
  await liff.init({ liffId: LIFF_ID })
  if (!liff.isLoggedIn()) {
    const here = new URL(window.location.href)
    here.searchParams.set('return', returnTo)
    liff.login({ redirectUri: here.toString() })
    return
  }
  const idToken = liff.getIDToken()
  if (!idToken) throw new Error('LIFF returned empty id token')

  const deviceFp = await deriveDeviceFp()
  const res = await fetch('/api/auth/line/callback', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ idToken, deviceFp }),
  })
  if (!res.ok) throw new Error(`callback failed (${res.status})`)
  const body = (await res.json()) as CallbackResponse
  return body ? handleBranch(body, returnTo) : undefined
}

function handleBranch(body: CallbackResponse, returnTo: string): void {
  if (body.status === 'ok') {
    window.location.assign(returnTo)
    return
  }
  if (body.status === 'needs_email') {
    window.location.assign('/enrol/email')
    return
  }
  if (body.status === 'needs_totp') {
    window.location.assign('/enrol/totp')
    return
  }
  if (body.status === 'needs_reverify') {
    window.location.assign('/reverify/totp')
    return
  }
}

export function LiffSignInButton({ returnTo }: LiffSignInButtonProps) {
  const _router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const configured = LIFF_ID.length > 0

  const onClick = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      await signInViaLiff(returnTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'sign-in failed')
      setBusy(false)
    }
  }, [returnTo])

  if (!configured) {
    return (
      <div
        data-testid="login-line-button"
        role="status"
        aria-live="polite"
        className="w-full rounded-xl bg-slate-100 px-4 py-3 text-center text-sm text-slate-600"
      >
        Sign in unavailable — LIFF not configured. Set <code>NEXT_PUBLIC_LIFF_ID</code> to enable.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        data-testid="login-line-button"
        className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-base font-semibold text-white transition disabled:opacity-60"
      >
        {busy ? 'Signing in…' : 'Sign in with LINE'}
      </button>
      {error ? (
        <p role="alert" className="text-xs text-rose-600" data-testid="login-error">
          {error}
        </p>
      ) : null}
    </div>
  )
}
