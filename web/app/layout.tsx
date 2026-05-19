import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CRMA Smart Academy',
  description: 'Digital platform for CRMA cadets (LIFF).',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-dvh">{children}</body>
    </html>
  )
}
