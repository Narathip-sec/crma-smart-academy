import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { AppShell } from '@/components/ui/AppShell'

// Auth guard: middleware sets x-user-id on all protected paths.
// If the header is absent (should not happen in production, but
// possible during cold-start edge cases), bounce to /login.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers()
  const userId = hdrs.get('x-user-id')
  if (!userId) redirect('/login')

  return <AppShell>{children}</AppShell>
}
