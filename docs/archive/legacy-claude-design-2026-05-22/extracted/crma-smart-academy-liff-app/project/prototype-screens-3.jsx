// prototype-screens-3.jsx — Calendar, Todo, Activity, Service

// ============================================================================
// CALENDAR — interactive month grid
// ============================================================================
function CalendarScreen({ nav }) {
  const [selected, setSelected] = React.useState(21);
  const cells = [];
  for (let i = 0; i < 35; i++) {
    const d = i - 4;
    cells.push({ d: d >= 1 && d <= 31 ? d : '', dayOfWeek: i % 7 });
  }
  const dots = {
    5: ['#3a8b5e'], 7: [W.crimson, W.ink], 10: [W.gold], 14: [W.ink],
    18: ['#3a8b5e'], 21: [W.crimson, W.gold, W.ink], 24: [W.crimson], 27: [W.ink], 30: [W.gold],
  };
  const events = {
    5: [{ c: '#3a8b5e', t: '17:00', th: 'CRMA Run · ซ้อม', en: 'Training' }],
    7: [{ c: W.crimson, t: '06:00', th: 'พลศึกษา', en: 'PE' }, { c: W.ink, t: '14:00', th: 'สอบกลางภาค CS', en: 'Midterm' }],
    21: [
      { c: W.crimson, t: '06:00', th: 'พลศึกษา', en: 'PE Training' },
      { c: W.gold, t: '13:00', th: 'พิธีสวนสนาม', en: 'Parade' },
      { c: W.ink, t: '15:00', th: 'สอบกลางภาค EN201', en: 'Midterm' },
    ],
  };
  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <AppBar th="ปฏิทินวิชาการ" en="Academic Calendar" right={<Chip active color={W.ink}>Month</Chip>} />
      <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <L th="พฤษภาคม 2569" en="May 2026" size={13} weight={700} />
        <div style={{ display: 'flex', gap: 4 }}>
          <Chip>‹</Chip><Chip>›</Chip>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 8px', font: '500 8px "Space Grotesk"', color: W.gray2, letterSpacing: '.1em' }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', padding: 4, color: i === 0 || i === 6 ? W.crimson : W.gray2 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 8px' }}>
        {cells.map((c, i) => (
          <div
            key={i}
            onClick={() => c.d && setSelected(c.d)}
            style={{
              aspectRatio: '1/1.05', padding: '4px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'flex-start',
              borderBottom: `1px solid ${W.rule}`,
              opacity: c.d === '' ? .25 : 1,
              cursor: c.d ? 'pointer' : 'default',
              overflow: 'hidden',
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: c.d === selected ? W.crimson : 'transparent',
              color: c.d === selected ? W.paper : W.ink,
              font: '600 11px "Space Grotesk"',
              flexShrink: 0,
            }}>{c.d}</div>
            <div style={{
              display: 'flex', gap: 2, marginTop: 2,
              height: 4, flexShrink: 0, alignItems: 'center',
            }}>
              {(dots[c.d] || []).slice(0, 3).map((col, j) => (
                <div key={j} style={{ width: 4, height: 4, borderRadius: '50%', background: col }} />
              ))}
              {(dots[c.d] || []).length > 3 && (
                <div style={{ font: '700 6px "Space Grotesk"', color: W.gray2, marginLeft: 1 }}>+</div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '10px 14px 14px', borderTop: `1px solid ${W.rule}` }}>
        <div style={{ font: '700 8px "Space Grotesk"', color: W.crimson, letterSpacing: '.15em' }}>
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][(selected + 3) % 7]} · {selected} MAY
        </div>
        {(events[selected] || []).length === 0 ? (
          <div style={{ padding: 14, textAlign: 'center', font: '400 10px Sarabun', color: W.gray2 }}>
            {tx({ th: 'ไม่มีกิจกรรม', en: 'No events' })}
          </div>
        ) : (
          (events[selected] || []).map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0' }}>
              <div style={{ width: 3, alignSelf: 'stretch', background: e.c, borderRadius: 1, minHeight: 22 }} />
              <span style={{ font: '500 10px "Space Grotesk"', color: W.gray2, width: 40 }}>{e.t}</span>
              <div style={{ flex: 1 }}>
                <div style={{ font: '600 11px Sarabun', color: W.ink }}>{tx(e)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TO-DO — categorized list, tappable checkboxes + filter chips
// ============================================================================
function TodoScreen({ nav }) {
  const [items, setItems] = React.useState([
    { th: 'ส่งการบ้าน MA201', en: 'Submit MA201 HW', cat: 'ACAD', due: 'Today 23:59', done: false, urgent: true },
    { th: 'อ่าน Tactics ch.4', en: 'Read Tactics ch.4', cat: 'MIL', due: 'Tomorrow', done: false },
    { th: 'ตัดผม', en: 'Haircut', cat: 'PERS', due: 'Fri', done: false },
    { th: 'ฟิตเนส 6km run', en: '6km run', cat: 'MIL', due: 'Daily', done: true },
    { th: 'อ่าน CS book', en: 'Read CS book', cat: 'ACAD', due: 'This week', done: false },
    { th: 'ติดต่อแม่', en: 'Call mom', cat: 'PERS', due: 'Sun', done: false },
  ]);
  const [filter, setFilter] = React.useState('All');
  const filtered = filter === 'All' ? items : items.filter(it => it.cat === { Academic: 'ACAD', Military: 'MIL', Personal: 'PERS' }[filter]);
  const colors = { ACAD: W.ink, MIL: W.crimson, PERS: W.gold };

  const open = items.filter(it => !it.done).length;
  const today = items.filter(it => !it.done && it.due.toLowerCase().includes('today')).length;
  const done = items.filter(it => it.done).length;

  const toggle = (i) => setItems(arr => arr.map((it, j) => j === i ? { ...it, done: !it.done } : it));

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <AppBar th="งานของฉัน" en="To-do-list" right={<Chip>+</Chip>} />
      <div style={{ padding: '12px 14px 0', display: 'flex', gap: 8 }}>
        {[[open, 'open', W.crimson], [today, 'today', W.gold], [done, 'done', '#3a8b5e']].map(([n, l, c]) => (
          <div key={l} style={{ flex: 1, padding: '8px 10px', background: W.shade, borderRadius: 8 }}>
            <div style={{ font: '700 20px "Space Grotesk"', color: c }}>{n}</div>
            <div style={{ font: '500 9px "Space Grotesk"', color: W.gray2, letterSpacing: '.1em' }}>{l.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 14px 0', display: 'flex', gap: 4, overflow: 'hidden' }}>
        {[
          { key: 'All', en: 'All', th: 'ทั้งหมด' },
          { key: 'Academic', en: 'Academic', th: 'วิชาการ' },
          { key: 'Military', en: 'Military', th: 'ทหาร' },
          { key: 'Personal', en: 'Personal', th: 'ส่วนตัว' },
        ].map(f => (
          <div key={f.key} onClick={() => setFilter(f.key)} style={{ cursor: 'pointer' }}>
            <Chip active={filter === f.key} color={W.ink}>{tx(f)}</Chip>
          </div>
        ))}
      </div>
      <div style={{ padding: '8px 14px 14px' }}>
        {filtered.map((it, i) => {
          const idx = items.indexOf(it);
          return (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
              borderBottom: i < filtered.length - 1 ? `1px solid ${W.rule}` : 'none',
            }}>
              <div
                onClick={() => toggle(idx)}
                style={{
                  width: 18, height: 18, borderRadius: 4,
                  border: `1.5px solid ${it.done ? '#3a8b5e' : W.rule}`,
                  background: it.done ? '#3a8b5e' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: W.paper, font: '700 11px sans-serif', cursor: 'pointer',
                  flexShrink: 0,
                }}
              >{it.done && '✓'}</div>
              <div style={{ flex: 1, opacity: it.done ? .5 : 1 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ font: '600 11px Sarabun', color: W.ink, textDecoration: it.done ? 'line-through' : 'none' }}>{tx(it)}</span>
                  {it.urgent && !it.done && <span style={{ background: W.crimson, color: '#fff', padding: '1px 5px', borderRadius: 999, font: '700 7px "Space Grotesk"' }}>!</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ font: '600 9px "Space Grotesk"', color: colors[it.cat], letterSpacing: '.08em' }}>{it.cat}</div>
                <div style={{ font: '400 8px "Space Grotesk"', color: it.urgent && !it.done ? W.crimson : W.gray2 }}>{it.due}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// ACTIVITY — featured + grid (Meetup-style)
// ============================================================================
function ActivityScreen({ nav }) {
  return (
    <div style={{ height: '100%', overflow: 'auto', position: 'relative' }}>
      <AppBar th="กิจกรรม" en="Activities" right={<Chip>filter</Chip>} />
      <div style={{ padding: '12px 0 0 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingRight: 14 }}>
          <L th="แนะนำ" en="Featured" size={11} weight={700} />
          <span style={{ font: '500 9px "Space Grotesk"', color: W.gray2 }}>{tx({ th: 'ทั้งหมด', en: 'see all' })} ›</span>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', overflowY: 'hidden', marginTop: 8, paddingRight: 14 }}>
          {[
            { en: 'CRMA Run 2026', th: 'วิ่ง CRMA 10K', cap: '12/40', tone: W.crimson },
            { en: 'Robotics Club', th: 'ชมรมหุ่นยนต์', cap: '8/20', tone: W.ink },
            { en: 'Volunteer · Library', th: 'อาสาห้องสมุด', cap: '3/10', tone: '#3a8b5e' },
          ].map((c, i) => (
            <div key={i} style={{
              flex: '0 0 200px', borderRadius: 10, overflow: 'hidden',
              border: `1px solid ${W.rule}`, background: W.paper,
            }}>
              <Img w="100%" h={96} />
              <div style={{ padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <L th={c.th} en={c.en} size={11} weight={700} />
                  <Chip active color={c.tone}>{c.cap}</Chip>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <span style={{ font: '500 8px "Space Grotesk"', color: W.gray2 }}>🕒 {tx({ th: 'เสาร์ 7 น.', en: 'Sat 7am' })}</span>
                  <span style={{ font: '500 8px "Space Grotesk"', color: W.gray2 }}>📍 {tx({ th: 'สนาม A', en: 'Field A' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 14px 0', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <Chip active color={W.ink}>{tx({ th: 'ทั้งหมด', en: 'All' })}</Chip>
        <Chip>{tx({ th: 'กีฬา', en: 'Sport' })}</Chip>
        <Chip>{tx({ th: 'วิชาการ', en: 'Academic' })}</Chip>
        <Chip>{tx({ th: 'สังคม', en: 'Social' })}</Chip>
        <Chip>{tx({ th: 'อาสา', en: 'Volunteer' })}</Chip>
      </div>

      <div style={{ padding: '10px 14px 80px' }}>
        {[
          { th: 'อบรมปฐมพยาบาล', en: 'First Aid Workshop', t: 'Wed 16:00', cap: '6/15', tone: '#3a8b5e' },
          { th: 'อ่านหนังสือกลุ่ม', en: 'Study Group · MA201', t: 'Thu 19:00', cap: '4/8', tone: W.ink },
          { th: 'ฟุตซอลคืนวันศุกร์', en: 'Friday Futsal', t: 'Fri 19:30', cap: '10/10', full: true, tone: W.crimson },
          { th: 'ค่ายอาสา', en: 'Volunteer Camp', t: 'Sat 06:00', cap: '14/30', tone: '#3a8b5e' },
        ].map((e, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10, padding: '10px 0',
            borderBottom: i < 3 ? `1px solid ${W.rule}` : 'none',
          }}>
            <Img w={56} h={56} />
            <div style={{ flex: 1 }}>
              <L th={e.th} en={e.en} size={11} weight={700} />
              <div style={{ font: '500 8px "Space Grotesk"', color: W.gray2, marginTop: 4 }}>🕒 {e.t}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Chip active color={e.full ? W.gray2 : e.tone}>{e.full ? tx({ th: 'เต็ม', en: 'FULL' }) : e.cap}</Chip>
              <div style={{ font: '500 8px "Space Grotesk"', color: W.gray2, marginTop: 4 }}>RSVP</div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB — positioned above bottom nav */}
      <div style={{
        position: 'absolute', right: 14, bottom: 14,
        width: 48, height: 48, borderRadius: '50%', background: W.crimson, color: W.paper,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        font: '300 26px "Space Grotesk"',
        boxShadow: '0 6px 16px rgba(168,24,42,.35)',
        cursor: 'pointer',
      }}>+</div>
    </div>
  );
}

// ============================================================================
// SERVICE — tile grid; some tiles navigate to known screens
// ============================================================================
function ServiceScreen({ nav }) {
  const services = [
    { th: 'เกรด', en: 'Grades', e: '🎓', route: 'profile' },
    { th: 'E-Book', en: 'E-Book', e: '📚' },
    { th: 'ห้องสมุด', en: 'Library', e: '🏛' },
    { th: 'AI โค้ช', en: 'AI Coach', e: '🤖', route: 'health' },
    { th: 'AI Q&A', en: 'AI Q&A', e: '💬' },
    { th: 'ประวัติ รร.', en: 'History', e: '⚔' },
    { th: 'ปรัชญา', en: 'Philosophy', e: '☉' },
    { th: 'ผู้บังคับ', en: 'Commanders', e: '★' },
    { th: 'CRMA Library', en: 'CRMA Lib', e: '📖' },
    { th: 'รร.ทหาร', en: 'Mil Academy', e: '🛡' },
    { th: 'แผนที่', en: 'Map', e: '🗺' },
    { th: 'ติดต่อ', en: 'Contact', e: '☏' },
  ];
  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <AppBar th="บริการ" en="Services" right={<Chip>🔍</Chip>} />
      <div style={{ padding: '10px 14px 0' }}>
        <div style={{
          padding: '8px 12px', borderRadius: 10, background: W.shade,
          font: '400 10px Sarabun', color: W.gray2,
        }}>🔍 {tx({ th: 'ค้นหาบริการ', en: 'Search services' })}</div>
      </div>
      <div style={{ padding: '14px 14px 0' }}>
        <L th="ใช้บ่อย" en="Frequent" size={10} weight={700} style={{ marginBottom: 6 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {services.slice(0, 4).map((s, i) => (
            <div
              key={i}
              onClick={() => s.route && nav.push(s.route)}
              style={{
                flex: 1, padding: 8, background: W.paper, border: `1px solid ${W.rule}`, borderRadius: 10,
                textAlign: 'center', cursor: s.route ? 'pointer' : 'default',
              }}
            >
              <div style={{ font: '500 18px sans-serif' }}>{s.e}</div>
              <div style={{ font: '500 9px Sarabun', color: W.ink, marginTop: 2 }}>{tx(s)}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '14px 14px 14px' }}>
        <L th="ทั้งหมด" en="All Services" size={10} weight={700} style={{ marginBottom: 6 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {services.slice(4).map((s, i) => (
            <div
              key={i}
              onClick={() => s.route && nav.push(s.route)}
              style={{
                padding: '10px 6px', background: W.paper, border: `1px solid ${W.rule}`, borderRadius: 10,
                textAlign: 'center', cursor: s.route ? 'pointer' : 'default',
              }}
            >
              <div style={{ font: '500 18px sans-serif' }}>{s.e}</div>
              <div style={{ font: '500 9px Sarabun', color: W.ink, marginTop: 2 }}>{tx(s)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CalendarScreen, TodoScreen, ActivityScreen, ServiceScreen });
