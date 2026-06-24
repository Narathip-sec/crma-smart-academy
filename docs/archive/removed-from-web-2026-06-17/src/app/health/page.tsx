"use client";

import { useState } from "react";
import { AppBar } from "@/components/shell/app-bar";
import { useTx } from "@/components/shell/bilingual-label";

type ProviderId = "apple" | "strava" | "garmin" | "google" | "manual";

type Provider = { id: ProviderId; name: string; icon: string; color: string };

const PROVIDERS: Provider[] = [
  { id: "apple",  name: "Apple Health", icon: "",  color: "#1c1c1e" },
  { id: "strava", name: "Strava",        icon: "S", color: "#fc4c02" },
  { id: "garmin", name: "Garmin",        icon: "G", color: "#007dc3" },
  { id: "google", name: "Google Fit",    icon: "G", color: "#1a73e8" },
  { id: "manual", name: "Manual",        icon: "M", color: "#64748b" },
];

type ProviderState = { on: boolean; last: string };

const INIT_PROVIDERS: Record<ProviderId, ProviderState> = {
  apple:  { on: true,  last: "now" },
  strava: { on: true,  last: "2h ago" },
  garmin: { on: false, last: "tap to link" },
  google: { on: false, last: "tap to link" },
  manual: { on: false, last: "" },
};

const RINGS = [
  { label: "MOVE",     value: "465", goal: "600", unit: "kcal", color: "var(--danger)",  r: 48, pct: 0.78 },
  { label: "EXERCISE", value: "38",  goal: "60",  unit: "min",  color: "var(--success)", r: 38, pct: 0.63 },
  { label: "STAND",    value: "8",   goal: "12",  unit: "hr",   color: "#1a73e8",        r: 28, pct: 0.67 },
];

const STATS = [
  { icon: "👟", label: "STEPS",   value: "8,420",      sub: "goal 12k"    },
  { icon: "💧", label: "WATER",   value: "1.8 L",      sub: "goal 3 L"    },
  { icon: "❤",  label: "HR REST", value: "62 bpm",     sub: "good"         },
  { icon: "⛅", label: "WEATHER", value: "31° / AQI 42", sub: "go run"    },
];

export default function HealthPage() {
  const t = useTx();
  const [providers, setProviders] = useState(INIT_PROVIDERS);

  const toggle = (id: ProviderId) =>
    setProviders((prev) => ({
      ...prev,
      [id]: { on: !prev[id].on, last: !prev[id].on ? "just now" : "tap to link" },
    }));

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <AppBar th="สุขภาพ AI" en="Health AI" back />

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Workout app picker */}
        <div className="mt-3">
          <div className="mb-2.5 flex items-baseline justify-between px-3.5">
            <span style={{ font: "700 12px var(--font-sans)", color: "var(--ink)" }}>
              {t({ th: "แอปออกกำลังกาย", en: "Workout Apps · sync source" })}
            </span>
            <button
              type="button"
              style={{ font: "500 11px var(--font-sans)", color: "var(--brand)", background: "none", border: "none", cursor: "pointer" }}
            >
              {t({ th: "จัดการ", en: "manage" })} ›
            </button>
          </div>
          <div
            className="flex gap-3 overflow-x-auto px-3.5 pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {PROVIDERS.map((p) => {
              const on = providers[p.id].on;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p.id)}
                  className="flex shrink-0 flex-col items-center rounded-2xl p-3"
                  style={{
                    width: 86,
                    background: on ? "var(--surface)" : "var(--tint-2)",
                    border: `1.5px solid ${on ? p.color : "var(--line)"}`,
                    boxShadow: on ? `0 0 0 3px ${p.color}22` : "none",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: on ? p.color : "var(--line)", color: "#fff", font: "700 15px var(--font-sans)" }}
                  >
                    {p.icon}
                  </div>
                  <div
                    className="mt-1.5 text-center"
                    style={{ font: "600 9px var(--font-sans)", color: on ? "var(--ink)" : "var(--muted)", lineHeight: 1.3 }}
                  >
                    {p.name}
                  </div>
                  <div style={{ font: "400 8px var(--font-sans)", color: on ? "var(--success)" : "var(--muted)", marginTop: 2 }}>
                    {on ? `synced ${providers[p.id].last}` : (providers[p.id].last || "—")}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Activity rings + ring labels */}
        <div
          className="mx-3.5 mt-3 flex items-center gap-4 rounded-2xl p-4"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <div className="shrink-0">
            <svg width="110" height="110" viewBox="0 0 110 110">
              {RINGS.map((ring) => {
                const circ = 2 * Math.PI * ring.r;
                return (
                  <g key={ring.label}>
                    <circle cx="55" cy="55" r={ring.r} fill="none" stroke={ring.color} strokeWidth="8" opacity=".18" />
                    <circle
                      cx="55" cy="55" r={ring.r}
                      fill="none"
                      stroke={ring.color}
                      strokeWidth="8"
                      strokeDasharray={`${circ * ring.pct} ${circ}`}
                      strokeLinecap="round"
                      transform="rotate(-90 55 55)"
                    />
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex flex-1 flex-col gap-2.5">
            {RINGS.map((r) => (
              <div key={r.label}>
                <div style={{ font: "600 8px var(--font-sans)", color: r.color, letterSpacing: ".1em" }}>
                  {r.label}
                </div>
                <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)", lineHeight: 1.1 }}>
                  {r.value} / {r.goal}{" "}
                  <span style={{ font: "400 10px var(--font-sans)", color: "var(--muted)" }}>
                    {r.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="mx-3.5 mt-3 grid grid-cols-2 gap-2.5">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-3.5"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
            >
              <div style={{ font: "500 9px var(--font-sans)", color: "var(--muted)", letterSpacing: ".1em" }}>
                {s.icon} {s.label}
              </div>
              <div style={{ font: "700 17px var(--font-sans)", color: "var(--ink)", marginTop: 4, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ font: "400 10px var(--font-sans)", color: "var(--muted)", marginTop: 3 }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* PFT CTA */}
        <div
          className="mx-3.5 mt-3 rounded-2xl p-4"
          style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-darker) 100%)", color: "#fff" }}
        >
          <div style={{ font: "700 14px var(--font-sans)" }}>
            {t({ th: "ผลทดสอบสมรรถภาพทางกาย (PFT)", en: "Physical Fitness Test (PFT)" })}
          </div>
          <div style={{ font: "400 11px var(--font-sans)", opacity: 0.8, marginTop: 4 }}>
            {t({ th: "ผลล่าสุด: มี.ค. 2569 · คะแนน 82 / 100", en: "Last: Mar 2026 · Score 82 / 100" })}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="rounded-xl px-4 py-2"
              style={{
                background: "rgba(255,255,255,.25)",
                border: "1px solid rgba(255,255,255,.3)",
                font: "600 11px var(--font-sans)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {t({ th: "ดูผลทั้งหมด", en: "View full results" })}
            </button>
            <button
              type="button"
              className="rounded-xl px-4 py-2"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,.3)",
                font: "600 11px var(--font-sans)",
                color: "rgba(255,255,255,.8)",
                cursor: "pointer",
              }}
            >
              {t({ th: "ภายหลัง", en: "Later" })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
