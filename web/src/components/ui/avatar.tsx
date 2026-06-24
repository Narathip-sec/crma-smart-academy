"use client";

// Circular avatar with image + initials fallback.
export function Avatar({
  name,
  src,
  size = 40,
}: {
  name?: string;
  src?: string;
  size?: number;
}) {
  const initials = (name ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        background: "var(--tint)",
        border: "1px solid var(--line)",
        color: "var(--brand-dark)",
        font: `700 ${Math.round(size * 0.36)}px var(--font-sans)`,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? "avatar"} width={size} height={size}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials || "·"
      )}
    </span>
  );
}
