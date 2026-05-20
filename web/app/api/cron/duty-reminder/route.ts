import { defaultDutyReminderHandler } from './handler'

import type { NextRequest } from 'next/server'

// Vercel Cron sends GET requests by default. Accept both GET and POST
// so manual invocation (e.g. curl with --header "Authorization:") and
// automated cron triggers both work.
export async function GET(req: NextRequest) {
  return defaultDutyReminderHandler(req)
}

export async function POST(req: NextRequest) {
  return defaultDutyReminderHandler(req)
}
