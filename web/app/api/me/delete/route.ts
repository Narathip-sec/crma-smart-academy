import { defaultMeDeleteHandler } from './handler'

import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  return defaultMeDeleteHandler(req)
}
