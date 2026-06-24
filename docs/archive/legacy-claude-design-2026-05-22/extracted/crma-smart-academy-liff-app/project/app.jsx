// App — assembles all wireframes into a DesignCanvas of sections.

const ABW = 316;
const ABH = 610;

const SECTIONS = [
  {
    id: 'home', th: 'หน้าหลัก', en: 'Home',
    sub: 'Profile banner · hero carousel · quick services · feed',
    variants: [
      { id: 'v1', label: 'A · Classic LIFF', comp: window.HomeV1 },
      { id: 'v2', label: 'B · Mission Brief', comp: window.HomeV2 },
      { id: 'v3', label: 'C · Command Deck', comp: window.HomeV3 },
    ],
  },
  {
    id: 'profile', th: 'ประวัติ / เกรด', en: 'Profile + Grade Report',
    sub: 'Personal info · semester-locked grades · GPA / GPAX',
    variants: [
      { id: 'v1', label: 'A · Transcript', comp: window.ProfileV1 },
      { id: 'v2', label: 'B · Stats Dashboard', comp: window.ProfileV2 },
      { id: 'v3', label: 'C · Service Record', comp: window.ProfileV3 },
    ],
  },
  {
    id: 'class', th: 'ตารางเรียน', en: 'Class Schedule',
    sub: 'Day/Week views · semester selector',
    variants: [
      { id: 'v1', label: 'A · Day Pills', comp: window.ClassV1 },
      { id: 'v2', label: 'B · Week Grid', comp: window.ClassV2 },
      { id: 'v3', label: 'C · Now Timeline', comp: window.ClassV3 },
    ],
  },
  {
    id: 'meal', th: 'อาหาร + AI', en: 'Meal & Calorie AI',
    sub: 'Mess hall menu · AI calorie target · macros',
    variants: [
      { id: 'v1', label: 'A · Daily Cards', comp: window.MealV1 },
      { id: 'v2', label: 'B · Ring + AI Chat', comp: window.MealV2 },
      { id: 'v3', label: 'C · Build-a-Tray', comp: window.MealV3 },
    ],
  },
  {
    id: 'health', th: 'สุขภาพ AI', en: 'Health AI · multi-provider',
    sub: 'Apple Health · Google Fit · Strava · Garmin · Manual',
    variants: [
      { id: 'v1', label: 'A · Activity Rings', comp: window.HealthV1 },
      { id: 'v2', label: 'B · PFT Dashboard', comp: window.HealthV2 },
      { id: 'v3', label: 'C · Integration Hub', comp: window.HealthV3 },
    ],
  },
  {
    id: 'report', th: 'แจ้งซ่อม / เหตุ', en: 'Report / Fix',
    sub: 'Routine · urgent · emergency intake',
    variants: [
      { id: 'v1', label: 'A · Quick Form', comp: window.ReportV1 },
      { id: 'v2', label: 'B · Map Pin', comp: window.ReportV2 },
      { id: 'v3', label: 'C · AI Concierge', comp: window.ReportV3 },
    ],
  },
  {
    id: 'calendar', th: 'ปฏิทินวิชาการ', en: 'Calendar',
    sub: 'Month · Agenda · Year-band visualization',
    variants: [
      { id: 'v1', label: 'A · Month Grid', comp: window.CalV1 },
      { id: 'v2', label: 'B · Agenda', comp: window.CalV2 },
      { id: 'v3', label: 'C · Year Bands', comp: window.CalV3 },
    ],
  },
  {
    id: 'todo', th: 'งาน / รายการ', en: 'To-do',
    sub: 'Categorized · kanban · daily orders',
    variants: [
      { id: 'v1', label: 'A · Categorized List', comp: window.TodoV1 },
      { id: 'v2', label: 'B · Kanban Swimlanes', comp: window.TodoV2 },
      { id: 'v3', label: 'C · Daily Orders', comp: window.TodoV3 },
    ],
  },
  {
    id: 'activity', th: 'กิจกรรม', en: 'Activity · Meetup-style',
    sub: 'Horizontal featured · map · swipe RSVP',
    variants: [
      { id: 'v1', label: 'A · Featured + Grid', comp: window.ActivityV1 },
      { id: 'v2', label: 'B · Map Discovery', comp: window.ActivityV2 },
      { id: 'v3', label: 'C · Swipe Stack', comp: window.ActivityV3 },
    ],
  },
  {
    id: 'service', th: 'บริการ', en: 'Service Menu',
    sub: 'Grades · e-book · library · AI coach · history · commanders',
    variants: [
      { id: 'v1', label: 'A · Tile Grid', comp: window.ServiceV1 },
      { id: 'v2', label: 'B · Categorized', comp: window.ServiceV2 },
      { id: 'v3', label: 'C · Command ⌘', comp: window.ServiceV3 },
    ],
  },
];

function App() {
  const { DesignCanvas, DCSection, DCArtboard } = window;
  return (
    <DesignCanvas>
      {/* Cover / overview section */}
      <DCSection id="intro" title="CRMA Smart Academy · LIFF" subtitle="Wireframe exploration · bilingual TH/EN · mid-fi · navy + crimson · iOS & Android · 3 variations per view">
        <DCArtboard id="cover" label="Brief" width={520} height={ABH}>
          <CoverArtboard />
        </DCArtboard>
        <DCArtboard id="legend" label="Legend" width={300} height={ABH}>
          <LegendArtboard />
        </DCArtboard>
      </DCSection>

      {SECTIONS.map((s) => (
        <DCSection
          key={s.id}
          id={s.id}
          title={`${s.th} · ${s.en}`}
          subtitle={s.sub}
        >
          {s.variants.map((v) => {
            const Comp = v.comp || (() => <div style={{ padding: 30, color: '#888' }}>missing: {v.label}</div>);
            return (
              <DCArtboard key={v.id} id={`${s.id}-${v.id}`} label={v.label} width={ABW} height={ABH}>
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 6px 4px' }}>
                  <Comp />
                </div>
              </DCArtboard>
            );
          })}
        </DCSection>
      ))}
    </DesignCanvas>
  );
}

function CoverArtboard() {
  return (
    <div style={{ padding: 24, height: '100%', background: '#fbfaf6', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* corner marks */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <path d="M16 16 L16 32 M16 16 L32 16" stroke="#a8182a" strokeWidth="1.5" fill="none" />
        <path d="M504 16 L504 32 M504 16 L488 16" stroke="#a8182a" strokeWidth="1.5" fill="none" />
        <path d="M16 594 L16 578 M16 594 L32 594" stroke="#a8182a" strokeWidth="1.5" fill="none" />
        <path d="M504 594 L504 578 M504 594 L488 594" stroke="#a8182a" strokeWidth="1.5" fill="none" />
      </svg>
      <div style={{ font: '700 9px "Space Grotesk"', color: '#a8182a', letterSpacing: '.3em' }}>
        ⬢ WIREFRAME EXPLORATION · 30 ARTBOARDS · V0.1
      </div>
      <div style={{ font: '700 30px Sarabun, sans-serif', color: '#15203a', marginTop: 14, lineHeight: 1.1 }}>
        แอป CRMA Smart Academy
      </div>
      <div style={{ font: '600 19px "Space Grotesk"', color: '#3a4561', letterSpacing: '.02em' }}>
        CRMA Smart Academy LIFF App
      </div>
      <div style={{ width: 60, height: 2, background: '#a8182a', margin: '14px 0' }} />
      <div style={{ font: '400 12px Sarabun, sans-serif', color: '#3a4561', lineHeight: 1.5, maxWidth: 380 }}>
        แพลตฟอร์มดิจิทัลรวมระบบสำหรับนักเรียนนายร้อย รร.จปร. — ตารางเรียน
        การฝึก ชีวิตประจำวัน เกรด ประกาศ และ AI โค้ช
      </div>
      <div style={{ font: '400 11px "Space Grotesk"', color: '#6f6a60', lineHeight: 1.5, maxWidth: 380, marginTop: 6 }}>
        A digital platform consolidating scattered systems for cadets —
        schedules, military training, daily life, grades, announcements,
        and an AI fitness coach — distributed via LIFF inside the CRMA LINE OA.
      </div>

      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <div style={{ font: '700 9px "Space Grotesk"', color: '#a8182a', letterSpacing: '.15em', marginBottom: 6 }}>STACK</div>
          <div style={{ font: '400 11px "Space Grotesk"', color: '#15203a', lineHeight: 1.6 }}>
            Next.js · Prisma · PostgreSQL<br/>
            Vercel · LIFF v2 · LINE OA<br/>
            Auth @crma.ac.th
          </div>
        </div>
        <div>
          <div style={{ font: '700 9px "Space Grotesk"', color: '#a8182a', letterSpacing: '.15em', marginBottom: 6 }}>COMPLIANCE</div>
          <div style={{ font: '400 11px "Space Grotesk"', color: '#15203a', lineHeight: 1.6 }}>
            PDPA B.E. 2562 (2019)<br/>
            ISO 27001<br/>
            Royal Thai Army standards
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', font: '500 9px "Space Grotesk"', color: '#6f6a60', letterSpacing: '.1em' }}>
        <span>21 MAY 2026 · WIREFRAMES V1</span>
        <span>3 VARIATIONS / VIEW · iOS + ANDROID</span>
      </div>
    </div>
  );
}

function LegendArtboard() {
  return (
    <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column', gap: 10, background: '#fbfaf6' }}>
      <div style={{ font: '700 9px "Space Grotesk"', color: '#a8182a', letterSpacing: '.2em' }}>LEGEND</div>

      <div>
        <div style={{ font: '500 8px "Space Grotesk"', color: '#6f6a60', letterSpacing: '.15em', marginBottom: 4 }}>COLOR</div>
        {[
          ['Navy · primary', '#15203a'],
          ['Crimson · accent / urgent', '#a8182a'],
          ['Gold · honors / AI', '#b8923a'],
          ['Bone · paper', '#fbfaf6'],
          ['Shade · neutral fill', '#ebe7db'],
          ['Rule · divider', '#cdc6b7'],
        ].map(([n, c]) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
            <div style={{ width: 16, height: 16, background: c, border: '1px solid rgba(0,0,0,.08)', borderRadius: 3 }} />
            <span style={{ font: '500 10px "Space Grotesk"', color: '#3a4561' }}>{n}</span>
          </div>
        ))}
      </div>

      <div>
        <div style={{ font: '500 8px "Space Grotesk"', color: '#6f6a60', letterSpacing: '.15em', marginBottom: 4 }}>TYPE</div>
        <div style={{ font: '700 16px Sarabun, sans-serif', color: '#15203a' }}>สวัสดีจปร.</div>
        <div style={{ font: '500 11px "Space Grotesk"', color: '#3a4561' }}>SMART ACADEMY</div>
        <div style={{ font: '500 11px Caveat, cursive', color: '#a8182a' }}>designer notes</div>
      </div>

      <div>
        <div style={{ font: '500 8px "Space Grotesk"', color: '#6f6a60', letterSpacing: '.15em', marginBottom: 4 }}>FRAMES</div>
        <div style={{ font: '400 10px "Space Grotesk"', color: '#3a4561', lineHeight: 1.5 }}>
          ⌘ iOS · rounded, dynamic island<br/>
          ⌬ Android · hole-punch, 3-btn<br/>
          Each view shows both
        </div>
      </div>

      <div style={{ marginTop: 'auto', padding: 10, background: '#ebe7db', borderRadius: 6, font: '400 9px "Space Grotesk"', color: '#15203a', lineHeight: 1.5 }}>
        Use the Tweaks toggle (top toolbar) to switch language emphasis and annotation overlay.
      </div>
    </div>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
