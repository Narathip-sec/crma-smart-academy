import { defaultMeExportHandler } from './handler'

import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  return defaultMeExportHandler(req)
}
