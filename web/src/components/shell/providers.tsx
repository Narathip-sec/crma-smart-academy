"use client";

import type { ReactNode } from "react";
import { LangProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider initial="light">
      <LangProvider initial="th">
        {children}
      </LangProvider>
    </ThemeProvider>
  );
}
