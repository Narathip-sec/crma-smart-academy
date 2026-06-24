// prototype-screens-2.jsx — Meal, Health, Report

// ============================================================================
// MEAL — daily meals + canteen purchases + add purchase modal
// ============================================================================
function MealScreen({ nav }) {
  const [meals, setMeals] = React.useState([
    { th: 'อาหารเช้า', en: 'Breakfast', t: '06:30', kcal: 620, items: [
      { th: 'ข้าวต้ม', en: 'Rice porridge' },
      { th: 'หมูสับ', en: 'Minced pork' },
      { th: 'นมถั่วเหลือง', en: 'Soy milk' },
    ], extras: [] },
    { th: 'อาหารกลางวัน', en: 'Lunch', t: '12:00', kcal: 920, items: [
      { th: 'ข้าวผัด', en: 'Fried rice' },
      { th: 'ไข่ดาว', en: 'Fried egg' },
      { th: 'ผักรวม', en: 'Mixed veg' },
      { th: 'ส้ม', en: 'Orange' },
    ], extras: [{ th: 'น้ำเก๊กฮวย', en: 'Chrysanthemum tea', kcal: 90, baht: 15 }] },
    { th: 'อาหารเย็น', en: 'Dinner', t: '18:00', kcal: 780, items: [
      { th: 'ข้าว', en: 'Rice' },
      { th: 'แกงเขียวหวาน', en: 'Green curry' },
      { th: 'ผัดผัก', en: 'Stir-fried veg' },
    ], extras: [] },
  ]);
  const [adding, setAdding] = React.useState(null); // index of meal being added to

  const presets = [
    { th: 'น้ำเก๊กฮวย', en: 'Chrysanthemum tea', kcal: 90, baht: 15 },
    { th: 'นมถั่วเหลือง', en: 'Soy milk', kcal: 150, baht: 12 },
    { th: 'ข้าวเหนียวหมูปิ้ง', en: 'Sticky rice + pork', kcal: 380, baht: 35 },
    { th: 'ส้ม', en: 'Orange', kcal: 60, baht: 10 },
    { th: 'กล้วยทอด', en: 'Fried banana', kcal: 220, baht: 20 },
    { th: 'แซนวิช', en: 'Sandwich', kcal: 320, baht: 30 },
  ];

  const addExtra = (mealIdx, preset) => {
    setMeals(ms => ms.map((m, i) => i === mealIdx ? { ...m, extras: [...m.extras, preset] } : m));
    setAdding(null);
  };

  const totalKcal = meals.reduce((s, m) => s + m.kcal + m.extras.reduce((a, e) => a + e.kcal, 0), 0);
  const totalBaht = meals.reduce((s, m) => s + m.extras.reduce((a, e) => a + e.baht, 0), 0);
  const totalItems = meals.reduce((s, m) => s + m.extras.length, 0);
  const target = 3200;
  const pct = Math.round(totalKcal / target * 100);

  return (
    <div style={{ height: '100%', overflow: 'auto', position: 'relative' }}>
      <AppBar back onBack={nav.back} th="โรงเลี้ยง" en="Mess Hall + Canteen" />

      {/* AI banner */}
      <div style={{
        margin: '10px 14px 0', padding: '10px 12px', borderRadius: 10,
        background: `linear-gradient(95deg, ${W.ink} 0%, #1c2c4d 100%)`,
        color: W.paper, display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: W.gold, color: W.ink,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          font: '800 10px "Space Grotesk"',
        }}>AI</div>
        <div style={{ flex: 1 }}>
          <L th="เป้าหมายวันนี้ 3,200 kCal" en="Target 3,200 kcal · PT day" size={11} weight={700} color="#fbfaf6" />
          <div style={{ font: '400 9px "Space Grotesk"', color: 'rgba(255,255,255,.7)', marginTop: 2 }}>{tx({ th: '+ โปรตีน 140 กรัม · น้ำ 3 ลิตร', en: '+ protein 140g · hydrate 3L' })}</div>
        </div>
        <span style={{ color: 'rgba(255,255,255,.5)', font: '300 18px "Space Grotesk"' }}>›</span>
      </div>

      {/* Progress */}
      <div style={{ padding: '10px 14px 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ font: '500 9px "Space Grotesk"', color: W.gray2 }}>{tx({ th: 'วันนี้', en: 'Today' })} · {totalKcal.toLocaleString()} / {target.toLocaleString()}</span>
          <span style={{ font: '700 9px "Space Grotesk"', color: W.crimson }}>{pct}%</span>
        </div>
        <div style={{ height: 6, background: W.bone, borderRadius: 3 }}>
          <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: W.crimson, borderRadius: 3 }} />
        </div>
      </div>

      {/* Meal cards */}
      <div style={{ padding: '6px 14px 8px' }}>
        {meals.map((m, i) => {
          const mealKcal = m.kcal + m.extras.reduce((s, e) => s + e.kcal, 0);
          return (
            <div key={i} style={{
              marginTop: 8, padding: 10, background: W.paper,
              border: `1px solid ${W.rule}`, borderRadius: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <L th={m.th} en={`${m.en} · ${m.t}`} size={11} weight={700} />
                <div>
                  <span style={{ font: '700 14px "Space Grotesk"', color: W.ink }}>{mealKcal}</span>
                  <span style={{ font: '500 8px "Space Grotesk"', color: W.gray2, marginLeft: 2 }}>kcal</span>
                </div>
              </div>
              <div style={{ font: '500 7px "Space Grotesk"', color: W.gray2, letterSpacing: '.15em', marginTop: 8 }}>{tx({ th: 'โรงเลี้ยง', en: 'MESS HALL' })}</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                {m.items.map((it, j) => <Chip key={j}>{tx(it)}</Chip>)}
              </div>
              {m.extras.length > 0 && (
                <>
                  <div style={{ font: '500 7px "Space Grotesk"', color: W.crimson, letterSpacing: '.15em', marginTop: 8 }}>{tx({ th: 'ซื้อเพิ่ม', en: 'CANTEEN' })}</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                    {m.extras.map((e, j) => (
                      <Chip key={j} active color={W.crimson}>+ {tx(e)} · {e.kcal}kcal · ฿{e.baht}</Chip>
                    ))}
                  </div>
                </>
              )}
              <div
                onClick={() => setAdding(i)}
                style={{
                  marginTop: 8, padding: '6px 8px',
                  border: `1px dashed ${W.rule}`, borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  font: '500 9px "Space Grotesk"', color: W.gray2, cursor: 'pointer',
                }}
              >
                <span>+ {tx({ th: 'บันทึกที่ซื้อเพิ่ม', en: 'Log purchase' })}</span>
                <span style={{ color: W.ink }}>📷 🔍</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Spend summary */}
      <div style={{
        margin: '0 14px 14px', padding: '8px 10px',
        background: W.shade, borderRadius: 8,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ font: '500 8px "Space Grotesk"', color: W.gray2, letterSpacing: '.1em' }}>{tx({ th: 'ยอดจ่ายซื้อเพิ่ม · วันนี้', en: 'CANTEEN SPEND · TODAY' })}</div>
          <div style={{ font: '700 14px "Space Grotesk"', color: W.ink, marginTop: 2 }}>฿ {totalBaht} <span style={{ font: '400 9px "Space Grotesk"', color: W.gray2 }}>· {totalItems} {tx({ th: 'รายการ', en: `item${totalItems !== 1 ? 's' : ''}` })}</span></div>
        </div>
        <Chip>{tx({ th: 'ประวัติ', en: 'view history' })}</Chip>
      </div>

      {/* Add purchase modal */}
      {adding !== null && (
        <div
          onClick={() => setAdding(null)}
          style={{
            position: 'absolute', inset: 0, background: 'rgba(20,25,40,.4)',
            display: 'flex', alignItems: 'flex-end', zIndex: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', background: W.paper,
              borderTopLeftRadius: 16, borderTopRightRadius: 16,
              padding: '12px 14px 18px',
            }}
          >
            <div style={{ width: 36, height: 3, background: W.rule, borderRadius: 2, margin: '0 auto 10px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <L th={`เพิ่มรายการ · ${meals[adding].th}`} en={`Add to ${meals[adding].en}`} size={12} weight={700} />
              <span onClick={() => setAdding(null)} style={{ color: W.gray2, cursor: 'pointer', fontSize: 18 }}>✕</span>
            </div>
            <div style={{
              padding: '8px 10px', borderRadius: 8, background: W.shade,
              font: '400 10px Sarabun', color: W.gray2, marginBottom: 10,
            }}>🔍 {tx({ th: 'ค้นหาเมนูซื้อเพิ่ม', en: 'Search canteen menu' })}</div>
            <div style={{ font: '500 8px "Space Grotesk"', color: W.gray2, letterSpacing: '.1em', marginBottom: 6 }}>{tx({ th: 'ยอดนิยม', en: 'POPULAR' })}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {presets.map((p, pi) => (
                <div
                  key={pi}
                  onClick={() => addExtra(adding, p)}
                  style={{
                    padding: '8px 10px', border: `1px solid ${W.rule}`, borderRadius: 8,
                    cursor: 'pointer', background: W.paper,
                  }}
                >
                  <div style={{ font: '600 10px Sarabun', color: W.ink }}>{tx(p)}</div>
                  <div style={{ font: '500 8px "Space Grotesk"', color: W.gray2, marginTop: 2 }}>{p.kcal} kcal · ฿{p.baht}</div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 10, padding: '10px 12px', border: `1px dashed ${W.rule}`, borderRadius: 8,
              textAlign: 'center', font: '500 10px "Space Grotesk"', color: W.gray2,
            }}>+ {tx({ th: 'รายการอื่น / สแกนใบเสร็จ', en: 'Custom item / Scan receipt' })}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HEALTH AI — activity rings + workout app picker
// ============================================================================
function HealthScreen({ nav }) {
  const [providers, setProviders] = React.useState({
    apple: { on: true, last: 'now' },
    strava: { on: true, last: '2h' },
    garmin: { on: false, last: 'tap to link' },
    google: { on: false, last: 'tap to link' },
    manual: { on: false, last: '' },
  });
  const toggle = (k) => setProviders(p => ({
    ...p,
    [k]: { ...p[k], on: !p[k].on, last: !p[k].on ? 'just now' : 'tap to link' },
  }));

  const provs = [
    { id: 'apple',  name: 'Apple Health', mark: '', tone: '#000' },
    { id: 'strava', name: 'Strava',       mark: 'S', tone: '#fc4c02' },
    { id: 'garmin', name: 'Garmin',       mark: 'G', tone: '#000' },
    { id: 'google', name: 'Google Fit',   mark: 'G', tone: '#1a73e8' },
    { id: 'manual', name: 'Manual',       mark: 'M', tone: W.gray2 },
  ];

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <AppBar back onBack={nav.back} th="สุขภาพ AI" en="Health AI" right={<Chip>⚙</Chip>} />

      {/* Integration picker */}
      <div style={{ padding: '10px 0 0 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingRight: 14, marginBottom: 6 }}>
          <L th="แอปออกกำลังกาย" en="Workout Apps · sync source" size={10} weight={700} />
          <span style={{ font: '500 9px "Space Grotesk"', color: W.crimson, cursor: 'pointer' }}>{tx({ th: 'จัดการ', en: 'manage' })} ›</span>
        </div>
        <div style={{ display: 'flex', gap: 6, overflow: 'hidden', overflowX: 'auto', paddingRight: 14, paddingBottom: 4 }}>
          {provs.map(p => {
            const on = providers[p.id].on;
            return (
              <div
                key={p.id}
                onClick={() => toggle(p.id)}
                style={{
                  flex: '0 0 86px',
                  padding: '8px 8px',
                  background: on ? W.paper : 'transparent',
                  border: `1px ${on ? 'solid' : 'dashed'} ${on ? p.tone : W.rule}`,
                  borderRadius: 10, position: 'relative',
                  cursor: 'pointer', userSelect: 'none',
                }}
              >
                {on && (
                  <div style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 6, height: 6, borderRadius: '50%', background: '#3a8b5e',
                  }} />
                )}
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: on ? p.tone : W.shade,
                  color: on ? '#fff' : W.gray2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  font: '700 10px "Space Grotesk"',
                }}>{p.mark || '◍'}</div>
                <div style={{ font: '600 9px "Space Grotesk"', color: on ? W.ink : W.gray2, marginTop: 6, lineHeight: 1.2 }}>{p.name}</div>
                <div style={{ font: '400 7px "Space Grotesk"', color: on ? '#3a8b5e' : W.gray, marginTop: 2 }}>
                  {on ? `synced ${providers[p.id].last}` : providers[p.id].last}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity rings */}
      <div style={{ padding: '14px 14px 0', display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 110, height: 110 }}>
          <svg width="110" height="110" viewBox="0 0 110 110">
            {[
              { r: 48, c: W.crimson, p: 0.78 },
              { r: 38, c: '#3a8b5e', p: 0.62 },
              { r: 28, c: '#1a73e8', p: 0.45 },
            ].map((ring, i) => (
              <g key={i}>
                <circle cx="55" cy="55" r={ring.r} fill="none" stroke={ring.c} strokeWidth="8" opacity=".18" />
                <circle cx="55" cy="55" r={ring.r} fill="none" stroke={ring.c} strokeWidth="8"
                  strokeDasharray={`${Math.PI * ring.r * 2 * ring.p} 999`}
                  transform={`rotate(-90 55 55)`} strokeLinecap="round" />
              </g>
            ))}
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          {[
            ['MOVE',     '465 / 600', W.crimson, 'kcal'],
            ['EXERCISE', '38 / 60',  '#3a8b5e', 'min'],
            ['STAND',    '8 / 12',   '#1a73e8', 'hr'],
          ].map(([l, v, c, u]) => (
            <div key={l} style={{ marginBottom: 6 }}>
              <div style={{ font: '600 8px "Space Grotesk"', color: c, letterSpacing: '.1em' }}>{l}</div>
              <div style={{ font: '700 14px "Space Grotesk"', color: W.ink }}>{v} <span style={{ font: '400 9px "Space Grotesk"', color: W.gray2 }}>{u}</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ padding: '14px 14px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            ['👟 STEPS', '8,420', 'goal 12k'],
            ['💧 WATER', '1.8 L', 'goal 3L'],
            ['❤ HR rest', '62 bpm', 'good'],
            ['⛅ WEATHER', '31° / AQI 42', 'go run'],
          ].map(([t, v, s]) => (
            <div key={t} style={{ padding: 8, background: W.paper, border: `1px solid ${W.rule}`, borderRadius: 8 }}>
              <div style={{ font: '500 8px "Space Grotesk"', color: W.gray2, letterSpacing: '.1em' }}>{t}</div>
              <div style={{ font: '700 14px "Space Grotesk"', color: W.ink, marginTop: 2 }}>{v}</div>
              <div style={{ font: '400 8px "Space Grotesk"', color: W.crimson }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI rec */}
      <div style={{ margin: '14px 14px 14px', padding: '10px 12px', background: W.ink, color: W.paper, borderRadius: 10 }}>
        <div style={{ font: '700 8px "Space Grotesk"', color: W.gold, letterSpacing: '.15em' }}>AI RECOMMENDATION</div>
        <div style={{ font: '500 10px Sarabun', marginTop: 4 }}>
          {tx({ th: 'PFT รอบหน้า · เน้น push-up & วิ่ง 2 กม.', en: 'For next PFT · focus push-ups & 2km run' })}
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          <Btn style={{ background: W.gold, color: W.ink, borderColor: W.gold }}>{tx({ th: 'เริ่มแผน', en: 'Start plan' })}</Btn>
          <Btn style={{ borderColor: 'rgba(255,255,255,.3)', color: W.paper }}>{tx({ th: 'ภายหลัง', en: 'Later' })}</Btn>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// REPORT — quick form with map pin, draggable
// ============================================================================
function ReportScreen({ nav }) {
  const [severity, setSeverity] = React.useState(0);
  const [cat, setCat] = React.useState(1);
  const [pin, setPin] = React.useState({ x: 52, y: 54 });
  const [submitted, setSubmitted] = React.useState(false);

  const sevs = [
    { en: 'Routine', th: 'ปกติ', c: '#3a8b5e' },
    { en: 'Urgent', th: 'ด่วน', c: W.gold },
    { en: 'Emergency', th: 'ฉุกเฉิน', c: W.crimson },
  ];
  const cats = [
    { e: '🚿', th: 'น้ำ', en: 'Water' },
    { e: '💡', th: 'ไฟ', en: 'Light' },
    { e: '🛏', th: 'พักอาศัย', en: 'Room' },
    { e: '🚽', th: 'สุขา', en: 'Toilet' },
    { e: '❄', th: 'แอร์', en: 'AC' },
    { e: '📶', th: 'WiFi', en: 'WiFi' },
  ];
  const mapRef = React.useRef(null);
  const onMapDown = (e) => {
    e.preventDefault();
    const move = (ev) => {
      const rect = mapRef.current?.getBoundingClientRect();
      if (!rect) return;
      const t = ev.touches ? ev.touches[0] : ev;
      const px = Math.max(6, Math.min(94, ((t.clientX - rect.left) / rect.width) * 100));
      const py = Math.max(10, Math.min(94, ((t.clientY - rect.top) / rect.height) * 100));
      setPin({ x: px, y: py });
    };
    move(e);
    const end = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
  };

  if (submitted) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <AppBar back onBack={() => { setSubmitted(false); nav.back(); }} th="ส่งสำเร็จ" en="Submitted" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: '#3a8b5e', color: W.paper,
            display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 24px sans-serif',
          }}>✓</div>
          <L th="ส่งรายงานแล้ว" en="Report submitted" size={14} weight={700} align="center" style={{ marginTop: 14 }} />
          <div style={{ font: '500 9px "Space Grotesk"', color: W.gray2, marginTop: 6, letterSpacing: '.1em' }}>{tx({ th: 'หมายเลข', en: 'TICKET' })} · W-2207</div>
          <div style={{ font: '400 10px Sarabun', color: W.ink2, marginTop: 4, maxWidth: 220 }}>
            {tx({ th: 'ช่างจะถึงในวันนี้ 16:00–18:00 · LINE จะแจ้งสถานะ', en: 'Technician will arrive today 16:00–18:00 · LINE will notify you' })}
          </div>
          <Btn primary style={{ marginTop: 18, padding: '10px 24px' }} onClick={() => nav.back()}>{tx({ th: 'กลับหน้าหลัก', en: 'BACK TO HOME' })}</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <AppBar back onBack={nav.back} th="แจ้งซ่อม / เหตุ" en="Report / Fix" />

      {/* Severity */}
      <div style={{ padding: '12px 14px 0', display: 'flex', gap: 4 }}>
        {sevs.map((s, i) => (
          <div
            key={s.en}
            onClick={() => setSeverity(i)}
            style={{
              flex: 1, padding: '6px 8px', borderRadius: 6, textAlign: 'center',
              background: i === severity ? s.c : 'transparent',
              border: `1px solid ${i === severity ? s.c : W.rule}`,
              color: i === severity ? W.paper : W.ink2,
              font: '600 9px "Space Grotesk"', letterSpacing: '.05em',
              cursor: 'pointer',
            }}
          >
            {tx(s)}
          </div>
        ))}
      </div>

      {/* Category */}
      <div style={{ padding: '14px 14px 0' }}>
        <L th="หมวด" en="Category" size={10} weight={700} style={{ marginBottom: 6 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {cats.map((c, i) => (
            <div
              key={c.en}
              onClick={() => setCat(i)}
              style={{
                padding: 10, background: i === cat ? W.shade : W.paper,
                border: `1px solid ${i === cat ? W.ink : W.rule}`,
                borderRadius: 8, textAlign: 'center', cursor: 'pointer',
              }}
            >
              <div style={{ font: '400 18px sans-serif' }}>{c.e}</div>
              <div style={{ font: '500 10px Sarabun', color: W.ink, marginTop: 2 }}>{tx(c)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Location + draggable pin */}
      <div style={{ padding: '14px 14px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <L th="สถานที่" en="Location · pin on map" size={10} weight={700} />
          <span
            onClick={() => setPin({ x: 50, y: 50 })}
            style={{ font: '500 9px "Space Grotesk"', color: W.crimson, cursor: 'pointer' }}
          >📍 {tx({ th: 'ใช้ GPS', en: 'use GPS' })}</span>
        </div>
        <div style={{ border: `1px solid ${W.rule}`, borderRadius: 8, overflow: 'hidden' }}>
          <div
            ref={mapRef}
            onPointerDown={onMapDown}
            style={{ position: 'relative', height: 110, background: '#e8e3d4', cursor: 'crosshair', touchAction: 'none' }}
          >
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <defs>
                <pattern id="repgrid2" width="14" height="14" patternUnits="userSpaceOnUse">
                  <path d="M14 0 L0 0 0 14" fill="none" stroke="#c9c1ad" strokeWidth=".4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#repgrid2)" />
              <path d="M0 55 Q140 60 280 48" stroke="#c5bda9" strokeWidth="10" fill="none" />
              <path d="M120 0 L150 140" stroke="#c5bda9" strokeWidth="10" fill="none" />
              <rect x="20" y="14" width="60" height="28" fill="#d8d2bf" stroke="#a8a08e" strokeWidth=".5" />
              <rect x="180" y="10" width="50" height="25" fill="#d8d2bf" stroke="#a8a08e" strokeWidth=".5" />
              <rect x="34" y="70" width="40" height="30" fill="#d8d2bf" stroke="#a8a08e" strokeWidth=".5" />
              <rect x="178" y="70" width="58" height="28" fill="#d8d2bf" stroke="#a8a08e" strokeWidth=".5" />
            </svg>
            <div style={{
              position: 'absolute', left: `${pin.x}%`, top: `${pin.y}%`,
              transform: 'translate(-50%,-100%)', pointerEvents: 'none',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50% 50% 50% 0',
                background: W.crimson, transform: 'rotate(-45deg)',
                border: '2px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,.3)',
              }} />
            </div>
            <div style={{
              position: 'absolute', bottom: 4, left: 4,
              padding: '2px 6px', background: 'rgba(251,250,246,.92)', borderRadius: 4,
              font: '500 7px "Space Grotesk"', color: W.gray2, letterSpacing: '.1em',
              pointerEvents: 'none',
            }}>{tx({ th: 'ลากเพื่อปรับ', en: 'DRAG TO ADJUST' })}</div>
            <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 2 }}>
              <div style={{ width: 16, height: 16, background: W.paper, border: `1px solid ${W.rule}`, borderRadius: 3, font: '700 11px "Space Grotesk"', color: W.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</div>
              <div style={{ width: 16, height: 16, background: W.paper, border: `1px solid ${W.rule}`, borderRadius: 3, font: '700 11px "Space Grotesk"', color: W.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</div>
            </div>
          </div>
          <div style={{
            padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderTop: `1px solid ${W.rule}`,
          }}>
            <div>
              <div style={{ font: '600 10px Sarabun', color: W.ink }}>{tx({ th: 'หอพัก 4 · ห้อง 207', en: 'Dorm 4 · Rm 207' })}</div>
              <div style={{ font: '400 8px "Space Grotesk"', color: W.gray2 }}>{(13.74 + (pin.y - 50) / 1000).toFixed(4)}°N · {(100.51 + (pin.x - 50) / 1000).toFixed(4)}°E</div>
            </div>
            <Chip>{tx({ th: 'เปลี่ยน', en: 'change' })}</Chip>
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{ padding: '14px 14px 0' }}>
        <L th="รายละเอียด" en="Details" size={10} weight={700} style={{ marginBottom: 6 }} />
        <div style={{
          padding: 10, border: `1px solid ${W.rule}`, borderRadius: 8, minHeight: 50,
          font: '400 10px Sarabun', color: W.gray2,
        }}>
          {tx({ th: 'หลอดไฟกระพริบ · เปลี่ยนหลอดได้ไหม', en: 'Flickering light · please replace bulb' })}
        </div>
      </div>

      {/* Photo + submit */}
      <div style={{ padding: '14px 14px 18px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <Img w={56} h={56} label="📷" />
          <div style={{
            width: 56, height: 56, border: `1px dashed ${W.rule}`, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            font: '300 20px "Space Grotesk"', color: W.gray2, cursor: 'pointer',
          }}>+</div>
        </div>
        <div
          onClick={() => setSubmitted(true)}
          style={{
            marginTop: 14, padding: '12px', borderRadius: 8,
            background: W.ink, color: W.paper, textAlign: 'center',
            font: '700 12px "Space Grotesk"', letterSpacing: '.1em',
            cursor: 'pointer',
          }}
        >{tx({ th: 'ส่งรายงาน', en: 'SEND REPORT' })}</div>
      </div>
    </div>
  );
}

// Need onClick on Btn — patch it via a wrapper
function PatchedBtn(props) {
  return <div onClick={props.onClick} style={{ cursor: props.onClick ? 'pointer' : 'default' }}><Btn {...props} /></div>;
}

Object.assign(window, { MealScreen, HealthScreen, ReportScreen });
