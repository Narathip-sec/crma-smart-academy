"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTx } from "@/components/shell/bilingual-label";
import { Button } from "@/components/ui";

const THAI_MONTHS_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear() + 543}`;
}

type LFItem = {
  id: string; type: "lost" | "found"; titleTh: string;
  descriptionTh: string | null; locationFound: string | null;
  lostDate: string | null; status: string; createdAt: string;
  category: { nameTh: string } | null;
  reporter: { displayName: string } | null;
  claims: { id: string; claimantId: string; status: string; createdAt: string }[];
};

const STATUS_CONFIG: Record<string, { th: string; color: string }> = {
  open:    { th: "รับเรื่อง",  color: "var(--brand)" },
  matched: { th: "จับคู่แล้ว", color: "var(--cat-notice)" },
  closed:  { th: "ปิด",        color: "var(--muted)" },
};

function InfoRow({ icon, labelTh, labelEn, value, t }: {
  icon: string; labelTh: string; labelEn: string; value: string;
  t: (bi: { th: string; en: string }) => string;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <div>
        <div style={{ font: "600 11px var(--font-sans)", color: "var(--muted)", marginBottom: 1 }}>
          {t({ th: labelTh, en: labelEn })}
        </div>
        <div style={{ font: "500 13px var(--font-sans)", color: "var(--ink)" }}>{value}</div>
      </div>
    </div>
  );
}

export default function LostFoundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const t = useTx();

  const [item, setItem] = useState<LFItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/lost-found/${id}`)
      .then(r => r.json())
      .then((data: LFItem) => { if (data?.id) setItem(data); else setError("ไม่พบรายการ"); })
      .catch(() => setError("โหลดไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, [id]);

  async function claim() {
    setClaimLoading(true); setError("");
    const res = await fetch(`/api/lost-found/${id}/claim`, { method: "POST" });
    if (res.ok) setClaimed(true);
    else {
      const body = await res.json().catch(() => ({}));
      setError((body as { error?: string }).error ?? "แจ้งขอไม่สำเร็จ");
    }
    setClaimLoading(false);
  }

  if (loading) return (
    <div className="flex flex-1 items-center justify-center" style={{ background: "var(--bg)" }}>
      <div style={{ font: "500 13px var(--font-sans)", color: "var(--muted)" }}>{t({ th: "กำลังโหลด…", en: "Loading…" })}</div>
    </div>
  );

  if (!item) return (
    <div className="flex flex-1 items-center justify-center" style={{ background: "var(--bg)" }}>
      <div style={{ font: "500 13px var(--font-sans)", color: "var(--danger)" }}>{error || "ไม่พบรายการ"}</div>
    </div>
  );

  const isLost = item.type === "lost";
  const typeColor = isLost ? "var(--danger)" : "var(--brand)";
  const statusCfg = STATUS_CONFIG[item.status] ?? { th: item.status, color: "var(--muted)" };
  const canClaim = item.status === "open" && !claimed;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto" style={{ background: "var(--bg)" }}>
      <div style={{ background: "linear-gradient(135deg, var(--grad-from) 0%, var(--grad-to) 100%)", padding: "12px 16px 28px" }}>
        <button type="button" onClick={() => router.back()}
          className="mb-4 flex h-9 w-9 items-center justify-center rounded-full active:opacity-70"
          style={{ background: "rgba(255,255,255,.2)" }} aria-label="Back">
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: "rgba(255,255,255,.2)" }}>
            <span style={{ font: "700 28px var(--font-sans)", color: "#fff" }}>{isLost ? "?" : "✓"}</span>
          </div>
          <div>
            <div className="mb-1">
              <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, background: "rgba(255,255,255,.25)", color: "#fff", font: "700 11px var(--font-sans)" }}>
                {isLost ? t({ th: "ของหาย", en: "Lost" }) : t({ th: "ของพบ", en: "Found" })}
              </span>
            </div>
            <div style={{ font: "700 18px var(--font-sans)", color: "#fff", lineHeight: 1.25 }}>{item.titleTh}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-8 pt-4">
        <div>
          <span style={{ display: "inline-flex", padding: "4px 12px", borderRadius: 999, background: `color-mix(in srgb, ${statusCfg.color} 10%, transparent)`, color: statusCfg.color, font: "600 11px var(--font-sans)" }}>
            {statusCfg.th}
          </span>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          {item.category && <InfoRow icon="🏷" labelTh="ประเภท" labelEn="Category" value={item.category.nameTh} t={t} />}
          {item.locationFound && <InfoRow icon="📍" labelTh="สถานที่" labelEn="Location" value={item.locationFound} t={t} />}
          {item.lostDate && <InfoRow icon="📅" labelTh="วันที่หาย" labelEn="Date lost" value={fmtDate(item.lostDate)} t={t} />}
          <InfoRow icon="📋" labelTh="แจ้งเมื่อ" labelEn="Reported" value={fmtDate(item.createdAt)} t={t} />
        </div>

        {item.descriptionTh && (
          <div className="rounded-2xl p-4" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
            <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)", marginBottom: 8 }}>{t({ th: "รายละเอียด", en: "Details" })}</div>
            <div style={{ font: "400 13px var(--font-sans)", color: "var(--ink)", lineHeight: 1.6 }}>{item.descriptionTh}</div>
          </div>
        )}

        {error && <div style={{ font: "500 12px var(--font-sans)", color: "var(--danger)", textAlign: "center" }}>{error}</div>}

        {claimed ? (
          <div className="rounded-2xl py-4 text-center" style={{ background: "var(--tint)", font: "600 15px var(--font-sans)", color: "var(--brand)" }}>
            ✓ {t({ th: "แจ้งขอรับของแล้ว", en: "Claim submitted" })}
          </div>
        ) : (
          <Button onClick={canClaim ? claim : undefined} disabled={!canClaim || claimLoading}
            size="lg" full
            style={canClaim
              ? { background: typeColor, border: `1px solid ${typeColor}`, color: "#fff" }
              : { background: "var(--line)", color: "var(--muted)", border: "1px solid var(--line)" }}>
            {claimLoading
              ? t({ th: "กำลังส่ง…", en: "Submitting…" })
              : item.status !== "open"
              ? t({ th: "ปิดรับแล้ว", en: "Closed" })
              : isLost
              ? t({ th: "ฉันพบของชิ้นนี้ → แจ้งเพื่อจับคู่", en: "I found this → Report match" })
              : t({ th: "นี่คือของฉัน → ขอรับคืน", en: "This is mine → Claim" })}
          </Button>
        )}
      </div>
    </div>
  );
}
