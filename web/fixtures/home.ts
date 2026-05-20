// Port of app/src/fixtures/home.ts — i18n keys replaced with hardcoded Thai.
// Phase 5+ (next-intl) will swap these back to i18n lookup.

export const profileFixture = {
  name: 'Narathip Chetjai',
  role: 'นักเรียนนายร้อย ปี 3',
  avatarUri: undefined as string | undefined,
}

export interface HeroSlide {
  id: string
  badge: string
  title: string
  subtitle: string
  ctaLabel: string
}

export const heroSlidesFixture: HeroSlide[] = [
  {
    id: 'h1',
    badge: 'งานใหม่',
    title: 'สัมมนาภาวะผู้นำ',
    subtitle: 'วันนี้ 14:00 น. ห้องประชุมใหญ่',
    ctaLabel: 'ดูรายละเอียด',
  },
  {
    id: 'h2',
    badge: 'ประกาศ',
    title: 'ฝึกยิงปืน กองร้อย ก',
    subtitle: 'พรุ่งนี้ 08:00 น. สนามยิงปืน',
    ctaLabel: 'ดูรายละเอียด',
  },
  {
    id: 'h3',
    badge: 'กิจกรรม',
    title: 'ซ้อมสวนสนาม',
    subtitle: '26 พ.ค. 2026 — สนามหน้าโรงเรียน',
    ctaLabel: 'ดูรายละเอียด',
  },
  {
    id: 'h4',
    badge: 'เตือนความจำ',
    title: 'ลงทะเบียน PFT',
    subtitle: 'กำหนดส่ง 30 พ.ค. 2026',
    ctaLabel: 'ดูรายละเอียด',
  },
]

export type QuickServiceKey = 'class' | 'meal' | 'health' | 'cadet_id'

export interface QuickServiceItem {
  key: QuickServiceKey
  label: string
}

export const quickServicesFixture: QuickServiceItem[] = [
  { key: 'class', label: 'ตารางเรียน' },
  { key: 'meal', label: 'มื้ออาหาร' },
  { key: 'health', label: 'สุขภาพ' },
  { key: 'cadet_id', label: 'บัตรประจำตัว' },
]

export type InsightKind = 'fitness' | 'academic'

export interface InsightItem {
  id: string
  kind: InsightKind
  title: string
  body: string
}

export const insightsFixture: InsightItem[] = [
  {
    id: 'i1',
    kind: 'fitness',
    title: 'ความฟิตร่างกาย',
    body: 'ผลทดสอบ PFT ล่าสุด: 87/100 คะแนน ดีกว่าค่าเฉลี่ยรุ่น',
  },
  {
    id: 'i2',
    kind: 'academic',
    title: 'ภาระการเรียน',
    body: 'สัปดาห์นี้มี 3 วิชาที่ต้องส่งงาน กำหนด 28 พ.ค.',
  },
]

export interface FeedItem {
  id: string
  imageUri: string
  title: string
  dateISO: string
}

export const newsFixture: FeedItem[] = [
  {
    id: 'n1',
    imageUri: 'https://placehold.co/600x300/0F172A/F8FAFC?text=ข่าว',
    title: 'กรมนักเรียนร่วมการฝึกยุทธวิธีร่วม',
    dateISO: '2026-05-14',
  },
]

export const eventsFixture: FeedItem[] = [
  {
    id: 'e1',
    imageUri: 'https://placehold.co/600x300/F59E0B/0F172A?text=กิจกรรม',
    title: 'งานเปิดชมรม ภาคเรียนที่ 2/2568',
    dateISO: '2026-05-20',
  },
]
