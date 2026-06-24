"use client";

import { AppBar } from "./app-bar";
import { EmptyState } from "@/components/ui";

// Skeleton screen for routes not yet built. Push screens pass back.
export function PlaceholderScreen({
  th,
  en,
  phase,
  back = true,
}: {
  th: string;
  en: string;
  phase?: string;
  back?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <AppBar th={th} en={en} back={back} />
      <EmptyState
        title={<span lang="th">{th} · {en}</span>}
        hint="ยังไม่ได้สร้างหน้านี้ · Screen not built yet"
        tag={phase ?? "PHASE 1+"}
      />
    </div>
  );
}
