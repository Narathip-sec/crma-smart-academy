// TEMPORARY Phase 10b debug endpoint. Reports presence/absence of each
// expected env var without leaking values. To be removed once Vercel env
// propagation is confirmed working — see commit removing this route.

const KEYS = [
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
  'HMAC_KEY',
  'CRON_SECRET',
  'LINE_JWKS_URL',
  'LINE_CHANNEL_ID',
  'LINE_CHANNEL_SECRET',
  'NEXT_PUBLIC_LIFF_ID',
  'LINE_CHANNEL_ACCESS_TOKEN',
  'BREVO_API_KEY',
] as const

export async function GET() {
  const state: Record<string, { present: boolean; length: number }> = {}
  for (const k of KEYS) {
    const v = process.env[k]
    state[k] = { present: typeof v === 'string' && v.length > 0, length: v?.length ?? 0 }
  }
  return new Response(
    JSON.stringify(
      {
        runtime: process.env.NEXT_RUNTIME ?? 'nodejs',
        vercelEnv: process.env.VERCEL_ENV ?? null,
        vercelRegion: process.env.VERCEL_REGION ?? null,
        deploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? null,
        gitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
        nodeEnv: process.env.NODE_ENV ?? null,
        keys: state,
      },
      null,
      2,
    ),
    { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } },
  )
}
