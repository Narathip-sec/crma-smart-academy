"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/i18n";

type Tab = {
  href: string;
  th: string;
  en: string;
  icon: "home" | "class" | "check" | "flag" | "grid";
};

// 5 root tabs from the approved mock: home · class · todo · activity · service.
const TABS: Tab[] = [
  { href: "/",         th: "หน้าหลัก",  en: "Home",     icon: "home" },
  { href: "/class",    th: "ตารางเรียน", en: "Class",    icon: "class" },
  { href: "/todo",     th: "งาน",       en: "Todo",     icon: "check" },
  { href: "/activity", th: "กิจกรรม",   en: "Activity", icon: "flag" },
  { href: "/service",  th: "บริการ",    en: "Service",  icon: "grid" },
];

// Push sub-screens that should keep a root tab highlighted.
const SUBROUTE_TAB: Record<string, string> = {
  "/profile": "/",
  "/meals": "/",
  "/calendar": "/",
  "/report": "/",
  "/lost-found": "/",
  "/notifications": "/",
  "/settings": "/",
};

function tabForPath(path: string): string {
  if (TABS.some((t) => t.href === path)) return path;
  // longest-prefix match for nested routes (e.g. /activity/123, /report/tickets)
  for (const t of TABS) {
    if (t.href !== "/" && path.startsWith(t.href)) return t.href;
  }
  for (const sub of Object.keys(SUBROUTE_TAB)) {
    if (path === sub || path.startsWith(sub + "/")) return SUBROUTE_TAB[sub];
  }
  return "/";
}

function NavIcon({ kind, active }: { kind: Tab["icon"]; active: boolean }) {
  const s = {
    fill: "none",
    stroke: active ? "var(--brand)" : "var(--muted)",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const W = 22, H = 22;
  switch (kind) {
    case "home":
      return (
        <svg width={W} height={H} viewBox="0 0 24 24">
          <path {...s} d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1V11z" />
        </svg>
      );
    case "class":
      return (
        <svg width={W} height={H} viewBox="0 0 24 24">
          <path {...s} d="M4 5h16v14H4z" />
          <path {...s} d="M4 9h16M8 5v14" />
        </svg>
      );
    case "check":
      return (
        <svg width={W} height={H} viewBox="0 0 24 24">
          <path {...s} d="M9 11l3 3 7-7" />
          <path {...s} d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      );
    case "flag":
      return (
        <svg width={W} height={H} viewBox="0 0 24 24">
          <path {...s} d="M4 21V4M4 4h12l-2 4 2 4H4" />
        </svg>
      );
    case "grid":
      return (
        <svg width={W} height={H} viewBox="0 0 24 24">
          <rect {...s} x="3"  y="3"  width="7" height="7" rx="1.5" />
          <rect {...s} x="14" y="3"  width="7" height="7" rx="1.5" />
          <rect {...s} x="3"  y="14" width="7" height="7" rx="1.5" />
          <rect {...s} x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
  }
}

export function BottomNav() {
  const path = usePathname();
  const { lang } = useLang();
  const activeTab = tabForPath(path);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex h-16 items-start pt-2"
      style={{
        maxWidth: 420,
        background: "var(--surface)",
        borderTop: "1px solid var(--line)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 6px)",
        boxShadow: "0 -2px 12px rgba(15,23,42,.05)",
      }}
    >
      {TABS.map((t) => {
        const active = activeTab === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className="flex flex-1 select-none flex-col items-center gap-1"
            style={{ color: active ? "var(--brand)" : "var(--muted)" }}
          >
            <NavIcon kind={t.icon} active={active} />
            <span
              style={{
                font: `${active ? 600 : 500} 10px var(--font-sans)`,
                letterSpacing: lang === "th" ? 0 : ".02em",
              }}
            >
              {lang === "th" ? t.th : t.en}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
