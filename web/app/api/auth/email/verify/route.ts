import { defaultEmailVerifyHandler } from './handler'

import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  return defaultEmailVerifyHandler(req)
}
