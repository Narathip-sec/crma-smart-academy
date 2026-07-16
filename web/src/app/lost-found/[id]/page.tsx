"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTx } from "@/components/shell/bilingual-label";
import { Button, LoadingState, ErrorState, Img } from "@/components/ui";

const THAI_MONTHS_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear() + 543}`;
}

type LFItem = {
  id: string; titleTh: string;
  descriptionTh: string | null; foundLocation: string | null;
  foundAt: string | null; status: string; createdAt: string;
  category: { nameTh: string } | null;
  reporter: { displayName: string } | null;
  claims: { id: string; claimantId: string; note: string | null; claimedAt: string }[];
  attachments: { asset: { url: string } | null }[];
};

const STATUS_CONFIG: Record<string, { th: string; color: string }> = {
  reported: { th: "รับเรื่อง",  color: "var(--brand)" },
  matched:  { th: "จับคู่แล้ว", color: "var(--cat-notice)" },
  claimed:  { th: "รับคืนแล้ว", color: "var(--success)" },
  closed:   { th: "ปิด",        color: "var(--muted)" },
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
  const [loadError, setLoadError] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetch(`/api/lost-found/${id}`)
      .then(r => r.json())
      .then((data: LFItem) => {
        if (data?.id) { setItem(data); setLoadError(""); }
        else setLoadError("ไม่พบรายการ");
      })
      .catch(() => setLoadError("โหลดไม่สำเร็จ"));
  }, [id]);

  useEffect(() => { load(); }, [load]);

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

  if (loadError) return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <ErrorState message={loadError} onRetry={load} />
    </div>
  );

  if (!item) return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <LoadingState label={t({ th: "กำลังโหลด…", en: "Loading…" })} />
    </div>
  );

  const statusCfg = STATUS_CONFIG[item.status] ?? { th: item.status, color: "var(--muted)" };
  const canClaim = item.status === "reported" && !claimed;
  const photoUrl = item.attachments[0]?.asset?.url;

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
            <span style={{ fontSize: 28 }}>📦</span>
          </div>
          <div>
            <div style={{ font: "700 20px var(--font-sans)", color: "#fff", lineHeight: 1.25 }}>{item.titleTh}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-8 pt-4">
        <div>
          <span style={{ display: "inline-flex", padding: "4px 12px", borderRadius: 999, background: `color-mix(in srgb, ${statusCfg.color} 10%, transparent)`, color: statusCfg.color, font: "600 11px var(--font-sans)" }}>
            {statusCfg.th}
          </span>
        </div>

        {photoUrl && <Img src={photoUrl} alt={item.titleTh} radius={16} ratio="4 / 3" />}

        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          {item.category && <InfoRow icon="🏷" labelTh="ประเภท" labelEn="Category" value={item.category.nameTh} t={t} />}
          {item.foundLocation && <InfoRow icon="📍" labelTh="สถานที่" labelEn="Location" value={item.foundLocation} t={t} />}
          {item.foundAt && <InfoRow icon="📅" labelTh="วันที่พบ" labelEn="Date found" value={fmtDate(item.foundAt)} t={t} />}
          <InfoRow icon="📋" labelTh="แจ้งเมื่อ" labelEn="Reported" value={fmtDate(item.createdAt)} t={t} />
        </div>

        {item.descriptionTh && (
          <div className="rounded-2xl p-4" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
            <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)", marginBottom: 8 }}>{t({ th: "รายละเอียด", en: "Details" })}</div>
            <div style={{ font: "400 13px var(--font-sans)", color: "var(--ink)", lineHeight: 1.6 }}>{item.descriptionTh}</div>
          </div>
        )}

        {error && <div style={{ font: "500 13px var(--font-sans)", color: "var(--danger)", textAlign: "center" }}>{error}</div>}

        {claimed ? (
          <div className="rounded-2xl py-4 text-center" style={{ background: "var(--tint)", font: "600 15px var(--font-sans)", color: "var(--brand)" }}>
            ✓ {t({ th: "แจ้งขอรับของแล้ว", en: "Claim submitted" })}
          </div>
        ) : (
          <Button onClick={canClaim ? claim : undefined} disabled={!canClaim || claimLoading}
            size="lg" full
            style={canClaim
              ? { background: "var(--brand)", border: "1px solid var(--brand)", color: "#fff" }
              : { background: "var(--line)", color: "var(--muted)", border: "1px solid var(--line)" }}>
            {claimLoading
              ? t({ th: "กำลังส่ง…", en: "Submitting…" })
              : item.status !== "reported"
              ? t({ th: "ปิดรับแล้ว", en: "Closed" })
              : t({ th: "นี่คือของฉัน → ขอรับคืน", en: "This is mine → Claim" })}
          </Button>
        )}
      </div>
    </div>
  );
}
