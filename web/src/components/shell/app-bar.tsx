"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { L } from "./bilingual-label";

type Props = {
  th: string;
  en: string;
  back?: boolean;
  right?: ReactNode;
};

export function AppBar({ th, en, back, right }: Props) {
  const router = useRouter();
  return (
    <header
      className="sticky top-0 z-30 flex h-11 items-center gap-2 px-3.5"
      style={{
        background: "var(--bg)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      {back && (
        <button
          type="button"
          onClick={() => router.back()}
          className="-ml-1.5 flex h-6 w-6 items-center justify-center rounded active:opacity-70"
          aria-label="Back"
        >
          <svg
            width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="var(--ink)" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      <div className="flex-1">
        <L th={th} en={en} size={13} weight={600} />
      </div>
      {right}
    </header>
  );
}
