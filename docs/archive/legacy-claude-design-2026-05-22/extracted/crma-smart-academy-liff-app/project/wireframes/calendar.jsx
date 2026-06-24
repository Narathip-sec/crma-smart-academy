// CALENDAR — 3 variations
// V1: Month grid with dot markers (iOS)
// V2: Agenda timeline (Android)
// V3: Academic year bands — terms / breaks / exams as horizontal bands (iOS)

function CalV1() {
  // Generate a month of cells
  const cells = [];
  for (let i = 0; i < 35; i++) {
    const d = i - 4; // pad start (Wed first)
    const inMonth = d >= 1 && d <= 31;
    cells.push({ d: inMonth ? d : '', today: d === 21 });
  }
  // event dots per day
  const dots = {
    5: ['#3a8b5e'],
    7: [W.crimson, W.ink],
    10: [W.gold],
    14: [W.ink],
    18: ['#3a8b5e'],
    21: [W.crimson, W.gold, W.ink],
    24: [W.crimson],
    27: [W.ink],
    30: [W.gold],
  };
  return (
    <Phone variant="ios" activeTab={1}>
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <AppBar th="ปฏิทินวิชาการ" en="Academic Calendar" right={<Chip active color={W.ink}>Month</Chip>} />
        {/* Month header */}
        <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <L th="พฤษภาคม 2569" en="May 2026" size={13} weight={700} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <Chip>‹</Chip><Chip>›</Chip>
          </div>
        </div>
        {/* Weekday */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 8px', font: '500 8px "Space Grotesk"', color: W.gray2, letterSpacing: '.1em' }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', padding: 4, color: i === 0 || i === 6 ? W.crimson : W.gray2 }}>{d}</div>
          ))}
        </div>
        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 8px' }}>
          {cells.map((c, i) => (
            <div key={i} style={{
              aspectRatio: '1/1.05',
              padding: '4px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              borderBottom: `1px solid ${W.rule}`, opacity: c.d === '' ? .25 : 1,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: c.today ? W.crimson : 'transparent',
                color: c.today ? W.paper : W.ink,
                font: '600 11px "Space Grotesk"',
              }}>{c.d}</div>
              <div style={{ display: 'flex', gap: 2, marginTop: 2, height: 4 }}>
                {(dots[c.d] || []).map((c2, j) => (
                  <div key={j} style={{ width: 4, height: 4, borderRadius: '50%', background: c2 }} />
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Selected day list */}
        <div style={{ padding: '10px 14px 12px', borderTop: `1px solid ${W.rule}` }}>
          <div style={{ font: '700 8px "Space Grotesk"', color: W.crimson, letterSpacing: '.15em' }}>TUE 21 MAY</div>
          {[
            { c: W.crimson, t: '06:00', th: 'พลศึกษา' },
            { c: W.gold,    t: '13:00', th: 'พิธีสวนสนาม' },
            { c: W.ink,     t: '15:00', th: 'สอบกลางภาค EN201' },
          ].map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0' }}>
              <div style={{ width: 3, alignSelf: 'stretch', background: e.c, borderRadius: 1, minHeight: 16 }} />
              <span style={{ font: '500 9px "Space Grotesk"', color: W.gray2, width: 36 }}>{e.t}</span>
              <span style={{ font: '500 10px Sarabun', color: W.ink, flex: 1 }}>{e.th}</span>
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

function CalV2() {
  // Agenda — grouped by day
  const days = [
    { d: 'TUE 21', th: 'วันนี้', sub: 'Today', events: [
      { c: W.crimson, t: '06:00', th: 'พลศึกษา', en: 'PE Training' },
      { c: W.gold,    t: '13:00', th: 'พิธีสวนสนาม', en: 'Parade' },
      { c: W.ink,     t: '15:00', th: 'สอบ EN201', en: 'Exam' },
    ]},
    { d: 'WED 22', th: 'พรุ่งนี้', sub: 'Tomorrow', events: [
      { c: W.ink,     t: '08:30', th: 'แคลคูลัส II', en: 'Calculus' },
      { c: '#3a8b5e', t: '17:00', th: 'CRMA Run', en: 'Activity' },
    ]},
    { d: 'THU 23', th: '23 พ.ค.', sub: '', events: [
      { c: W.crimson, t: '07:00', th: 'ฝึกแถว', en: 'Drill' },
    ]},
    { d: 'FRI 24', th: '24 พ.ค.', sub: '', events: [
      { c: W.ink,     t: '10:00', th: 'ส่งการบ้าน CS', en: 'Submit' },
      { c: W.gold,    t: '18:00', th: 'ค่ายประจำสัปดาห์', en: 'Camp' },
    ]},
  ];
  return (
    <Phone variant="android" activeTab={1}>
      <div style={{ height: '100%', overflow: 'auto', background: '#f6f3ec' }}>
        <AppBar th="ตารางงาน" en="Agenda" right={<Chip>+</Chip>} />
        {/* date strip */}
        <div style={{ display: 'flex', gap: 4, padding: '10px 12px', overflow: 'hidden' }}>
          {['21', '22', '23', '24', '25', '26', '27'].map((d, i) => (
            <div key={d} style={{
              flex: 1, padding: '6px 0', textAlign: 'center', borderRadius: 6,
              background: i === 0 ? W.crimson : 'transparent',
              border: i === 0 ? 'none' : `1px solid ${W.rule}`,
              color: i === 0 ? W.paper : W.ink2,
            }}>
              <div style={{ font: '500 7px "Space Grotesk"' }}>MAY</div>
              <div style={{ font: '700 13px "Space Grotesk"' }}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '0 12px 14px' }}>
          {days.map((dy, di) => (
            <div key={dy.d}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, padding: '10px 0 6px' }}>
                <span style={{ font: '700 12px Sarabun', color: W.ink }}>{dy.th}</span>
                {dy.sub && <span style={{ font: '400 9px "Space Grotesk"', color: W.gray2 }}>{dy.sub}</span>}
                <Line w="auto" style={{ flex: 1 }} />
                <span style={{ font: '500 9px "Space Grotesk"', color: W.gray2 }}>{dy.d}</span>
              </div>
              {dy.events.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 8px', background: W.paper, border: `1px solid ${W.rule}`, borderRadius: 8, marginBottom: 4 }}>
                  <div style={{ width: 3, alignSelf: 'stretch', background: e.c, borderRadius: 1 }} />
                  <span style={{ font: '600 10px "Space Grotesk"', color: W.ink, width: 36 }}>{e.t}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ font: '600 10px Sarabun', color: W.ink }}>{e.th}</div>
                    <div style={{ font: '400 8px "Space Grotesk"', color: W.gray2 }}>{e.en}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

function CalV3() {
  // Academic-year band view — months as columns, terms/breaks/exams as horizontal stripes
  const months = ['M', 'J', 'J', 'A', 'S', 'O', 'N', 'D', 'J', 'F', 'M', 'A'];
  const bands = [
    { name: 'Sem 1', th: 'ภาค 1', start: 1, end: 5, c: W.ink },
    { name: 'Midterm', th: 'กลางภาค', start: 2.6, end: 3.1, c: W.crimson },
    { name: 'Final', th: 'ปลายภาค', start: 4.4, end: 4.9, c: W.crimson, dark: true },
    { name: 'Break', th: 'ปิดเทอม', start: 5, end: 6, c: W.gold, faint: true },
    { name: 'Sem 2', th: 'ภาค 2', start: 6, end: 11, c: W.ink },
    { name: 'PFT', th: 'PFT', start: 1.5, end: 1.8, c: '#3a8b5e' },
    { name: 'PFT', th: 'PFT', start: 8, end: 8.3, c: '#3a8b5e' },
    { name: 'Parade', th: 'สวนสนาม', start: 7.2, end: 7.4, c: W.gold },
  ];
  return (
    <Phone variant="ios" activeTab={1}>
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <AppBar th="ปีการศึกษา" en="Academic Year 2026" right={<Chip>2026 ▾</Chip>} />
        <div style={{ padding: '12px 14px 0' }}>
          <div style={{ font: '500 8px "Space Grotesk"', color: W.gray2, letterSpacing: '.15em' }}>YEAR BAND VIEW</div>
        </div>
        {/* Band chart */}
        <div style={{ padding: '8px 14px 0', flex: 1, overflow: 'auto' }}>
          <div style={{ position: 'relative', height: 230, background: W.shade, borderRadius: 10, padding: '20px 6px 22px', overflow: 'hidden' }}>
            {/* month columns */}
            {months.map((m, i) => (
              <div key={i} style={{
                position: 'absolute', top: 4,
                left: `${(i / 12) * 100}%`, width: `${100 / 12}%`,
                textAlign: 'center', font: '600 8px "Space Grotesk"', color: W.gray2,
              }}>{m}</div>
            ))}
            {/* vertical gridlines */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => (
              <div key={i} style={{
                position: 'absolute', top: 20, bottom: 18,
                left: `${(i / 12) * 100}%`, width: 1, background: W.bone2,
              }} />
            ))}
            {/* bands */}
            {bands.map((b, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `calc(${(b.start / 12) * 100}% + 4px)`,
                width: `calc(${((b.end - b.start) / 12) * 100}% - 6px)`,
                top: i < 2 ? 26 : (i === 2 ? 26 : i === 3 ? 70 : i === 4 ? 70 : i === 5 ? 114 : i === 6 ? 114 : 158),
                height: 36,
                background: b.faint ? `${b.c}33` : (b.dark ? '#7d1019' : b.c),
                color: b.faint ? W.ink : W.paper,
                borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: '600 9px Sarabun', padding: '0 4px',
              }}>
                <span>{b.th}</span>
              </div>
            ))}
            {/* now line */}
            <div style={{ position: 'absolute', top: 20, bottom: 18, left: '0%', width: 2, background: W.crimson }} />
            <div style={{
              position: 'absolute', top: 0, left: 0,
              padding: '1px 5px', background: W.crimson, color: W.paper,
              font: '700 7px "Space Grotesk"', borderRadius: 2,
            }}>NOW</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {[['Sem', W.ink], ['Exam', W.crimson], ['Break', W.gold], ['Military', '#3a8b5e']].map(([n, c]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 6, background: c, borderRadius: 1 }} />
                <span style={{ font: '500 9px "Space Grotesk"', color: W.gray2 }}>{n}</span>
              </div>
            ))}
          </div>
        </div>
        <Note style={{ position: 'absolute', right: 6, top: 100, transform: 'rotate(-3deg)' }}>
          year at a glance, military + academic together
        </Note>
      </div>
    </Phone>
  );
}

Object.assign(window, { CalV1, CalV2, CalV3 });
