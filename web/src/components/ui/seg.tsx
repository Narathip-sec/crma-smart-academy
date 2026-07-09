"use client";

// Segmented control (e.g. Mon–Fri day tabs, Lost/Found/Mine tabs).
export function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <div
      className="flex gap-1 p-1"
      style={{ background: "var(--tint)", borderRadius: 12 }}
    >
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className="flex-1 active:opacity-70"
            style={{
              padding: "7px 8px",
              borderRadius: 9,
              background: active ? "var(--surface)" : "transparent",
              color: active ? "var(--brand-dark)" : "var(--muted)",
              font: `${active ? 600 : 500} 12px var(--font-sans)`,
              boxShadow: active ? "0 1px 2px rgba(15,23,42,.1)" : undefined,
              cursor: "pointer",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
