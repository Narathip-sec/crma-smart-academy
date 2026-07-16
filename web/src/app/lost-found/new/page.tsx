"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTx } from "@/components/shell/bilingual-label";
import { Button, FormField } from "@/components/ui";
import { upload } from "@vercel/blob/client";
import { compressImage } from "@/lib/compress-image";
import Image from "next/image";

type Category = { id: string; nameTh: string };

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px", borderRadius: "var(--radius-control)",
  border: "1px solid var(--line)", background: "var(--surface)",
  font: "500 13px var(--font-sans)", color: "var(--ink)", outline: "none",
};

export default function LostFoundNewPage() {
  const t = useTx();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cats, setCats]               = useState<Category[]>([]);
  const [titleTh, setTitleTh]         = useState("");
  const [descriptionTh, setDescriptionTh] = useState("");
  const [foundLocation, setFoundLocation] = useState("");
  const [foundAt, setFoundAt]         = useState("");
  const [categoryId, setCategoryId]   = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");

  const [photoPreview, setPhotoPreview]   = useState<string | null>(null);
  const [photoUrl, setPhotoUrl]           = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError]     = useState("");

  useEffect(() => {
    fetch("/api/lost-found/meta").then(r => r.json()).then((d: { categories?: Category[] }) => {
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

    const res = await fetch("/api/lost-found", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleTh,
        descriptionTh,
        categoryId: categoryId || undefined,
        foundAt: foundAt || undefined,
        foundLocation: foundLocation || undefined,
        photoUrl: photoUrl || undefined,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      router.push("/lost-found");
    } else {
      const body = await res.json().catch(() => ({}));
      setError((body as { error?: string }).error ?? "บันทึกไม่สำเร็จ");
    }
  }

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 px-4"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
        <button type="button" onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full active:opacity-70"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }} aria-label="Back">
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)" }}>
          {t({ th: "แจ้งของพบ / ของหาย", en: "Report Lost or Found" })}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={handleFileChange}
      />

      <form onSubmit={submit} className="flex-1 overflow-y-auto pb-8">

        {/* Photo upload */}
        <div className="px-4 pt-4">
          <FormField
            label={
              <>
                {t({ th: "รูปภาพประกอบ", en: "Photo" })}
                <span style={{ marginLeft: 6, fontWeight: 500 }}>{t({ th: "(ไม่บังคับ)", en: "(optional)" })}</span>
              </>
            }
            error={uploadError || undefined}
          >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="relative w-full overflow-hidden rounded-2xl active:opacity-70"
            style={{
              minHeight: 120,
              background: photoPreview ? "transparent" : "var(--tint)",
              border: photoPreview ? "none" : "1.5px dashed var(--brand)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            {photoPreview ? (
              <>
                <Image src={photoPreview} alt="photo" fill className="object-cover" unoptimized />
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,.35)" }}>
                  {uploadingPhoto ? (
                    <span style={{ font: "600 13px var(--font-sans)", color: "#fff" }}>
                      {t({ th: "กำลังอัปโหลด…", en: "Uploading…" })}
                    </span>
                  ) : (
                    <span style={{ font: "600 13px var(--font-sans)", color: "#fff" }}>
                      {photoUrl
                        ? t({ th: "✓ อัปโหลดสำเร็จ · แตะเพื่อเปลี่ยน", en: "✓ Uploaded · tap to change" })
                        : t({ th: "แตะเพื่อเปลี่ยนภาพ", en: "Tap to change" })}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span style={{ font: "600 13px var(--font-sans)", color: "var(--brand)" }}>
                  {t({ th: "เพิ่มรูปภาพ", en: "Add photo" })}
                </span>
                <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>
                  {t({ th: "แตะเพื่ออัปโหลด · JPG, PNG", en: "Tap to upload · JPG, PNG" })}
                </span>
              </>
            )}
          </button>
          </FormField>
        </div>

        <div className="flex flex-col gap-4 px-4 pt-4">

          <FormField label={t({ th: "ชื่อสิ่งของ", en: "Item name" })} required>
            <input
              type="text"
              value={titleTh}
              onChange={e => setTitleTh(e.target.value)}
              placeholder={t({ th: "เช่น กระเป๋าสีดำ, โทรศัพท์มือถือ…", en: "e.g. Black bag, mobile phone…" })}
              style={inputStyle}
            />
          </FormField>

          <FormField label={t({ th: "รายละเอียด", en: "Description" })} required>
            <textarea
              value={descriptionTh}
              onChange={e => setDescriptionTh(e.target.value)}
              rows={3}
              placeholder={t({ th: "ลักษณะ สี เครื่องหมาย หรือข้อมูลเพิ่มเติม…", en: "Appearance, color, markings…" })}
              style={{ ...inputStyle, resize: "none" }}
            />
          </FormField>

          {cats.length > 0 && (
            <FormField label={t({ th: "ประเภท", en: "Category" })}>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle}>
                <option value="">{t({ th: "— เลือกประเภท —", en: "— Select category —" })}</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.nameTh}</option>)}
              </select>
            </FormField>
          )}

          <FormField label={t({ th: "สถานที่พบ / หาย", en: "Location found / lost" })}>
            <input
              type="text"
              value={foundLocation}
              onChange={e => setFoundLocation(e.target.value)}
              placeholder={t({ th: "เช่น อาคาร 1 ชั้น 2, โรงอาหาร…", en: "e.g. Building 1 floor 2, canteen…" })}
              style={inputStyle}
            />
          </FormField>

          <FormField label={t({ th: "วันที่พบ / หาย", en: "Date found / lost" })}>
            <input
              type="date"
              value={foundAt}
              onChange={e => setFoundAt(e.target.value)}
              style={inputStyle}
            />
          </FormField>

          {error && (
            <div style={{ font: "500 13px var(--font-sans)", color: "var(--danger)" }}>{error}</div>
          )}

          <Button type="submit" size="lg" full
            disabled={submitting || !titleTh.trim() || !descriptionTh.trim() || uploadingPhoto}>
            {submitting
              ? t({ th: "กำลังบันทึก…", en: "Saving…" })
              : t({ th: "แจ้งของพบ / ของหาย", en: "Submit Report" })}
          </Button>
        </div>
      </form>
    </div>
  );
}
