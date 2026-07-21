"use client";

import { useEffect, useState } from "react";
import { useTx } from "@/components/shell/bilingual-label";
import { useLang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { AppBar } from "@/components/shell/app-bar";
import { ListItem } from "@/components/ui";

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 pb-1 pt-5"
      style={{ font: "700 11px var(--font-sans)", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {label}
    </div>
  );
}

function SettingRow({ icon, labelTh, labelEn, right, onClick, href }: {
  icon: string; labelTh: string; labelEn: string;
  right?: React.ReactNode; onClick?: () => void; href?: string;
}) {
  const t = useTx();
  return (
    <ListItem
      icon={<span style={{ fontSize: 18 }}>{icon}</span>}
      title={t({ th: labelTh, en: labelEn })}
      trailing={right}
      chevron={!right}
      href={href}
      onClick={onClick}
      style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}
    />
  );
}

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button type="button" onClick={() => setLang(lang === "th" ? "en" : "th")}
      className="flex items-center gap-1 rounded-full px-3 py-1 active:opacity-70"
      style={{ background: "var(--tint)", font: "700 11px var(--font-sans)", color: "var(--brand)" }}>
      <span style={{ opacity: lang === "th" ? 1 : 0.4 }}>ไทย</span>
      <span style={{ color: "var(--muted)" }}>/</span>
      <span style={{ opacity: lang === "en" ? 1 : 0.4 }}>EN</span>
    </button>
  );
}

function ThemeToggle() {
  const t = useTx();
  const { theme, setTheme } = useTheme();
  return (
    <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center gap-1 rounded-full px-3 py-1 active:opacity-70"
      style={{ background: "var(--tint)", font: "700 11px var(--font-sans)", color: "var(--brand)" }}>
      <span style={{ opacity: theme === "light" ? 1 : 0.4 }}>{t({ th: "สว่าง", en: "Light" })}</span>
      <span style={{ color: "var(--muted)" }}>/</span>
      <span style={{ opacity: theme === "dark" ? 1 : 0.4 }}>{t({ th: "มืด", en: "Dark" })}</span>
    </button>
  );
}

export default function SettingsPage() {
  const t = useTx();
  const [lineLinked, setLineLinked] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then(r => r.json())
      .then((data: { lineLinked?: boolean }) => setLineLinked(!!data.lineLinked))
      .catch(() => setLineLinked(false));
  }, []);

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
            right={lineLinked === null
              ? <span style={{ font: "600 11px var(--font-sans)", color: "var(--muted)" }}>…</span>
              : lineLinked
                ? <span style={{ font: "600 11px var(--font-sans)", color: "var(--success)" }}>{t({ th: "เชื่อมต่อแล้ว ✓", en: "Linked ✓" })}</span>
                : <span style={{ font: "600 11px var(--font-sans)", color: "var(--muted)" }}>{t({ th: "ยังไม่เชื่อมต่อ", en: "Not linked" })}</span>} />
        </div>
        <SectionHeader label={t({ th: "การแจ้งเตือน", en: "Notifications" })} />
        <div style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <SettingRow icon="🔔" labelTh="ดูการแจ้งเตือนทั้งหมด" labelEn="View all notifications" href="/notifications" />
        </div>
        <SectionHeader label={t({ th: "ข้อมูลและความเป็นส่วนตัว", en: "Privacy" })} />
        <div style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <SettingRow icon="🔒" labelTh="นโยบาย PDPA" labelEn="PDPA Policy" href="/settings/pdpa" />
        </div>
        <div className="px-4 py-6 text-center" style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>
          CRMA Smart Academy LIFF · v0.1.0 · กรมยุทธศึกษาทหารบก
        </div>
      </div>
    </div>
  );
}
