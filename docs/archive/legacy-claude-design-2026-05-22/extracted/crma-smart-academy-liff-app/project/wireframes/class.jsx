// CLASS SCHEDULE — 3 variations
// V1: Day view + Mon-Fri pills (iOS)
// V2: Week grid table (Android)
// V3: Vertical timeline with "now" marker (iOS)

function ClassV1() {
  const today = [
    { t: '07:00', dur: 60, code: 'PE201', th: 'พลศึกษา', en: 'PE Training', room: 'Field A', tone: W.crimson },
    { t: '08:30', dur: 90, code: 'MA201', th: 'แคลคูลัส II', en: 'Calculus II', room: 'Rm 304', tone: W.ink },
    { t: '10:30', dur: 90, code: 'CS210', th: 'การเขียนโปรแกรม', en: 'Programming', room: 'Lab 2', tone: W.ink },
    { t: '13:00', dur: 90, code: 'MS220', th: 'ยุทธวิธี I', en: 'Tactics I', room: 'Rm 201', tone: W.crimson },
    { t: '15:00', dur: 60, code: 'EN201', th: 'อังกฤษ II', en: 'English II', room: 'Rm 110', tone: W.ink },
  ];
  return (
    <Phone variant="ios">
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <AppBar back th="ตารางเรียน" en="Class Schedule" right={
          <div style={{ font: '500 9px "Space Grotesk"', color: W.ink2, border: `1px solid ${W.rule}`, padding: '4px 6px', borderRadius: 6 }}>2/25 ▾</div>
        } />
        {/* Day pills */}
        <div style={{ display: 'flex', padding: '10px 12px', gap: 4, borderBottom: `1px solid ${W.rule}`, background: W.paper }}>
          {[
            { d: 'จ', e: 'MON', date: '20' },
            { d: 'อ', e: 'TUE', date: '21', a: true },
            { d: 'พ', e: 'WED', date: '22' },
            { d: 'พฤ', e: 'THU', date: '23' },
            { d: 'ศ', e: 'FRI', date: '24' },
          ].map(d => (
            <div key={d.e} style={{
              flex: 1, padding: '6px 0', textAlign: 'center', borderRadius: 6,
              background: d.a ? W.ink : 'transparent',
              color: d.a ? W.paper : W.ink2,
            }}>
              <div style={{ font: '500 9px "Space Grotesk"' }}>{d.e}</div>
              <div style={{ font: '700 15px "Space Grotesk"' }}>{d.date}</div>
            </div>
          ))}
        </div>
        {/* Day list */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px 12px' }}>
          {today.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, paddingTop: 2 }}>
                <div style={{ font: '700 11px "Space Grotesk"', color: W.ink }}>{c.t}</div>
                <div style={{ font: '400 8px "Space Grotesk"', color: W.gray2 }}>{c.dur}m</div>
              </div>
              <div style={{ width: 3, alignSelf: 'stretch', background: c.tone, borderRadius: 1 }} />
              <div style={{ flex: 1, padding: '8px 10px', background: W.shade, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <L th={c.th} en={`${c.code} · ${c.en}`} size={11} weight={600} />
                </div>
                <div style={{ font: '500 9px "Space Grotesk"', color: W.gray2, marginTop: 4 }}>📍 {c.room}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

function ClassV2() {
  // Week grid
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const blocks = [
    { d: 0, s: 0, h: 2, c: 'MA', tone: W.ink },
    { d: 0, s: 2, h: 2, c: 'CS', tone: W.ink2 },
    { d: 1, s: 0, h: 1, c: 'PE', tone: W.crimson },
    { d: 1, s: 1, h: 2, c: 'MS', tone: W.crimson },
    { d: 2, s: 2, h: 2, c: 'EN', tone: W.gold },
    { d: 3, s: 0, h: 2, c: 'MA', tone: W.ink },
    { d: 3, s: 3, h: 1, c: 'PE', tone: W.crimson },
    { d: 4, s: 1, h: 2, c: 'CS', tone: W.ink2 },
    { d: 4, s: 3, h: 1, c: 'EN', tone: W.gold },
  ];
  const hours = ['08', '10', '13', '15'];
  const cellH = 32, cellW = 36;
  return (
    <Phone variant="android">
      <div style={{ height: '100%', overflow: 'auto', background: '#f6f3ec' }}>
        <AppBar back th="ตารางสัปดาห์" en="Weekly Grid" />
        {/* Term row */}
        <div style={{ padding: '10px 14px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <L th="ภาคเรียน 2/2568" en="Sem 2 · 2025" size={11} weight={700} />
            <div style={{ font: '400 9px "Space Grotesk"', color: W.gray2 }}>Week 14 · 20–24 May</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <Chip>‹</Chip><Chip active color={W.ink}>WK</Chip><Chip>›</Chip>
          </div>
        </div>

        {/* Grid */}
        <div style={{ padding: '4px 12px 0', display: 'flex' }}>
          {/* hour column */}
          <div style={{ width: 24 }}>
            <div style={{ height: 22 }} />
            {hours.map(h => (
              <div key={h} style={{ height: cellH * 2 - 4, font: '500 8px "Space Grotesk"', color: W.gray2, paddingTop: 2 }}>{h}</div>
            ))}
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            {/* day headers */}
            <div style={{ display: 'flex', height: 22 }}>
              {days.map((d, i) => (
                <div key={d} style={{ flex: 1, font: '600 9px "Space Grotesk"', color: i === 1 ? W.crimson : W.gray2, textAlign: 'center' }}>
                  {d}
                </div>
              ))}
            </div>
            {/* grid lines */}
            <div style={{ position: 'relative', height: cellH * 8 }}>
              {[1, 2, 3, 4, 5, 6, 7].map(r => (
                <div key={r} style={{ position: 'absolute', top: r * cellH, left: 0, right: 0, borderTop: `1px dashed ${W.rule}` }} />
              ))}
              {[1, 2, 3, 4].map(c => (
                <div key={c} style={{ position: 'absolute', top: 0, bottom: 0, left: `${c * 20}%`, borderLeft: `1px solid ${W.rule}`, opacity: .5 }} />
              ))}
              {/* blocks */}
              {blocks.map((b, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  left: `${b.d * 20 + 1}%`,
                  width: '18%',
                  top: b.s * cellH + 2,
                  height: b.h * cellH - 4,
                  background: b.tone, color: W.paper,
                  borderRadius: 4, padding: '4px 5px',
                  font: '700 9px "Space Grotesk"',
                }}>
                  {b.c}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 14px 0', display: 'flex', gap: 8 }}>
          {[
            ['Academic', W.ink],
            ['Military', W.crimson],
            ['Other', W.gold],
          ].map(([n, c]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, background: c, borderRadius: 2 }} />
              <span style={{ font: '500 9px "Space Grotesk"', color: W.gray2 }}>{n}</span>
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

function ClassV3() {
  // Timeline w/ now marker
  const stream = [
    { t: '07:00', th: 'พลศึกษา', en: 'PE Training', done: true, tone: W.crimson },
    { t: '08:30', th: 'แคลคูลัส II', en: 'Calculus II', done: true, tone: W.ink },
    { t: '10:30', th: 'การเขียนโปรแกรม', en: 'Programming · CS210', now: true, tone: W.ink },
    { t: '13:00', th: 'ยุทธวิธี I', en: 'Tactics I', tone: W.crimson },
    { t: '15:00', th: 'อังกฤษ II', en: 'English II', tone: W.ink },
    { t: '17:00', th: 'ฝึกแถว', en: 'Drill', tone: W.crimson },
  ];
  return (
    <Phone variant="ios">
      <div style={{ height: '100%', overflow: 'auto' }}>
        <AppBar back th="วันนี้" en="Today · Tue 21" />
        <div style={{ padding: '14px 14px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <L th="กิจกรรมวันนี้" en="6 sessions · 7h" size={11} weight={700} />
          </div>
          <Chip>NOW 10:42</Chip>
        </div>
        <div style={{ padding: '8px 14px 14px', position: 'relative' }}>
          {/* center line */}
          <div style={{ position: 'absolute', left: 56, top: 0, bottom: 0, width: 1, background: W.rule }} />
          {stream.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', alignItems: 'flex-start' }}>
              <div style={{ width: 40, paddingTop: 4, textAlign: 'right' }}>
                <div style={{ font: '600 11px "Space Grotesk"', color: s.done ? W.gray2 : W.ink }}>{s.t}</div>
              </div>
              <div style={{ position: 'relative', width: 12, height: 12, marginTop: 6 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: s.now ? W.crimson : s.done ? W.bone2 : W.paper,
                  border: `2px solid ${s.now ? W.crimson : s.tone}`,
                  boxShadow: s.now ? `0 0 0 4px rgba(168,24,42,.18)` : 'none',
                }} />
              </div>
              <div style={{ flex: 1, opacity: s.done ? .5 : 1 }}>
                <L th={s.th} en={s.en} size={11} weight={s.now ? 700 : 600} />
                {s.now && (
                  <div style={{
                    marginTop: 4, padding: '6px 8px', background: '#fef0f1',
                    border: `1px solid ${W.crimson}`, borderRadius: 6,
                    font: '500 9px "Space Grotesk"', color: W.crimson,
                  }}>● LIVE · Lab 2 · ends 12:00</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <Note style={{ position: 'absolute', right: 8, top: 100, transform: 'rotate(-3deg)' }}>
          "now" marker pulses
        </Note>
      </div>
    </Phone>
  );
}

Object.assign(window, { ClassV1, ClassV2, ClassV3 });
