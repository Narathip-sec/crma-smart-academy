"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "th" | "en";

export type Bilingual = { th: string; en: string };

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
}>({ lang: "en", setLang: () => {} });

export function LangProvider({
  children,
  initial = "en",
}: {
  children: ReactNode;
  initial?: Lang;
}) {
  const [lang, setLang] = useState<Lang>(initial);
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

export function tx(bag: Bilingual | string | undefined, lang: Lang): string {
  if (bag == null) return "";
  if (typeof bag === "string") return bag;
  return bag[lang] ?? bag.en ?? bag.th ?? "";
}
