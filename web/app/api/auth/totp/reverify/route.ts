import { defaultTotpReverifyHandler } from './handler'

import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  return defaultTotpReverifyHandler(req)
}
