"use client";

import type { CSSProperties, ReactNode } from "react";
import { tx, useLang, type Bilingual } from "@/lib/i18n";

type Props = {
  th: string;
  en: string;
  size?: number;
  weight?: number;
  align?: CSSProperties["textAlign"];
  className?: string;
  style?: CSSProperties;
  color?: string;
  mono?: boolean;
};

export function L({
  th, en, size = 12, weight = 500, align = "left",
  className, style, color, mono,
}: Props) {
  const { lang } = useLang();
  const text = tx({ th, en }, lang);
  if (!text) return null;
  const fontFamily = mono ? "var(--font-mono)" : "var(--font-sans)";
  return (
    <div
      className={className}
      style={{
        font: `${weight} ${size}px ${fontFamily}`,
        color: color ?? "var(--ink)",
        lineHeight: 1.25,
        textAlign: align,
        ...style,
      }}
    >
      {text}
    </div>
  );
}

export function T({ children, bag }: { children?: ReactNode; bag?: Bilingual }) {
  const { lang } = useLang();
  if (bag) return <>{tx(bag, lang)}</>;
  return <>{children}</>;
}

export function useTx() {
  const { lang } = useLang();
  return (bag: Bilingual | string | undefined) => tx(bag, lang);
}
