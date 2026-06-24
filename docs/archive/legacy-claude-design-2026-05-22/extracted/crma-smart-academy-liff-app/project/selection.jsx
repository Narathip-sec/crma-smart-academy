// Selection canvas — only the chosen variant per view (all "A · Classic LIFF")
// with callouts on the three that gained new features.

const SEL_ABW = 320;
const SEL_ABH = 620;

const SELECTED = [
  { id: 'home',     th: 'หน้าหลัก',          en: 'Home',                 comp: 'HomeV1',     sub: 'Profile banner · hero · quick services · feed' },
  { id: 'profile',  th: 'ประวัติ + เกรด',     en: 'Profile + Grade Report', comp: 'ProfileV1',  sub: 'Transcript · GPA · semester-locked' },
  { id: 'class',    th: 'ตารางเรียน',         en: 'Class Schedule',       comp: 'ClassV1',    sub: 'Day pills · Mon→Fri · semester' },
  { id: 'meal',     th: 'อาหาร + AI',         en: 'Meal & Calorie AI',    comp: 'MealV1',     sub: 'Mess hall + canteen purchases · AI target', updated: 'log purchases beyond mess hall menu' },
  { id: 'health',   th: 'สุขภาพ AI',          en: 'Health AI',            comp: 'HealthV1',   sub: 'Activity rings · multi-provider sync', updated: 'redesigned workout-app picker row' },
  { id: 'report',   th: 'แจ้งซ่อม / เหตุ',    en: 'Report / Fix',         comp: 'ReportV1',   sub: 'Quick form · routine→emergency · map pin', updated: 'drop a pin on the map for precise location' },
  { id: 'calendar', th: 'ปฏิทินวิชาการ',      en: 'Calendar',             comp: 'CalV1',      sub: 'Month grid · dot markers · day list' },
  { id: 'todo',     th: 'งาน',                en: 'To-do',                comp: 'TodoV1',     sub: 'Categorized list · Academic / Military / Personal' },
  { id: 'activity', th: 'กิจกรรม',            en: 'Activity',             comp: 'ActivityV1', sub: 'Featured rail · category chips · RSVP · FAB' },
  { id: 'service',  th: 'บริการ',             en: 'Service Menu',         comp: 'ServiceV1',  sub: 'Search · frequent · tile grid' },
];

function SelectionApp() {
  const { DesignCanvas, DCSection, DCArtboard } = window;
  return (
    <DesignCanvas>
      <DCSection id="intro" title="CRMA Smart Academy · Chosen Direction" subtitle="All option A · Classic LIFF · 3 views gained new features (★)">
        <DCArtboard id="cover" label="Brief" width={520} height={SEL_ABH}>
          <SelectionCover />
        </DCArtboard>
        <DCArtboard id="map" label="Bottom Nav" width={SEL_ABW} height={SEL_ABH}>
          <NavMapArtboard />
        </DCArtboard>
      </DCSection>

      <DCSection id="screens" title="10 Screens · Chosen" subtitle="Tap a card to focus · ←→ to step through · Esc to exit">
        {SELECTED.map(s => {
          const Comp = window[s.comp] || (() => <div>missing</div>);
          const updated = !!s.updated;
          return (
            <DCArtboard
              key={s.id}
              id={s.id}
              label={`${updated ? '★ ' : ''}${s.en}`}
              width={SEL_ABW}
              height={SEL_ABH}
            >
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'flex-start',
                padding: '10px 6px 4px',
                position: 'relative',
                background: '#fbfaf6',
              }}>
                {/* TH label above phone */}
                <div style={{
                  font: '600 11px Sarabun', color: '#15203a',
                  marginBottom: 4, letterSpacing: '.02em',
                }}>
                  {s.th}
                </div>
                <Comp />
                {/* "What's new" call-out on modified screens */}
                {updated && (
                  <div style={{
                    position: 'absolute', left: 8, right: 8, bottom: 6,
                    padding: '6px 8px', borderRadius: 6,
                    background: '#fff4d6', border: '1px solid #b8923a',
                    font: '500 9px "Space Grotesk"', color: '#15203a',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{
                      background: '#b8923a', color: '#fff',
                      padding: '1px 5px', borderRadius: 3,
                      font: '700 8px "Space Grotesk"', letterSpacing: '.1em',
                    }}>NEW</span>
                    <span style={{ flex: 1 }}>{s.updated}</span>
                  </div>
                )}
              </div>
            </DCArtboard>
          );
        })}
      </DCSection>
    </DesignCanvas>
  );
}

function SelectionCover() {
  return (
    <div style={{ padding: 24, height: '100%', background: '#fbfaf6', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <path d="M16 16 L16 32 M16 16 L32 16" stroke="#a8182a" strokeWidth="1.5" fill="none" />
        <path d="M504 16 L504 32 M504 16 L488 16" stroke="#a8182a" strokeWidth="1.5" fill="none" />
        <path d="M16 604 L16 588 M16 604 L32 604" stroke="#a8182a" strokeWidth="1.5" fill="none" />
        <path d="M504 604 L504 588 M504 604 L488 604" stroke="#a8182a" strokeWidth="1.5" fill="none" />
      </svg>
      <div style={{ font: '700 9px "Space Grotesk"', color: '#a8182a', letterSpacing: '.3em' }}>
        ⬢ CHOSEN DIRECTION · V1 · 10 SCREENS
      </div>
      <div style={{ font: '700 30px Sarabun, sans-serif', color: '#15203a', marginTop: 14, lineHeight: 1.1 }}>
        ทิศทางที่เลือก
      </div>
      <div style={{ font: '600 19px "Space Grotesk"', color: '#3a4561' }}>
        Locked direction · Option A throughout
      </div>
      <div style={{ width: 60, height: 2, background: '#a8182a', margin: '14px 0' }} />
      <div style={{ font: '400 12px Sarabun, sans-serif', color: '#3a4561', lineHeight: 1.5, maxWidth: 420 }}>
        ทุกหน้าจอใช้แบบที่หนึ่ง · เพิ่มฟีเจอร์ใหม่ใน 3 หน้า
      </div>
      <div style={{ font: '400 11px "Space Grotesk"', color: '#6f6a60', lineHeight: 1.5, maxWidth: 420, marginTop: 4 }}>
        All ten views use variation A (Classic LIFF). Three screens gained
        new functionality based on your notes — flagged with a ★ in their
        artboard label and a NEW callout at the bottom of the card.
      </div>

      <div style={{
        marginTop: 22, padding: 14, borderRadius: 10,
        background: '#fff4d6', border: '1px solid #b8923a',
      }}>
        <div style={{ font: '700 9px "Space Grotesk"', color: '#7d6224', letterSpacing: '.2em', marginBottom: 8 }}>
          ★ NEW FEATURES IN THIS PASS
        </div>
        {[
          ['Meal',   'Log canteen / personal purchases on top of mess-hall menu — kcal + ฿ baht spend tracked per meal'],
          ['Health', 'Workout-app picker redesigned as a horizontal row of provider cards · multi-active, tap to link more'],
          ['Report', 'Drop-pin map inside the form — drag to adjust, zoom, GPS shortcut, lat/long shown under address'],
        ].map(([n, d]) => (
          <div key={n} style={{ display: 'flex', gap: 10, marginTop: 6, alignItems: 'flex-start' }}>
            <span style={{
              flexShrink: 0,
              background: '#15203a', color: '#fff',
              padding: '1px 6px', borderRadius: 3,
              font: '700 8px "Space Grotesk"', letterSpacing: '.1em', marginTop: 1,
            }}>{n.toUpperCase()}</span>
            <span style={{ font: '400 11px "Space Grotesk"', color: '#15203a', lineHeight: 1.4 }}>{d}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', font: '500 9px "Space Grotesk"', color: '#6f6a60', letterSpacing: '.1em' }}>
        <span>21 MAY 2026 · SELECTION V1</span>
        <span>iOS frames · TH/EN bilingual</span>
      </div>
    </div>
  );
}

function NavMapArtboard() {
  return (
    <div style={{ padding: 16, height: '100%', background: '#fbfaf6', display: 'flex', flexDirection: 'column' }}>
      <div style={{ font: '700 9px "Space Grotesk"', color: '#a8182a', letterSpacing: '.2em' }}>NAV MAP</div>
      <div style={{ font: '700 14px Sarabun, sans-serif', color: '#15203a', marginTop: 4 }}>
        แผนผังการนำทาง
      </div>
      <div style={{ font: '400 10px "Space Grotesk"', color: '#6f6a60' }}>5 bottom-nav tabs · supporting flows</div>

      <div style={{ flex: 1, marginTop: 14, fontSize: 11 }}>
        {[
          { nav: 'HOME', th: 'หน้าหลัก', sub: ['Profile › full', 'Quick service: Class', 'Quick service: Meal', 'Quick service: Health AI', 'Quick service: Report'] },
          { nav: 'CALENDAR', th: 'ปฏิทิน', sub: ['Day events list'] },
          { nav: 'TO-DO', th: 'งาน', sub: ['Add / edit task'] },
          { nav: 'ACTIVITY', th: 'กิจกรรม', sub: ['RSVP via LINE flex', 'Create new (FAB)'] },
          { nav: 'SERVICE', th: 'บริการ', sub: ['Grades / E-Book / Library / AI / Commanders / History'] },
        ].map((n, i) => (
          <div key={n.nav} style={{ marginBottom: 10 }}>
            <div style={{
              display: 'inline-block',
              background: i === 0 ? '#a8182a' : '#15203a', color: '#fff',
              padding: '2px 8px', borderRadius: 3,
              font: '700 9px "Space Grotesk"', letterSpacing: '.1em',
            }}>{n.nav}</div>
            <span style={{ marginLeft: 8, font: '500 11px Sarabun', color: '#15203a' }}>{n.th}</span>
            <div style={{ marginLeft: 14, marginTop: 4, paddingLeft: 10, borderLeft: '1px dashed #cdc6b7' }}>
              {n.sub.map(s => (
                <div key={s} style={{ font: '400 10px "Space Grotesk"', color: '#3a4561', lineHeight: 1.6 }}>
                  ↳ {s}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        padding: 10, background: '#ebe7db', borderRadius: 6,
        font: '400 10px "Space Grotesk"', color: '#15203a', lineHeight: 1.5,
      }}>
        Push from LINE OA · narrowcast / multicast deep-links into any tab.
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<SelectionApp />);
