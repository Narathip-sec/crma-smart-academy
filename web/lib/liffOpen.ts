declare global {
  interface Window {
    liff?: {
      isInClient: () => boolean
      openWindow: (opts: { url: string; external: boolean }) => void
    }
  }
}

export function liffOpen(url: string): void {
  if (typeof window !== 'undefined' && window.liff?.isInClient?.()) {
    window.liff.openWindow({ url, external: true })
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
