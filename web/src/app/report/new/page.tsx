"use client";

import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/shell/app-bar";
import { useTx } from "@/components/shell/bilingual-label";
import { Button, FormField } from "@/components/ui";
import { upload } from "@vercel/blob/client";
import Image from "next/image";
import type { PinLocation } from "@/components/map/CampusPinMap";
import { compressImage } from "@/lib/compress-image";
import { sortOtherLast } from "@/lib/sort-other-last";

const CampusPinMap = lazy(() =>
  import("@/components/map/CampusPinMap").then(m => ({ default: m.CampusPinMap }))
);

type Category = { id: string; nameTh: string; nameEn: string | null };
type MetaResponse = { categories?: Category[] };

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px", borderRadius: "var(--radius-control)",
  border: "1px solid var(--line)", background: "var(--surface)",
  font: "500 13px var(--font-sans)", color: "var(--ink)", outline: "none",
};

export default function NewReportPage() {
  const t = useTx();
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [cats, setCats]               = useState<Category[]>([]);
  const [titleTh, setTitleTh]         = useState("");
  const [descriptionTh, setDescriptionTh] = useState("");
  const [pinLocation, setPinLocation] = useState<PinLocation | null>(null);
  const [roomDetail, setRoomDetail]   = useState("");
  const [categoryId, setCategoryId]   = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");
  const [showMap, setShowMap]         = useState(false);

  const [photoPreview, setPhotoPreview]     = useState<string | null>(null);
  const [photoUrl, setPhotoUrl]             = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError]       = useState("");

  useEffect(() => {
    fetch("/api/report/meta").then(r => r.json()).then((d: MetaResponse) => {
      if (d.categories) setCats(d.categories);
    }).catch(() => {});
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const local = URL.createObjectURL(file);
    setPhotoPreview(local);
    setPhotoUrl(null);
    setUploadError("");
    setUploadingPhoto(true);

    try {
      const compressed = await compressImage(file);
      const blob = await upload(compressed.name, compressed, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      setPhotoUrl(blob.url);
    } catch {
      setUploadError(t({ th: "อัปโหลดรูปไม่สำเร็จ", en: "Upload failed" }));
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleTh.trim() || !descriptionTh.trim()) return;
    setSubmitting(true); setError("");

    const locationParts: string[] = [];
    if (pinLocation) locationParts.push(`${pinLocation.lat.toFixed(6)},${pinLocation.lng.toFixed(6)}`);
    if (roomDetail)  locationParts.push(roomDetail);
    const locationNameTh = locationParts.length > 0 ? locationParts.join(" · ") : undefined;

    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleTh,
        descriptionTh,
        locationNameTh,
        categoryId: categoryId || undefined,
        photoUrl: photoUrl || undefined,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      router.push("/report");
    } else {
      const body = await res.json().catch(() => ({}));
      setError((body as { error?: string }).error ?? "แจ้งซ่อมไม่สำเร็จ");
    }
  }

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <AppBar th="แจ้งซ่อมใหม่" en="New Report" back />

      <div className="px-4 py-3"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ font: "500 13px var(--font-sans)", color: "var(--muted)" }}>
          {t({ th: "แจ้งปัญหาซ่อมแซมหรือเหตุการณ์ผิดปกติ", en: "Report maintenance or incidents" })}
        </div>
      </div>

      {/* Hidden file inputs — separate camera/gallery triggers since capture
          is treated as exclusive (camera-only) in LINE's Android in-app browser. */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={handleFileChange}
      />

      <form onSubmit={submit} className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <div className="flex flex-col gap-5">

          <FormField label={t({ th: "หัวข้อ", en: "Title" })} required>
            <input type="text" value={titleTh} onChange={e => setTitleTh(e.target.value)}
              placeholder={t({ th: "เช่น ไฟฟ้าดับห้อง 301…", en: "e.g. Power outage room 301…" })}
              style={inputStyle} required />
          </FormField>

          <FormField label={t({ th: "รายละเอียด", en: "Details" })} required>
            <textarea value={descriptionTh} onChange={e => setDescriptionTh(e.target.value)}
              rows={3} placeholder={t({ th: "อธิบายปัญหาเพิ่มเติม…", en: "Describe the issue…" })}
              style={{ ...inputStyle, resize: "none" }} />
          </FormField>

          {/* Photo */}
          <FormField
            label={t({ th: "แนบรูปภาพ (ไม่บังคับ)", en: "Attach photo (optional)" })}
            error={uploadError || undefined}
          >
            {photoPreview && (
              <div className="relative w-full overflow-hidden rounded-2xl" style={{ minHeight: 100 }}>
                <Image src={photoPreview} alt="attachment" fill className="object-cover" unoptimized />
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,.35)" }}>
                  <span style={{ font: "600 13px var(--font-sans)", color: "#fff" }}>
                    {uploadingPhoto
                      ? t({ th: "กำลังอัปโหลด…", en: "Uploading…" })
                      : photoUrl
                      ? t({ th: "✓ อัปโหลดสำเร็จ", en: "✓ Uploaded" })
                      : ""}
                  </span>
                </div>
              </div>
            )}
            <div className="flex gap-2" style={{ marginTop: photoPreview ? 8 : 0 }}>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 active:opacity-70"
                style={{ background: "var(--tint)", border: "1.5px dashed var(--brand)" }}
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span style={{ font: "600 13px var(--font-sans)", color: "var(--brand)" }}>
                  {t({ th: photoPreview ? "ถ่ายใหม่" : "ถ่ายรูป", en: photoPreview ? "Retake" : "Camera" })}
                </span>
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 active:opacity-70"
                style={{ background: "var(--tint)", border: "1.5px dashed var(--brand)" }}
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span style={{ font: "600 13px var(--font-sans)", color: "var(--brand)" }}>
                  {t({ th: "เลือกจากคลัง", en: "Gallery" })}
                </span>
              </button>
            </div>
          </FormField>

          {/* Map pin */}
          <div className="flex flex-col gap-1.5">
            <div style={{ font: "600 11px var(--font-sans)", color: "var(--muted)" }}>
              {t({ th: "ปักหมุดสถานที่ (ไม่บังคับ)", en: "Pin location (optional)" })}
            </div>

            {/* Toggle map open */}
            {!showMap ? (
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 active:opacity-70"
                style={{ background: "var(--tint)", border: "1.5px dashed var(--brand)" }}
              >
                <span style={{ fontSize: 18 }}>🗺️</span>
                <span style={{ font: "600 13px var(--font-sans)", color: "var(--brand)" }}>
                  {pinLocation
                    ? t({ th: "แก้ไขหมุด", en: "Edit pin" })
                    : t({ th: "เปิดแผนที่เพื่อปักหมุด", en: "Open map to pin" })}
                </span>
              </button>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--line)" }}>
                <Suspense fallback={
                  <div className="flex h-60 items-center justify-center" style={{ background: "var(--surface)" }}>
                    <span style={{ font: "500 13px var(--font-sans)", color: "var(--muted)" }}>
                      {t({ th: "กำลังโหลดแผนที่…", en: "Loading map…" })}
                    </span>
                  </div>
                }>
                  <CampusPinMap
                    value={pinLocation}
                    onChange={loc => setPinLocation(loc)}
                    height={260}
                  />
                </Suspense>
                <div className="px-3 py-2" style={{ background: "var(--surface)", borderTop: "1px solid var(--line)" }}>
                  <p style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginBottom: 6 }}>
                    {t({ th: "แตะบนแผนที่เพื่อปักหมุด · ลากหมุดเพื่อย้าย", en: "Tap map to place pin · drag to move" })}
                  </p>
                  {pinLocation && (
                    <div className="flex items-center justify-between">
                      <span style={{ font: "600 11px var(--font-sans)", color: "var(--brand)" }}>
                        📍 {pinLocation.lat.toFixed(5)}, {pinLocation.lng.toFixed(5)}
                      </span>
                      <button type="button" onClick={() => setPinLocation(null)}
                        className="active:opacity-70"
                        style={{ font: "600 11px var(--font-sans)", color: "var(--danger)", background: "none", border: "none", cursor: "pointer" }}>
                        {t({ th: "ลบหมุด", en: "Remove" })}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {pinLocation && !showMap && (
              <div className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "var(--tint)" }}>
                <span style={{ fontSize: 14 }}>📍</span>
                <span style={{ font: "600 11px var(--font-sans)", color: "var(--brand)", flex: 1 }}>
                  {pinLocation.lat.toFixed(5)}, {pinLocation.lng.toFixed(5)}
                </span>
                <button type="button" onClick={() => setPinLocation(null)}
                  className="active:opacity-70"
                  style={{ font: "600 11px var(--font-sans)", color: "var(--danger)", background: "none", border: "none", cursor: "pointer" }}>
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Room detail */}
          <FormField label={t({ th: "ห้อง / จุดเฉพาะ", en: "Room / Specific spot" })}>
            <input type="text" value={roomDetail} onChange={e => setRoomDetail(e.target.value)}
              placeholder={t({ th: "เช่น ชั้น 2 ห้อง 204, บันไดทางขวา…", en: "e.g. Floor 2 Rm 204, right stairway…" })}
              style={inputStyle} />
          </FormField>

          {cats.length > 0 && (
            <FormField label={t({ th: "ประเภทปัญหา", en: "Category" })}>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle}>
                <option value="">{t({ th: "— เลือกประเภท —", en: "— Select category —" })}</option>
                {sortOtherLast(cats).map(c => <option key={c.id} value={c.id}>{c.nameTh}</option>)}
              </select>
            </FormField>
          )}

          {error && (
            <div style={{ font: "500 13px var(--font-sans)", color: "var(--danger)" }}>{error}</div>
          )}

          <Button type="submit" size="lg" full disabled={submitting || uploadingPhoto || !titleTh.trim() || !descriptionTh.trim()}>
            {submitting ? t({ th: "กำลังส่ง…", en: "Submitting…" }) : t({ th: "แจ้งซ่อม / เหตุ", en: "Submit Report" })}
          </Button>
        </div>
      </form>
    </div>
  );
}
