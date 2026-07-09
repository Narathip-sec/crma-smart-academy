"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

// Floating dev-only toggle for TH/EN and light/dark.
// Hidden in production builds via NEXT_PUBLIC_DEV_TOOLBAR=0 if needed.
export function DevToolbar() {
  const { lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-2 top-2 z-50 flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
        style={{
          background: "var(--ink)",
          color: "var(--surface)",
          letterSpacing: ".1em",
        }}
      >
        DEV
      </button>
      {open && (
        <div
          className="flex flex-col gap-1 rounded-md p-1.5"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            boxShadow: "0 6px 18px rgba(0,0,0,.12)",
          }}
        >
          <div className="flex gap-1">
            {(["en", "th"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className="rounded px-2 py-0.5 text-[10px]"
                style={{
                  background: lang === l ? "var(--ink)" : "transparent",
                  color: lang === l ? "var(--surface)" : "var(--ink)",
                  border: "1px solid var(--line)",
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className="rounded px-2 py-0.5 text-[10px]"
                style={{
                  background: theme === t ? "var(--ink)" : "transparent",
                  color: theme === t ? "var(--surface)" : "var(--ink)",
                  border: "1px solid var(--line)",
                }}
              >
                {t === "light" ? "☼ Light" : "☾ Dark"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
