"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

// Standard tappable row: leading icon bubble · title/subtitle · trailing.
// Replaces the hand-rolled service/settings/notifications row pattern.
export function ListItem({
  icon,
  iconBg = "var(--tint)",
  title,
  subtitle,
  trailing,
  chevron,
  href,
  onClick,
  style,
}: {
  icon?: ReactNode;
  iconBg?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  href?: string;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  const body = (
    <>
      {icon && (
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div style={{ font: "600 13px var(--font-sans)", color: "var(--ink)", lineHeight: 1.35 }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
      {trailing}
      {chevron && (
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </>
  );

  const shared = {
    className: "flex min-h-11 w-full items-center gap-3 active:opacity-70",
    style: { textDecoration: "none", ...style } as CSSProperties,
  };

  if (href) {
    return (
      <Link href={href} {...shared}>
        {body}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} {...shared} style={{ textAlign: "left", ...shared.style }}>
        {body}
      </button>
    );
  }
  return <div {...shared}>{body}</div>;
}
