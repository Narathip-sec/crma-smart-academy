// Activity view fixture — hardcoded Thai (next-intl swap in later phase)

export type EventCategory = 'SPORT' | 'ACADEMIC' | 'MILITARY' | 'SOCIAL' | 'CEREMONY'

export const EVENT_CATEGORY_LABEL: Record<EventCategory, string> = {
  SPORT: 'กีฬา',
  ACADEMIC: 'วิชาการ',
  MILITARY: 'ทหาร',
  SOCIAL: 'สังคม',
  CEREMONY: 'พิธีการ',
}

export const EVENT_CATEGORY_COLOR: Record<EventCategory, { badge: string }> = {
  SPORT: { badge: 'bg-orange-100 text-orange-600' },
  ACADEMIC: { badge: 'bg-blue-100 text-blue-600' },
  MILITARY: { badge: 'bg-red-100 text-red-600' },
  SOCIAL: { badge: 'bg-green-100 text-green-600' },
  CEREMONY: { badge: 'bg-purple-100 text-purple-600' },
}

export interface Attendee {
  id: string
  name: string
  avatarUri?: string
}

export interface ActivityEvent {
  id: string
  title: string
  dateISO: string // 'YYYY-MM-DD'
  timeStart: string // 'HH:mm'
  location: string
  category: EventCategory
  attendees: ReadonlyArray<Attendee>
  totalAttendees: number
}

export type AnnouncementLevel = 'INFO' | 'URGENT' | 'REMINDER'

export const ANNOUNCEMENT_LEVEL_LABEL: Record<AnnouncementLevel, string> = {
  INFO: 'ข้อมูล',
  URGENT: 'ด่วน',
  REMINDER: 'เตือนความจำ',
}

export const ANNOUNCEMENT_LEVEL_COLOR: Record<AnnouncementLevel, { badge: string }> = {
  INFO: { badge: 'bg-slate-100 text-slate-600' },
  URGENT: { badge: 'bg-red-100 text-red-600' },
  REMINDER: { badge: 'bg-amber-100 text-amber-600' },
}

export interface Announcement {
  id: string
  title: string
  body: string
  dateISO: string
  level: AnnouncementLevel
}

export const activityEventsFixture: ReadonlyArray<ActivityEvent> = [
  {
    id: 'ev1',
    title: 'การแข่งขันฟุตบอลระหว่างกองร้อย',
    dateISO: '2026-05-23',
    timeStart: '14:00',
    location: 'สนามกีฬากองพลน้อยที่ 1',
    category: 'SPORT',
    attendees: [
      { id: 'u1', name: 'Narathip Chetjai' },
      { id: 'u2', name: 'Krit Siriporn' },
      { id: 'u3', name: 'Wichai Boonmak' },
    ],
    totalAttendees: 28,
  },
  {
    id: 'ev2',
    title: 'สัมมนาภาวะผู้นำนักเรียนนายร้อย',
    dateISO: '2026-05-26',
    timeStart: '09:00',
    location: 'ห้องประชุมใหญ่ อาคารอำนวยการ',
    category: 'ACADEMIC',
    attendees: [
      { id: 'u1', name: 'Narathip Chetjai' },
      { id: 'u4', name: 'Panya Rodjan' },
    ],
    totalAttendees: 120,
  },
  {
    id: 'ev3',
    title: 'ซ้อมสวนสนามกองทัพบก',
    dateISO: '2026-05-28',
    timeStart: '06:00',
    location: 'สนามหน้าโรงเรียนนายร้อย',
    category: 'CEREMONY',
    attendees: [
      { id: 'u1', name: 'Narathip Chetjai' },
      { id: 'u2', name: 'Krit Siriporn' },
      { id: 'u3', name: 'Wichai Boonmak' },
      { id: 'u4', name: 'Panya Rodjan' },
    ],
    totalAttendees: 512,
  },
]

export const announcementsFixture: ReadonlyArray<Announcement> = [
  {
    id: 'ann1',
    title: 'ซ้อมสวนสนาม — แต่งกายเต็มยศ',
    body: 'วันที่ 26 พ.ค. 2026 เวลา 06:00 น. ณ สนามหน้าโรงเรียน ให้ทุกนักเรียนนายร้อยแต่งกายเต็มยศ พร้อมอุปกรณ์ครบชุด',
    dateISO: '2026-05-26',
    level: 'URGENT',
  },
  {
    id: 'ann2',
    title: 'กำหนดส่ง PFT รอบที่ 2/2568',
    body: 'นักเรียนนายร้อยชั้นปีที่ 1-4 ต้องส่งผล PFT ภายในวันที่ 30 พ.ค. 2026 ผ่านระบบออนไลน์',
    dateISO: '2026-05-20',
    level: 'REMINDER',
  },
  {
    id: 'ann3',
    title: 'เปิดชมรมกีฬาภาคเรียนที่ 2/2568',
    body: 'รับสมัครสมาชิกชมรมกีฬาทั้ง 12 ชมรม ตั้งแต่วันที่ 22-25 พ.ค. 2026 ที่อาคารพลศึกษา',
    dateISO: '2026-05-20',
    level: 'INFO',
  },
]
