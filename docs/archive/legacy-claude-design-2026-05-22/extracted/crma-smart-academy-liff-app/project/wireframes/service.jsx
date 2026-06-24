// SERVICE — 3 variations
// V1: 3-col grid of service tiles (iOS)
// V2: Categorized list with descriptions (Android)
// V3: Command-palette / quick-switcher (iOS, dark)

const SERVICES = [
  { th: 'เกรด', en: 'Grades', e: '🎓', cat: 'ACAD' },
  { th: 'E-Book', en: 'E-Book', e: '📚', cat: 'ACAD' },
  { th: 'ห้องสมุด', en: 'Library', e: '🏛', cat: 'ACAD' },
  { th: 'AI โค้ช', en: 'AI Coach', e: '🤖', cat: 'AI' },
  { th: 'AI Q&A', en: 'AI Q&A', e: '💬', cat: 'AI' },
  { th: 'ประวัติ รร.', en: 'History', e: '⚔', cat: 'INST' },
  { th: 'ปรัชญา', en: 'Philosophy', e: '☉', cat: 'INST' },
  { th: 'ผู้บังคับ', en: 'Commanders', e: '★', cat: 'INST' },
  { th: 'CRMA Library', en: 'CRMA Lib', e: '📖', cat: 'ACAD' },
  { th: 'รร.ทหาร', en: 'Mil Academy', e: '🛡', cat: 'INST' },
  { th: 'แผนที่', en: 'Map', e: '🗺', cat: 'OTHER' },
  { th: 'ติดต่อ', en: 'Contact', e: '☏', cat: 'OTHER' },
];

function ServiceV1() {
  return (
    <Phone variant="ios" activeTab={4}>
      <div style={{ height: '100%', overflow: 'auto' }}>
        <AppBar th="บริการ" en="Services" right={<Chip>🔍</Chip>} />
        {/* Search */}
        <div style={{ padding: '10px 14px 0' }}>
          <div style={{
            padding: '8px 12px', borderRadius: 10, background: W.shade,
            font: '400 10px Sarabun', color: W.gray2,
          }}>
            🔍 ค้นหาบริการ · Search services
          </div>
        </div>
        {/* Quick row */}
        <div style={{ padding: '14px 14px 0' }}>
          <L th="ใช้บ่อย" en="Frequent" size={10} weight={700} style={{ marginBottom: 6 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {SERVICES.slice(0, 4).map((s, i) => (
              <div key={i} style={{ flex: 1, padding: 8, background: W.paper, border: `1px solid ${W.rule}`, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ font: '500 18px sans-serif' }}>{s.e}</div>
                <div style={{ font: '500 9px Sarabun', color: W.ink, marginTop: 2 }}>{s.th}</div>
              </div>
            ))}
          </div>
        </div>
        {/* All grid */}
        <div style={{ padding: '14px 14px 0' }}>
          <L th="ทั้งหมด" en="All Services" size={10} weight={700} style={{ marginBottom: 6 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {SERVICES.slice(4).map((s, i) => (
              <div key={i} style={{ padding: '10px 6px', background: W.paper, border: `1px solid ${W.rule}`, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ font: '500 18px sans-serif' }}>{s.e}</div>
                <div style={{ font: '500 9px Sarabun', color: W.ink, marginTop: 2 }}>{s.th}</div>
                <div style={{ font: '400 7px "Space Grotesk"', color: W.gray2 }}>{s.en}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 14 }} />
      </div>
    </Phone>
  );
}

function ServiceV2() {
  const groups = [
    { th: 'วิชาการ', en: 'Academic', c: W.ink, items: SERVICES.filter(s => s.cat === 'ACAD') },
    { th: 'AI', en: 'AI Tools', c: W.gold, items: SERVICES.filter(s => s.cat === 'AI') },
    { th: 'สถาบัน', en: 'Institution', c: W.crimson, items: SERVICES.filter(s => s.cat === 'INST') },
    { th: 'อื่นๆ', en: 'Other', c: W.gray2, items: SERVICES.filter(s => s.cat === 'OTHER') },
  ];
  return (
    <Phone variant="android" activeTab={4}>
      <div style={{ height: '100%', overflow: 'auto', background: '#f6f3ec' }}>
        <AppBar th="บริการของ รร.จปร." en="CRMA Services" />
        <div style={{ padding: '8px 12px 14px' }}>
          {groups.map(g => (
            <div key={g.en} style={{ marginTop: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 4px',
              }}>
                <div style={{ width: 4, height: 14, background: g.c, borderRadius: 1 }} />
                <L th={g.th} en={g.en} size={11} weight={700} />
              </div>
              <div style={{ background: W.paper, border: `1px solid ${W.rule}`, borderRadius: 10, overflow: 'hidden' }}>
                {g.items.map((s, i) => (
                  <div key={s.en} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px',
                    borderTop: i > 0 ? `1px solid ${W.rule}` : 'none',
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 7, background: W.shade,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      font: '500 16px sans-serif',
                    }}>{s.e}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ font: '600 11px Sarabun', color: W.ink }}>{s.th}</div>
                      <div style={{ font: '400 8px "Space Grotesk"', color: W.gray2 }}>{s.en} · tap to open</div>
                    </div>
                    <span style={{ color: W.gray2, font: '300 16px "Space Grotesk"' }}>›</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

function ServiceV3() {
  // Command palette — dark, search-first
  return (
    <Phone variant="ios" activeTab={4} dark>
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#0e1626', color: W.bone }}>
        <div style={{
          padding: '12px 14px 10px',
          borderBottom: '1px solid rgba(255,255,255,.08)',
        }}>
          <div style={{ font: '700 8px "Space Grotesk"', color: W.gold, letterSpacing: '.2em' }}>⌘ COMMAND</div>
          <div style={{
            marginTop: 8, padding: '8px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,.06)',
            border: '1px solid rgba(255,255,255,.12)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ font: '500 10px "Space Grotesk"', color: 'rgba(255,255,255,.5)' }}>›</span>
            <span style={{ flex: 1, font: '500 11px "Space Grotesk"', color: W.bone }}>grade</span>
            <span style={{ font: '500 8px "Space Grotesk"', color: 'rgba(255,255,255,.4)', letterSpacing: '.1em' }}>ESC</span>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '8px 6px' }}>
          {/* Section header */}
          <div style={{ padding: '6px 10px', font: '700 8px "Space Grotesk"', color: W.gold, letterSpacing: '.2em' }}>RESULTS · 3</div>
          {[
            { e: '🎓', th: 'เกรด · Grades', sub: 'View your transcript', sel: true, kbd: '↵' },
            { e: '📈', th: 'การกระจายเกรด', sub: 'Grade distribution chart' },
            { e: '🤖', th: 'AI · คำแนะนำเกรด', sub: 'Improve next semester' },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px',
              background: r.sel ? 'rgba(184,146,58,.12)' : 'transparent',
              borderLeft: r.sel ? `2px solid ${W.gold}` : '2px solid transparent',
              borderRadius: 4,
            }}>
              <div style={{ font: '500 18px sans-serif', width: 24, textAlign: 'center' }}>{r.e}</div>
              <div style={{ flex: 1 }}>
                <div style={{ font: '600 11px Sarabun', color: W.bone }}>{r.th}</div>
                <div style={{ font: '400 8px "Space Grotesk"', color: 'rgba(255,255,255,.5)' }}>{r.sub}</div>
              </div>
              {r.kbd && (
                <span style={{
                  font: '500 8px "Space Grotesk"', color: W.gold,
                  border: `1px solid ${W.gold}`, padding: '1px 5px', borderRadius: 3,
                }}>{r.kbd}</span>
              )}
            </div>
          ))}
          <div style={{ padding: '8px 10px', font: '700 8px "Space Grotesk"', color: 'rgba(255,255,255,.4)', letterSpacing: '.2em', marginTop: 4 }}>SUGGESTIONS</div>
          {[
            { e: '📚', th: 'E-Book' },
            { e: '🏛', th: 'CRMA Library' },
            { e: '⚔', th: 'History of CRMA' },
            { e: '★', th: 'ผู้บังคับบัญชา' },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 10px',
            }}>
              <div style={{ font: '500 16px sans-serif', width: 24, textAlign: 'center' }}>{r.e}</div>
              <div style={{ flex: 1, font: '500 10px Sarabun', color: 'rgba(255,255,255,.85)' }}>{r.th}</div>
              <span style={{ color: 'rgba(255,255,255,.3)', font: '300 14px "Space Grotesk"' }}>›</span>
            </div>
          ))}
        </div>

        <div style={{
          padding: '8px 14px',
          borderTop: '1px solid rgba(255,255,255,.08)',
          display: 'flex', gap: 10, font: '500 8px "Space Grotesk"', color: 'rgba(255,255,255,.5)',
        }}>
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span style={{ marginLeft: 'auto' }}>⌘K toggle</span>
        </div>

        <Note style={{ position: 'absolute', right: 8, top: 90, transform: 'rotate(-3deg)' }} color={W.gold}>
          power-user shortcut to any service
        </Note>
      </div>
    </Phone>
  );
}

Object.assign(window, { ServiceV1, ServiceV2, ServiceV3 });
