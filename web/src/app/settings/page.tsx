"use client";

import { useTx } from "@/components/shell/bilingual-label";
import { useLang } from "@/lib/i18n";
import { AppBar } from "@/components/shell/app-bar";
import Link from "next/link";

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 pb-1 pt-5"
      style={{ font: "700 10px var(--font-sans)", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {label}
    </div>
  );
}

function SettingRow({ icon, labelTh, labelEn, right, onClick, href }: {
  icon: string; labelTh: string; labelEn: string;
  right?: React.ReactNode; onClick?: () => void; href?: string;
}) {
  const t = useTx();
  const inner = (
    <div className="flex items-center gap-3 px-4 py-4"
      style={{ borderBottom: "1px solid var(--line)", cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: "var(--tint)", fontSize: 18 }}>
        {icon}
      </div>
      <div className="flex-1">
        <div style={{ font: "600 13px var(--font-sans)", color: "var(--ink)" }}>
          {t({ th: labelTh, en: labelEn })}
        </div>
      </div>
      {right ?? (
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--line)" strokeWidth={2} strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </div>
  );
  if (href) return <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link>;
  return inner;
}

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button type="button" onClick={() => setLang(lang === "th" ? "en" : "th")}
      className="flex items-center gap-1 rounded-full px-3 py-1"
      style={{ background: "var(--tint)", font: "700 11px var(--font-sans)", color: "var(--brand)" }}>
      <span style={{ opacity: lang === "th" ? 1 : 0.4 }}>ไทย</span>
      <span style={{ color: "var(--muted)" }}>/</span>
      <span style={{ opacity: lang === "en" ? 1 : 0.4 }}>EN</span>
    </button>
  );
}

function ThemeToggle() {
  const t = useTx();
  function toggle() {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme");
    root.setAttribute("data-theme", current === "dark" ? "light" : "dark");
  }
  return (
    <button type="button" onClick={toggle}
      className="rounded-full px-3 py-1"
      style={{ background: "var(--tint)", font: "700 11px var(--font-sans)", color: "var(--brand)" }}>
      {t({ th: "สลับ", en: "Toggle" })}
    </button>
  );
}

export default function SettingsPage() {
  const t = useTx();
  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <AppBar th="ตั้งค่า" en="Settings" back />
      <div className="flex-1 overflow-y-auto pb-8">
        <SectionHeader label={t({ th: "การแสดงผล", en: "Display" })} />
        <div style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <SettingRow icon="🌐" labelTh="ภาษา" labelEn="Language" right={<LangToggle />} />
          <SettingRow icon="🌙" labelTh="ธีมสี (มืด/สว่าง)" labelEn="Dark / Light theme" right={<ThemeToggle />} />
        </div>
        <SectionHeader label={t({ th: "บัญชี", en: "Account" })} />
        <div style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <SettingRow icon="👤" labelTh="โปรไฟล์ของฉัน" labelEn="My profile" href="/profile" />
          <SettingRow icon="🔗" labelTh="เชื่อมต่อ LINE" labelEn="Link LINE account"
            right={<span style={{ font: "600 11px var(--font-sans)", color: "var(--muted)" }}>{t({ th: "เร็วๆ นี้", en: "Coming soon" })}</span>} />
        </div>
        <SectionHeader label={t({ th: "การแจ้งเตือน", en: "Notifications" })} />
        <div style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <SettingRow icon="🔔" labelTh="ดูการแจ้งเตือนทั้งหมด" labelEn="View all notifications" href="/notifications" />
        </div>
        <SectionHeader label={t({ th: "ข้อมูลและความเป็นส่วนตัว", en: "Privacy" })} />
        <div style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <SettingRow icon="🔒" labelTh="นโยบาย PDPA" labelEn="PDPA Policy"
            right={<span style={{ font: "600 11px var(--font-sans)", color: "var(--muted)" }}>→</span>} />
        </div>
        <div className="px-4 py-6 text-center" style={{ font: "500 10px var(--font-sans)", color: "var(--muted)" }}>
          CRMA Smart Academy LIFF · v0.1.0 · กรมยุทธศึกษาทหารบก
        </div>
      </div>
    </div>
  );
}
