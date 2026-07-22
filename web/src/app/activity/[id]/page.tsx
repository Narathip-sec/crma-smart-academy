"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTx } from "@/components/shell/bilingual-label";
import { Button, LoadingState, ErrorState, Img } from "@/components/ui";

const THAI_MONTHS_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const THAI_DAYS = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"];

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const be = d.getFullYear() + 543;
  return `${THAI_DAYS[d.getDay()]} ${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${be} · ${d.toTimeString().slice(0, 5)} น.`;
}

function formatShortDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} · ${d.toTimeString().slice(0, 5)} น.`;
}

type Event = {
  id: string;
  titleTh: string;
  titleEn: string | null;
  descriptionTh: string | null;
  location: string | null;
  startAt: string;
  endAt: string | null;
  maxAttendees: number | null;
  status: string;
  category: { nameTh: string } | null;
  imageUrl: string | null;
  attendeeCount: number;
  myRsvp: boolean;
  creatorName: string;
  isOwner: boolean;
  attendeeList?: { name: string; registeredAt: string }[];
};

const STATUS_LABEL: Record<string, { th: string; color: string }> = {
  draft:    { th: "ร่าง",          color: "var(--muted)" },
  open:     { th: "เปิดรับสมัคร",  color: "var(--brand)" },
  closed:   { th: "ปิดรับสมัคร",   color: "var(--muted)" },
  cancelled:{ th: "ยกเลิก",        color: "var(--danger)" },
};

function InfoRow({ icon, labelTh, labelEn, value, t }: {
  icon: string; labelTh: string; labelEn: string; value: string;
  t: (bi: { th: string; en: string }) => string;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div>
        <div style={{ font: "600 11px var(--font-sans)", color: "var(--muted)", marginBottom: 1 }}>
          {t({ th: labelTh, en: labelEn })}
        </div>
        <div style={{ font: "500 13px var(--font-sans)", color: "var(--ink)" }}>{value}</div>
      </div>
    </div>
  );
}

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const t = useTx();

  const [event, setEvent] = useState<Event | null>(null);
  const [loadError, setLoadError] = useState("");
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpDone, setRsvpDone] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetch(`/api/activity/${id}`)
      .then(r => r.json())
      .then((data: Event) => {
        if (data && data.id) { setEvent(data); setRsvpDone(data.myRsvp); setLoadError(""); }
        else setLoadError("ไม่พบกิจกรรม");
      })
      .catch(() => setLoadError("โหลดข้อมูลไม่สำเร็จ"));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function postRsvp(action: "register" | "cancel") {
    setRsvpLoading(true);
    setError("");
    const res = await fetch(`/api/activity/${id}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) load();
    else {
      const body = await res.json().catch(() => ({}));
      setError((body as { error?: string }).error ?? (action === "cancel" ? "ยกเลิกไม่สำเร็จ" : "RSVP ไม่สำเร็จ"));
    }
    setRsvpLoading(false);
  }

  if (loadError) return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <ErrorState message={loadError} onRetry={load} />
    </div>
  );

  if (!event) return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <LoadingState label={t({ th: "กำลังโหลด…", en: "Loading…" })} />
    </div>
  );

  const statusLbl = STATUS_LABEL[event.status] ?? { th: event.status, color: "var(--muted)" };
  const full = event.maxAttendees !== null && event.attendeeCount >= event.maxAttendees;
  const canRsvp = event.status === "open" && !full && !rsvpDone;

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
        {event.category && (
          <div className="mb-2">
            <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, background: "rgba(255,255,255,.2)", color: "#fff", font: "600 11px var(--font-sans)" }}>
              {event.category.nameTh}
            </span>
          </div>
        )}
        <div style={{ font: "700 20px var(--font-sans)", color: "#fff", lineHeight: 1.25 }}>
          {t({ th: event.titleTh, en: event.titleEn ?? event.titleTh })}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-8 pt-5">
        {event.imageUrl && <Img src={event.imageUrl} alt={event.titleTh} radius={16} ratio="16 / 9" />}

        <div className="flex gap-2">
          <span style={{ display: "inline-flex", padding: "4px 12px", borderRadius: 999, background: `color-mix(in srgb, ${statusLbl.color} 10%, transparent)`, color: statusLbl.color, font: "600 11px var(--font-sans)" }}>
            {statusLbl.th}
          </span>
          {event.maxAttendees && (
            <span style={{ display: "inline-flex", padding: "4px 12px", borderRadius: 999, background: "var(--tint)", color: full ? "var(--danger)" : "var(--brand)", font: "600 11px var(--font-sans)" }}>
              👥 {event.attendeeCount}/{event.maxAttendees} {full ? t({ th: "เต็ม", en: "Full" }) : t({ th: "ที่นั่ง", en: "seats" })}
            </span>
          )}
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <InfoRow icon="📅" labelTh="วันเวลา" labelEn="Date & Time" value={formatDateTime(event.startAt)} t={t} />
          {event.endAt && <InfoRow icon="🔚" labelTh="สิ้นสุด" labelEn="End" value={formatDateTime(event.endAt)} t={t} />}
          {event.location && <InfoRow icon="📍" labelTh="สถานที่" labelEn="Location" value={event.location} t={t} />}
          <InfoRow icon="👤" labelTh="จัดโดย" labelEn="Organized by" value={event.creatorName} t={t} />
        </div>

        {event.isOwner && event.attendeeList && (
          <div className="rounded-2xl p-4" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
            <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)", marginBottom: 8 }}>
              {t({ th: `รายชื่อผู้ลงทะเบียน (${event.attendeeList.length})`, en: `Registered (${event.attendeeList.length})` })}
            </div>
            {event.attendeeList.length === 0 ? (
              <div style={{ font: "400 13px var(--font-sans)", color: "var(--muted)" }}>
                {t({ th: "ยังไม่มีผู้ลงทะเบียน", en: "No registrations yet" })}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {event.attendeeList.map((a, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span style={{ font: "500 13px var(--font-sans)", color: "var(--ink)" }}>{a.name}</span>
                    <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>{formatShortDateTime(a.registeredAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {event.descriptionTh && (
          <div className="rounded-2xl p-4" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
            <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)", marginBottom: 8 }}>{t({ th: "รายละเอียด", en: "Details" })}</div>
            <div style={{ font: "400 13px var(--font-sans)", color: "var(--muted)", lineHeight: 1.6 }}>{event.descriptionTh}</div>
          </div>
        )}

        {error && <div style={{ font: "500 13px var(--font-sans)", color: "var(--danger)", textAlign: "center" }}>{error}</div>}

        {rsvpDone ? (
          <div className="flex flex-col gap-2">
            <div className="rounded-2xl py-4 text-center" style={{ background: "var(--tint)", font: "600 15px var(--font-sans)", color: "var(--brand)" }}>
              ✓ {t({ th: "ลงทะเบียนแล้ว", en: "Registered" })}
            </div>
            <Button onClick={() => postRsvp("cancel")} disabled={rsvpLoading}
              size="lg" full
              style={{ background: "transparent", color: "var(--danger)", border: "1px solid var(--danger)" }}>
              {rsvpLoading
                ? t({ th: "กำลังยกเลิก…", en: "Cancelling…" })
                : t({ th: "ยกเลิกลงทะเบียน", en: "Cancel registration" })}
            </Button>
          </div>
        ) : (
          <Button onClick={canRsvp ? () => postRsvp("register") : undefined} disabled={!canRsvp || rsvpLoading}
            size="lg" full
            style={!canRsvp ? { background: "var(--line)", color: "var(--muted)", border: "1px solid var(--line)" } : undefined}>
            {rsvpLoading
              ? t({ th: "กำลังลงทะเบียน…", en: "Registering…" })
              : full
              ? t({ th: "ที่นั่งเต็ม", en: "Full" })
              : event.status !== "open"
              ? t({ th: "ยังไม่เปิดรับสมัคร", en: "Not open yet" })
              : t({ th: "ลงทะเบียนเข้าร่วม", en: "Register" })}
          </Button>
        )}
      </div>
    </div>
  );
}
