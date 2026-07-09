"use client";

import type { ReactNode } from "react";
import { LangProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { LiffAuthGate } from "@/components/shell/liff-auth-gate";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider initial="light">
      <LangProvider initial="th">
        <LiffAuthGate>{children}</LiffAuthGate>
      </LangProvider>
    </ThemeProvider>
  );
}
