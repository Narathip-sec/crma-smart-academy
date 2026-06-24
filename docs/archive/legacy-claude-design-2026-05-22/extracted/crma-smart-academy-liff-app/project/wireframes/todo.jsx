// TO-DO — 3 variations
// V1: List with categories + due dates (iOS)
// V2: Kanban swimlanes — Academic / Military / Personal (Android)
// V3: "Daily Orders" military checklist (iOS)

function TodoV1() {
  const items = [
    { th: 'ส่งการบ้าน MA201', en: 'Submit MA201 HW', cat: 'ACAD', due: 'Today 23:59', done: false, color: W.ink, urgent: true },
    { th: 'อ่าน Tactics ch.4', en: 'Read Tactics ch.4', cat: 'MIL', due: 'Tomorrow', done: false, color: W.crimson },
    { th: 'ตัดผม', en: 'Haircut', cat: 'PERS', due: 'Fri', done: false, color: W.gold },
    { th: 'ฟิตเนส 6km run', en: '6km run', cat: 'MIL', due: 'Daily', done: true, color: W.crimson },
    { th: 'อ่าน CS book', en: 'Read CS book', cat: 'ACAD', due: 'This week', done: false, color: W.ink },
    { th: 'ติดต่อแม่', en: 'Call mom', cat: 'PERS', due: 'Sun', done: false, color: W.gold },
  ];
  return (
    <Phone variant="ios" activeTab={2}>
      <div style={{ height: '100%', overflow: 'auto' }}>
        <AppBar th="งานของฉัน" en="To-do" right={<Chip>+</Chip>} />
        {/* Hero stats */}
        <div style={{ padding: '12px 14px 0', display: 'flex', gap: 8 }}>
          {[['12', 'open', W.crimson], ['3', 'today', W.gold], ['18', 'done', '#3a8b5e']].map(([n, l, c]) => (
            <div key={l} style={{ flex: 1, padding: '8px 10px', background: W.shade, borderRadius: 8 }}>
              <div style={{ font: '700 20px "Space Grotesk"', color: c }}>{n}</div>
              <div style={{ font: '500 9px "Space Grotesk"', color: W.gray2, letterSpacing: '.1em' }}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>
        {/* Filters */}
        <div style={{ padding: '12px 14px 0', display: 'flex', gap: 4, overflow: 'hidden' }}>
          <Chip active color={W.ink}>All</Chip>
          <Chip>Academic</Chip>
          <Chip>Military</Chip>
          <Chip>Personal</Chip>
        </div>
        {/* List */}
        <div style={{ padding: '8px 14px 14px' }}>
          {items.map((it, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
              borderBottom: i < items.length - 1 ? `1px solid ${W.rule}` : 'none',
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 4,
                border: `1.5px solid ${it.done ? '#3a8b5e' : W.rule}`,
                background: it.done ? '#3a8b5e' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: W.paper, font: '700 11px sans-serif',
              }}>{it.done && '✓'}</div>
              <div style={{ flex: 1, opacity: it.done ? .5 : 1 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ font: '600 10px Sarabun', color: W.ink, textDecoration: it.done ? 'line-through' : 'none' }}>{it.th}</span>
                  {it.urgent && <Chip active color={W.crimson} style={{ padding: '1px 6px', fontSize: 7 }}>!</Chip>}
                </div>
                <div style={{ font: '400 8px "Space Grotesk"', color: W.gray2 }}>{it.en}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ font: '600 9px "Space Grotesk"', color: it.color, letterSpacing: '.08em' }}>{it.cat}</div>
                <div style={{ font: '400 8px "Space Grotesk"', color: it.urgent ? W.crimson : W.gray2 }}>{it.due}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

function TodoV2() {
  // Kanban swimlanes
  const lanes = [
    { name: 'Academic', th: 'วิชาการ', c: W.ink, items: ['MA201 HW', 'CS book ch.7', 'EN essay'] },
    { name: 'Military', th: 'ทหาร', c: W.crimson, items: ['Tactics ch.4', '6km run', 'Inspect kit'] },
    { name: 'Personal', th: 'ส่วนตัว', c: W.gold, items: ['Haircut', 'Call mom', 'Pay phone'] },
  ];
  return (
    <Phone variant="android" activeTab={2}>
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#f6f3ec' }}>
        <AppBar th="กระดานงาน" en="Boards" right={<Chip>+</Chip>} />
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '12px 0 12px 12px', display: 'flex', gap: 10 }}>
          {lanes.map((lane, li) => (
            <div key={lane.name} style={{
              flex: '0 0 200px', background: W.paper, borderRadius: 10,
              border: `1px solid ${W.rule}`, padding: 10, display: 'flex', flexDirection: 'column', gap: 6,
              borderTop: `4px solid ${lane.c}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <L th={lane.th} en={lane.name} size={11} weight={700} />
                <span style={{ font: '700 11px "Space Grotesk"', color: lane.c }}>{lane.items.length}</span>
              </div>
              {lane.items.map((it, i) => (
                <div key={it} style={{
                  padding: '8px 10px', background: W.shade, borderRadius: 6,
                  font: '500 10px Sarabun', color: W.ink,
                  borderLeft: `3px solid ${lane.c}`,
                }}>
                  {it}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <span style={{ font: '400 8px "Space Grotesk"', color: W.gray2 }}>due {i === 0 ? 'today' : 'this wk'}</span>
                    {i === 0 && <Chip active color={W.crimson} style={{ padding: '1px 4px', fontSize: 6 }}>!</Chip>}
                  </div>
                </div>
              ))}
              <div style={{
                marginTop: 'auto', padding: '6px 8px', border: `1px dashed ${W.rule}`,
                borderRadius: 6, textAlign: 'center', font: '500 9px "Space Grotesk"', color: W.gray2,
              }}>+ ADD</div>
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

function TodoV3() {
  // Daily Orders — military checklist, time-blocked
  const orders = [
    { t: '05:30', th: 'ตื่นนอน · จัดที่นอน', done: true },
    { t: '06:00', th: 'PT · 6km run', done: true },
    { t: '07:00', th: 'อาหารเช้า · 600 kcal', done: true },
    { t: '08:00', th: 'แต่งกาย · เครื่องแบบ A', done: false, now: true },
    { t: '08:30', th: 'เข้าเรียน MA201', done: false },
    { t: '12:00', th: 'อาหารกลางวัน', done: false },
    { t: '13:00', th: 'ส่ง MA201 HW', done: false, flag: 'ACAD' },
    { t: '18:00', th: 'ฝึกแถว', done: false, flag: 'MIL' },
    { t: '21:30', th: 'อ่าน Tactics ch.4', done: false, flag: 'MIL' },
    { t: '22:00', th: 'นอน', done: false },
  ];
  return (
    <Phone variant="ios" activeTab={2}>
      <div style={{ height: '100%', overflow: 'auto', background: '#fbf9f1' }}>
        {/* Order header — telegram style */}
        <div style={{ padding: '12px 14px 10px', borderBottom: `2px solid ${W.ink}`, background: W.paper }}>
          <div style={{ font: '700 8px "Space Grotesk"', color: W.crimson, letterSpacing: '.25em' }}>⬢ DAILY ORDER · D+147</div>
          <div style={{ font: '700 14px Sarabun', color: W.ink, marginTop: 2 }}>คำสั่งประจำวัน</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', font: '500 9px "Space Grotesk"', color: W.gray2, marginTop: 6 }}>
            <span>TUE · 21 MAY 2026</span>
            <span>3/10 COMPLETE</span>
          </div>
          <div style={{ height: 4, background: W.bone, borderRadius: 2, marginTop: 4 }}>
            <div style={{ width: '30%', height: '100%', background: W.crimson, borderRadius: 2 }} />
          </div>
        </div>
        {/* Stamped list */}
        <div style={{ padding: '8px 14px 14px' }}>
          {orders.map((o, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
              borderBottom: `1px dashed ${W.rule}`,
              opacity: o.done ? .5 : 1,
            }}>
              <span style={{ font: '700 10px "Space Grotesk"', color: o.now ? W.crimson : W.ink, width: 38 }}>{o.t}</span>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{
                  font: `${o.now ? 700 : 500} 11px Sarabun`,
                  color: W.ink,
                  textDecoration: o.done ? 'line-through' : 'none',
                }}>{o.th}</span>
                {o.now && (
                  <div style={{ position: 'absolute', right: 0, top: -2, font: '700 7px "Space Grotesk"', color: W.crimson, letterSpacing: '.15em' }}>● NOW</div>
                )}
              </div>
              {o.flag && (
                <Chip active color={o.flag === 'MIL' ? W.crimson : W.ink} style={{ padding: '1px 5px', fontSize: 7 }}>
                  {o.flag}
                </Chip>
              )}
              <div style={{
                width: 14, height: 14, borderRadius: 2,
                border: `1px solid ${o.done ? '#3a8b5e' : W.ink}`,
                background: o.done ? '#3a8b5e' : 'transparent',
                color: W.paper, font: '700 9px sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{o.done && '✓'}</div>
            </div>
          ))}
        </div>
        <Note style={{ position: 'absolute', right: 6, top: 130, transform: 'rotate(3deg)' }}>
          stamped paper feel
        </Note>
      </div>
    </Phone>
  );
}

Object.assign(window, { TodoV1, TodoV2, TodoV3 });
