// prototype-screens.jsx — Inner screen bodies for the clickable prototype.
// Each screen accepts { nav } and renders only the screen content (no Phone wrapper).
// nav = { push(route), back(), tab(route), current, canBack }

// ============================================================================
// HOME — profile banner, hero carousel, quick services 2x2, news, world news
// ============================================================================
function HomeScreen({ nav }) {
  return (
    <div style={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Profile banner — TAPS profile route */}
      <div
        onClick={() => nav.push('profile')}
        style={{
          margin: '8px 12px 0', padding: 12, borderRadius: 10,
          background: W.shade, border: `1px solid ${W.rule}`,
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: '50%', background: W.bone2,
          border: `1px solid ${W.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          font: '600 11px "Space Grotesk"', color: W.gray2,
        }}>2LT</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <L th="ร.ต. ภูริ พัฒน์" en="2LT Puri Phat" size={12} weight={700} />
          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
            <Chip>{tx({ th: 'นักเรียน', en: 'Cadet' })}</Chip>
            <Chip>{tx({ th: 'ชั้นปี 4', en: '4th Year' })}</Chip>
          </div>
        </div>
        <div style={{ color: W.gray2, font: '300 22px "Space Grotesk"' }}>›</div>
      </div>

      {/* Hero carousel */}
      <div style={{ padding: '12px 12px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <L th="ข่าวเด่น" en="Featured" size={11} weight={600} />
          <div style={{ display: 'flex', gap: 3 }}>
            <div style={{ width: 12, height: 3, background: W.ink, borderRadius: 2 }} />
            <div style={{ width: 3, height: 3, background: W.rule, borderRadius: 2 }} />
            <div style={{ width: 3, height: 3, background: W.rule, borderRadius: 2 }} />
            <div style={{ width: 3, height: 3, background: W.rule, borderRadius: 2 }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, overflow: 'hidden' }}>
          <Img w={180} h={100} label="Hero · 1" />
          <Img w={120} h={100} label="2" />
        </div>
      </div>

      {/* Quick services 2x2 — TAPS push their screens */}
      <div style={{ padding: '12px 12px 0' }}>
        <L th="บริการด่วน" en="Quick Services" size={11} weight={600} style={{ marginBottom: 6 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            { th: 'ตารางเรียน', en: 'Class', icon: '📚', route: 'class' },
            { th: 'อาหาร', en: 'Meal', icon: '🍱', route: 'meal' },
            { th: 'สุขภาพ AI', en: 'Health AI', icon: '❤', route: 'health' },
            { th: 'แจ้งซ่อม', en: 'Report', icon: '🛠', route: 'report' },
          ].map(s => (
            <div
              key={s.en}
              onClick={() => nav.push(s.route)}
              style={{
                background: W.paper, border: `1px solid ${W.rule}`, borderRadius: 8,
                padding: '10px 10px', display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: 6, background: W.shade,
                display: 'flex', alignItems: 'center', justifyContent: 'center', font: '500 12px sans-serif',
              }}>{s.icon}</div>
              <L th={s.th} en={s.en} size={10} weight={600} />
            </div>
          ))}
        </div>
      </div>

      {/* News/Event tabs */}
      <div style={{ padding: '12px 12px 0' }}>
        <div style={{ display: 'flex', gap: 14, borderBottom: `1px solid ${W.rule}`, marginBottom: 8 }}>
          <div style={{ paddingBottom: 6, borderBottom: `2px solid ${W.ink}` }}>
            <L th="ข่าว" en="News" size={10} weight={700} />
          </div>
          <div style={{ paddingBottom: 6, cursor: 'pointer' }}>
            <L th="กิจกรรม" en="Events" size={10} weight={500} />
          </div>
        </div>
        {[
          { th: 'ผบ.รร. ตรวจเยี่ยม กองพัน 2', en: 'Commandant visits Bn 2', t: '2h ago' },
          { th: 'ประกาศตารางสอบกลางภาค', en: 'Midterm schedule posted', t: '6h ago' },
        ].map((n, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Img w={56} h={48} />
            <div style={{ flex: 1 }}>
              <div style={{ font: '600 10px Sarabun', color: W.ink }}>{tx(n)}</div>
              <div style={{ font: '500 7px "Space Grotesk"', color: W.crimson, marginTop: 4, letterSpacing: '.1em' }}>{n.t}</div>
            </div>
          </div>
        ))}
      </div>

      {/* World news */}
      <div style={{ padding: '4px 0 14px 12px' }}>
        <L th="ข่าวโลก" en="World News" size={11} weight={600} style={{ marginBottom: 6 }} />
        <div style={{ display: 'flex', gap: 6, overflow: 'hidden' }}>
          <Img w={88} h={60} label="Reuters" />
          <Img w={88} h={60} label="BBC" />
          <Img w={88} h={60} label="AP" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PROFILE — banner + grade report with semester dropdown
// ============================================================================
function ProfileScreen({ nav }) {
  const [sem, setSem] = React.useState('2/2025');
  const [open, setOpen] = React.useState(false);
  const semesters = ['1/2024', '2/2024', '1/2025', '2/2025'];
  const grades = [
    ['MA201', 'แคลคูลัส II', 'Calculus II', '3', 'A'],
    ['CS210', 'การเขียนโปรแกรม', 'Programming', '3', 'A-'],
    ['MS220', 'ยุทธวิธี', 'Tactics I', '3', 'B+'],
    ['PE201', 'พลศึกษา', 'PE', '1', 'A'],
    ['EN201', 'ภาษาอังกฤษ', 'English II', '2', 'B+'],
  ];
  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <AppBar back onBack={nav.back} th="ประวัติ" en="Profile" />
      {/* Profile header */}
      <div style={{ padding: '14px 14px 12px', background: W.shade, borderBottom: `1px solid ${W.rule}` }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: W.bone2,
            border: `1px solid ${W.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            font: '600 12px "Space Grotesk"', color: W.gray2,
          }}>PHOTO</div>
          <div style={{ flex: 1 }}>
            <L th="ร.ต. ภูริ พัฒน์" en="2LT Puri Phat" size={13} weight={700} />
            <div style={{ font: '400 9px "Space Grotesk"', color: W.gray2, marginTop: 2 }}>{tx({ th: 'รหัส 67-0421 · กองพัน 2', en: 'ID 67-0421 · Battalion 2' })}</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              <Chip>{tx({ th: 'นักเรียน', en: 'Cadet' })}</Chip>
              <Chip>{tx({ th: 'ชั้นปี 4', en: '4th Year' })}</Chip>
              <Chip>BN-2</Chip>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Report */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, position: 'relative' }}>
          <L th="รายงานผลการเรียน" en="Grade Report" size={11} weight={700} />
          <div
            onClick={() => setOpen(o => !o)}
            style={{
              border: `1px solid ${W.rule}`, borderRadius: 6, padding: '4px 8px',
              display: 'flex', alignItems: 'center', gap: 6,
              font: '500 9px "Space Grotesk"', color: W.ink, cursor: 'pointer',
              background: W.paper,
            }}
          >
            <span>{sem}</span>
            <span style={{ color: W.gray2 }}>▾</span>
          </div>
          {open && (
            <div style={{
              position: 'absolute', right: 0, top: 30, zIndex: 10,
              background: W.paper, border: `1px solid ${W.rule}`, borderRadius: 8,
              boxShadow: '0 6px 18px rgba(0,0,0,.1)', minWidth: 110, overflow: 'hidden',
            }}>
              {semesters.map(s => (
                <div
                  key={s}
                  onClick={() => { setSem(s); setOpen(false); }}
                  style={{
                    padding: '7px 10px', font: '500 10px "Space Grotesk"', color: W.ink,
                    cursor: 'pointer', background: s === sem ? W.shade : 'transparent',
                  }}
                >{s}{s === sem && ' ✓'}</div>
              ))}
              <div style={{
                padding: '7px 10px', font: '500 10px "Space Grotesk"', color: W.gray,
                borderTop: `1px solid ${W.rule}`,
              }}>{tx({ th: '1/2026 🔒 ล็อก', en: '1/2026 🔒 locked' })}</div>
            </div>
          )}
        </div>
        {/* GPA cards */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <div style={{ flex: 1, padding: 8, border: `1px solid ${W.rule}`, borderRadius: 8 }}>
            <div style={{ font: '500 8px "Space Grotesk"', color: W.gray2, letterSpacing: '.1em' }}>GPA</div>
            <div style={{ font: '700 22px "Space Grotesk"', color: W.ink }}>3.62</div>
          </div>
          <div style={{ flex: 1, padding: 8, border: `1px solid ${W.rule}`, borderRadius: 8 }}>
            <div style={{ font: '500 8px "Space Grotesk"', color: W.gray2, letterSpacing: '.1em' }}>GPAX</div>
            <div style={{ font: '700 22px "Space Grotesk"', color: W.crimson }}>3.48</div>
          </div>
          <div style={{ flex: 1, padding: 8, border: `1px solid ${W.rule}`, borderRadius: 8 }}>
            <div style={{ font: '500 8px "Space Grotesk"', color: W.gray2, letterSpacing: '.1em' }}>CREDITS</div>
            <div style={{ font: '700 22px "Space Grotesk"', color: W.ink }}>12</div>
          </div>
        </div>
        {/* Course list */}
        <div style={{ border: `1px solid ${W.rule}`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '40px 1fr 28px 28px',
            padding: '6px 10px', background: W.shade, font: '500 8px "Space Grotesk"', color: W.gray2, letterSpacing: '.06em',
          }}>
            <span>CODE</span><span>COURSE</span><span>CR</span><span>GR</span>
          </div>
          {grades.map((g, i) => (
            <div key={g[0]} style={{
              display: 'grid', gridTemplateColumns: '40px 1fr 28px 28px',
              padding: '8px 10px', borderTop: `1px solid ${W.rule}`, alignItems: 'center',
            }}>
              <span style={{ font: '500 9px "Space Grotesk"', color: W.gray2 }}>{g[0]}</span>
              <div style={{ font: '600 10px Sarabun', color: W.ink }}>{tx({ th: g[1], en: g[2] })}</div>
              <span style={{ font: '500 10px "Space Grotesk"', color: W.ink2 }}>{g[3]}</span>
              <span style={{ font: '700 11px "Space Grotesk"', color: g[4].startsWith('A') ? W.ink : W.ink2 }}>{g[4]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CLASS — day pills + sessions list, interactive day switch
// ============================================================================
function ClassScreen({ nav }) {
  const [day, setDay] = React.useState(1); // Tue
  const days = [
    { d: 'จ', e: 'MON', date: '20' },
    { d: 'อ', e: 'TUE', date: '21' },
    { d: 'พ', e: 'WED', date: '22' },
    { d: 'พฤ', e: 'THU', date: '23' },
    { d: 'ศ', e: 'FRI', date: '24' },
  ];
  const schedule = [
    [ // Mon
      { t: '08:30', dur: 90, code: 'MA201', th: 'แคลคูลัส II', en: 'Calculus II', room: 'Rm 304', tone: W.ink },
      { t: '10:30', dur: 90, code: 'CS210', th: 'การเขียนโปรแกรม', en: 'Programming', room: 'Lab 2', tone: W.ink },
      { t: '13:00', dur: 90, code: 'PE201', th: 'พลศึกษา', en: 'PE', room: 'Field A', tone: W.crimson },
    ],
    [ // Tue
      { t: '07:00', dur: 60, code: 'PE201', th: 'พลศึกษา', en: 'PE Training', room: 'Field A', tone: W.crimson },
      { t: '08:30', dur: 90, code: 'MA201', th: 'แคลคูลัส II', en: 'Calculus II', room: 'Rm 304', tone: W.ink },
      { t: '10:30', dur: 90, code: 'CS210', th: 'การเขียนโปรแกรม', en: 'Programming', room: 'Lab 2', tone: W.ink },
      { t: '13:00', dur: 90, code: 'MS220', th: 'ยุทธวิธี I', en: 'Tactics I', room: 'Rm 201', tone: W.crimson },
      { t: '15:00', dur: 60, code: 'EN201', th: 'อังกฤษ II', en: 'English II', room: 'Rm 110', tone: W.ink },
    ],
    [ // Wed
      { t: '08:30', dur: 90, code: 'MA201', th: 'แคลคูลัส II', en: 'Calculus II', room: 'Rm 304', tone: W.ink },
      { t: '13:00', dur: 90, code: 'MS220', th: 'ยุทธวิธี I', en: 'Tactics I', room: 'Rm 201', tone: W.crimson },
    ],
    [ // Thu
      { t: '07:00', dur: 60, code: 'PE201', th: 'พลศึกษา', en: 'PE Training', room: 'Field A', tone: W.crimson },
      { t: '10:30', dur: 90, code: 'CS210', th: 'การเขียนโปรแกรม', en: 'Programming', room: 'Lab 2', tone: W.ink },
      { t: '15:00', dur: 60, code: 'EN201', th: 'อังกฤษ II', en: 'English II', room: 'Rm 110', tone: W.ink },
    ],
    [ // Fri
      { t: '08:30', dur: 90, code: 'MA201', th: 'แคลคูลัส II', en: 'Calculus II', room: 'Rm 304', tone: W.ink },
      { t: '13:00', dur: 120, code: 'MS220', th: 'ยุทธวิธี ภาคสนาม', en: 'Field Tactics', room: 'Field B', tone: W.crimson },
    ],
  ];
  return (
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <AppBar back onBack={nav.back} th="ตารางเรียน" en="Class Schedule" right={
        <div style={{ font: '500 9px "Space Grotesk"', color: W.ink2, border: `1px solid ${W.rule}`, padding: '4px 6px', borderRadius: 6 }}>2/2025 ▾</div>
      } />
      <div style={{ display: 'flex', padding: '10px 12px', gap: 4, borderBottom: `1px solid ${W.rule}`, background: W.paper }}>
        {days.map((d, i) => (
          <div
            key={d.e}
            onClick={() => setDay(i)}
            style={{
              flex: 1, padding: '6px 0', textAlign: 'center', borderRadius: 6,
              background: i === day ? W.ink : 'transparent',
              color: i === day ? W.paper : W.ink2,
              cursor: 'pointer',
            }}
          >
            <div style={{ font: '500 9px "Space Grotesk"' }}>{tx({ th: d.d, en: d.e })}</div>
            <div style={{ font: '700 15px "Space Grotesk"' }}>{d.date}</div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px 12px' }}>
        {schedule[day].length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: W.gray2, font: '500 11px Sarabun' }}>
            {tx({ th: 'ไม่มีคาบเรียน', en: 'No classes' })}
          </div>
        )}
        {schedule[day].map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, paddingTop: 2 }}>
              <div style={{ font: '700 11px "Space Grotesk"', color: W.ink }}>{c.t}</div>
              <div style={{ font: '400 8px "Space Grotesk"', color: W.gray2 }}>{c.dur}m</div>
            </div>
            <div style={{ width: 3, alignSelf: 'stretch', background: c.tone, borderRadius: 1 }} />
            <div style={{ flex: 1, padding: '8px 10px', background: W.shade, borderRadius: 8 }}>
              <L th={c.th} en={`${c.code} · ${c.en}`} size={11} weight={600} />
              <div style={{ font: '500 9px "Space Grotesk"', color: W.gray2, marginTop: 4 }}>📍 {c.room}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, ProfileScreen, ClassScreen });
