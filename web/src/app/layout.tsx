import type { Metadata, Viewport } from "next";
import { Sarabun, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/shell/providers";
import { BottomNav } from "@/components/shell/bottom-nav";
import { DevToolbar } from "@/components/shell/dev-toolbar";
import { MAX_W } from "@/lib/tokens";
import "./globals.css";

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://crma-smart-academy.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CRMA Smart Academy",
    template: "%s · CRMA Smart Academy",
  },
  description:
    "CRMA Smart Cadet Platform — one-stop digital service for Chulachomklao Royal Military Academy.",
  openGraph: {
    type: "website",
    siteName: "CRMA Smart Academy",
    title: "CRMA Smart Academy",
    description:
      "CRMA Smart Cadet Platform — one-stop digital service for Chulachomklao Royal Military Academy.",
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
    title: "CRMA Smart Academy",
    description:
      "CRMA Smart Cadet Platform — one-stop digital service for Chulachomklao Royal Military Academy.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0BA8A0",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Local helper only. Production must opt in explicitly.
  const showDevToolbar =
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_DEV_TOOLBAR === "1";

  return (
    <html
      lang="th"
      className={`${sarabun.variable} ${grotesk.variable} h-full antialiased`}
    >
      <body className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Providers>
          {/* Mobile-only LIFF surface: full-width on device, capped on desktop preview. */}
          <main
            className="mx-auto flex min-h-screen w-full flex-col"
            style={{ maxWidth: MAX_W, paddingBottom: 64, background: "var(--bg)" }}
          >
            {children}
          </main>
          <BottomNav />
          {showDevToolbar && <DevToolbar />}
        </Providers>
      </body>
    </html>
  );
}
