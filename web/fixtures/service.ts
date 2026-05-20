// External service links — opened via liff.openWindow (external: true)

export type ServiceKey = 'ebook' | 'opac' | 'moodle' | 'pft' | 'maintenance' | 'cadet_id'

export interface ServiceItem {
  key: ServiceKey
  label: string
  description: string
  url: string
}

export const serviceItemsFixture: ReadonlyArray<ServiceItem> = [
  {
    key: 'ebook',
    label: 'ห้องสมุดอิเล็กทรอนิกส์',
    description: 'E-Book & ตำรา',
    url: 'https://ebook.crma.ac.th',
  },
  {
    key: 'opac',
    label: 'สืบค้นหนังสือ',
    description: 'OPAC ห้องสมุด',
    url: 'https://opac.crma.ac.th',
  },
  {
    key: 'moodle',
    label: 'ระบบ LMS',
    description: 'Moodle บทเรียนออนไลน์',
    url: 'https://lms.crma.ac.th/moodle/my/',
  },
  {
    key: 'pft',
    label: 'ลงทะเบียน PFT',
    description: 'Physical Fitness Test',
    url: 'https://pft.crma.ac.th',
  },
  {
    key: 'maintenance',
    label: 'แจ้งซ่อม',
    description: 'Maintenance Request',
    url: 'https://maintenance.crma.ac.th',
  },
  {
    key: 'cadet_id',
    label: 'บัตรประจำตัว',
    description: 'ดิจิทัล ID Card',
    url: 'https://id.crma.ac.th',
  },
]
