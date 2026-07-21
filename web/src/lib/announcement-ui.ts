// Shared display helpers for Announcement/NewsItem — both now come from the
// real DB (GET /api/announcements) instead of the old lib/data/announcements
// mock, which carried a canned accentColor/priority/timeAgo per row.

export const TAG_COLOR: Record<string, string> = {
  "สอบ": "var(--cat-exam)",
  "วิชาการ": "var(--cat-academic)",
  "ทหาร": "var(--cat-military)",
  "กิจกรรม": "var(--cat-activity)",
  "ประกาศ": "var(--cat-notice)",
};

export function tagColor(tag: string | null): string {
  return (tag && TAG_COLOR[tag]) || "var(--cat-notice)";
}

export function isRecent(publishAt: string | Date, days = 3): boolean {
  const ms = Date.now() - new Date(publishAt).getTime();
  return ms >= 0 && ms <= days * 24 * 60 * 60 * 1000;
}

export function timeAgo(publishAt: string | Date): { th: string; en: string } {
  const ms = Date.now() - new Date(publishAt).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return { th: "เมื่อสักครู่", en: "Just now" };
  if (mins < 60) return { th: `${mins} นาทีที่แล้ว`, en: `${mins}m ago` };
  const hours = Math.floor(mins / 60);
  if (hours < 24) return { th: `${hours} ชม. ที่แล้ว`, en: `${hours}h ago` };
  const days = Math.floor(hours / 24);
  if (days === 1) return { th: "เมื่อวาน", en: "Yesterday" };
  if (days < 7) return { th: `${days} วันที่แล้ว`, en: `${days}d ago` };
  return { th: formatDateTh(publishAt), en: formatDateTh(publishAt) };
}

const THAI_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export function formatDateTh(publishAt: string | Date): string {
  const d = new Date(publishAt);
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear() + 543}`;
}
