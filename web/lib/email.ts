// Transactional email via Brevo HTTP API. Phase 2c sends OTP codes as
// plain text; HTML template + Thai copy land in Phase 10 hardening.
// Without BREVO_API_KEY (dev / CI), the OTP is logged to the console
// and the route still resolves successfully so test flows complete
// without external creds. Production deploys MUST set the env var.

export type SendResult = { ok: true; reason?: string } | { ok: false; reason: string }

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email'
const SENDER_NAME = 'CRMA Smart Academy'
const SENDER_EMAIL = 'no-reply@crma.ac.th'
const SUBJECT = 'Your CRMA verification code'

function plainBody(code: string): string {
  return [
    `Your CRMA Smart Academy verification code is: ${code}`,
    '',
    'This code expires in 10 minutes. If you did not request it, ignore this email.',
  ].join('\n')
}

export async function sendOtpEmail(opts: { to: string; code: string }): Promise<SendResult> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.log(`[email] OTP ${opts.code} to ${opts.to} (BREVO_API_KEY unset; dev fallback)`)
    return { ok: true, reason: 'noop:dev_fallback' }
  }

  try {
    const res = await fetch(BREVO_URL, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: opts.to }],
        subject: SUBJECT,
        textContent: plainBody(opts.code),
      }),
    })
    if (!res.ok) {
      return { ok: false, reason: `brevo:${res.status}` }
    }
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, reason: `brevo:fetch:${message}` }
  }
}
