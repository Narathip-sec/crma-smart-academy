"use client";

import { useTx } from "@/components/shell/bilingual-label";
import { AppBar } from "@/components/shell/app-bar";

function Section({ th, en, children }: { th: string; en: string; children: React.ReactNode }) {
  const t = useTx();
  return (
    <div className="px-4 py-4" style={{ borderBottom: "1px solid var(--line)" }}>
      <div style={{ font: "700 13px var(--font-sans)", color: "var(--ink)", marginBottom: 6 }}>
        {t({ th, en })}
      </div>
      <div style={{ font: "400 12px var(--font-sans)", color: "var(--muted)", lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
}

export default function PdpaPage() {
  const t = useTx();
  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <AppBar th="นโยบาย PDPA" en="PDPA Policy" back />
      <div className="flex-1 overflow-y-auto pb-8" style={{ background: "var(--surface)" }}>
        <Section
          th="ข้อมูลที่เราเก็บ"
          en="Data we collect">
          {t({
            th: "ข้อมูลโปรไฟล์ LINE (ชื่อ รูปโปรไฟล์), ชื่อ-รหัสนักเรียน สังกัดกองพัน/กองร้อย และรายการที่ผู้ใช้สร้างขึ้นเอง เช่น รายงาน กิจกรรม แจ้งของหาย-ของพบ และงานที่มอบหมาย",
            en: "LINE profile data (name, avatar), student name/code, battalion/company affiliation, and records you create yourself — reports, activities, lost & found posts, and assigned tasks.",
          })}
        </Section>
        <Section
          th="วัตถุประสงค์การใช้ข้อมูล"
          en="Purpose of use">
          {t({
            th: "ใช้เพื่อยืนยันตัวตนผู้ใช้ แสดงตารางเรียนและกิจกรรมที่เกี่ยวข้อง ติดตามงานที่มอบหมาย และให้เจ้าหน้าที่ดำเนินการตามคำร้อง (แจ้งซ่อม แจ้งของหาย-ของพบ) เท่านั้น ไม่ใช้เพื่อการโฆษณาหรือส่งต่อบุคคลที่สาม",
            en: "Used to authenticate you, show your class schedule and relevant activities, track assigned tasks, and let staff act on your requests (repair reports, lost & found). Not used for advertising or shared with third parties.",
          })}
        </Section>
        <Section
          th="สิทธิ์ของผู้ใช้"
          en="Your rights">
          {t({
            th: "ผู้ใช้มีสิทธิ์ขอเข้าถึง แก้ไข หรือขอให้ลบข้อมูลส่วนบุคคลของตนเองได้ โดยติดต่อผ่านช่องทางด้านล่าง",
            en: "You may request access to, correction of, or deletion of your personal data by contacting us through the channel below.",
          })}
        </Section>
        <Section
          th="ช่องทางติดต่อ"
          en="Contact">
          {t({
            th: "กรมยุทธศึกษาทหารบก — ติดต่อเจ้าหน้าที่ดูแลระบบผ่านหน่วยงานต้นสังกัด",
            en: "Army Training Command — contact the system administrator through your affiliated unit.",
          })}
        </Section>
      </div>
    </div>
  );
}
