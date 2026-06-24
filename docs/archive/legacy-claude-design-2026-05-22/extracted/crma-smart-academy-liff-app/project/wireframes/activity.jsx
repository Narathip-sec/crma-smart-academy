// ACTIVITY (Meetup-style) — 3 variations
// V1: Horizontal featured + grid list (iOS)
// V2: Map-anchored discovery (Android)
// V3: Card-stack RSVP (iOS)

function ActivityV1() {
  return (
    <Phone variant="ios" activeTab={3}>
      <div style={{ height: '100%', overflow: 'auto', position: 'relative' }}>
        <AppBar th="กิจกรรม" en="Activities" right={<Chip>filter</Chip>} />
        {/* Featured rail */}
        <div style={{ padding: '12px 0 0 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingRight: 14 }}>
            <L th="แนะนำ" en="Featured" size={11} weight={700} />
            <span style={{ font: '500 9px "Space Grotesk"', color: W.gray2 }}>see all ›</span>
          </div>
          <div style={{ display: 'flex', gap: 8, overflow: 'hidden', marginTop: 8, paddingRight: 14 }}>
            {[
              { t: 'CRMA Run 2026', cap: '12/40', tone: W.crimson },
              { t: 'Robotics Club', cap: '8/20', tone: W.ink },
            ].map((c, i) => (
              <div key={i} style={{
                flex: '0 0 200px', borderRadius: 10, overflow: 'hidden',
                border: `1px solid ${W.rule}`, background: W.paper,
              }}>
                <Img w="100%" h={96} />
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <L th={c.t} size={10} weight={700} />
                    <Chip active color={c.tone}>{c.cap}</Chip>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <span style={{ font: '500 8px "Space Grotesk"', color: W.gray2 }}>🕒 Sat 7am</span>
                    <span style={{ font: '500 8px "Space Grotesk"', color: W.gray2 }}>📍 Field A</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Categories */}
        <div style={{ padding: '14px 14px 0', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Chip active color={W.ink}>All</Chip>
          <Chip>Sport</Chip>
          <Chip>Academic</Chip>
          <Chip>Social</Chip>
          <Chip>Volunteer</Chip>
        </div>
        {/* Grid list */}
        <div style={{ padding: '10px 14px 14px' }}>
          {[
            { th: 'อบรมปฐมพยาบาล', en: 'First Aid Workshop', t: 'Wed 16:00', cap: '6/15', tone: '#3a8b5e' },
            { th: 'อ่านหนังสือกลุ่ม', en: 'Study Group · MA201', t: 'Thu 19:00', cap: '4/8', tone: W.ink },
            { th: 'ฟุตซอลคืนวันศุกร์', en: 'Friday Futsal', t: 'Fri 19:30', cap: '10/10', full: true, tone: W.crimson },
          ].map((e, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, padding: '10px 0',
              borderBottom: i < 2 ? `1px solid ${W.rule}` : 'none',
            }}>
              <Img w={56} h={56} />
              <div style={{ flex: 1 }}>
                <L th={e.th} en={e.en} size={10} weight={700} />
                <div style={{ font: '500 8px "Space Grotesk"', color: W.gray2, marginTop: 4 }}>🕒 {e.t}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Chip active color={e.full ? W.gray2 : e.tone}>{e.full ? 'FULL' : e.cap}</Chip>
                <div style={{ font: '500 8px "Space Grotesk"', color: W.gray2, marginTop: 4 }}>RSVP</div>
              </div>
            </div>
          ))}
        </div>
        {/* FAB */}
        <div style={{
          position: 'absolute', right: 14, bottom: 14,
          width: 48, height: 48, borderRadius: '50%', background: W.crimson, color: W.paper,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          font: '300 26px "Space Grotesk"',
          boxShadow: '0 6px 16px rgba(168,24,42,.35)',
        }}>+</div>
      </div>
    </Phone>
  );
}

function ActivityV2() {
  return (
    <Phone variant="android" activeTab={3}>
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', background: '#f6f3ec' }}>
        {/* Map portion */}
        <div style={{ position: 'relative', height: 220, background: '#e8e3d4' }}>
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <pattern id="actgrid" width="22" height="22" patternUnits="userSpaceOnUse">
                <path d="M22 0 L0 0 0 22" fill="none" stroke="#c9c1ad" strokeWidth=".5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#actgrid)" />
            {/* roads */}
            <path d="M0 120 Q140 110 280 130" stroke="#c5bda9" strokeWidth="16" fill="none" />
            <path d="M140 0 Q120 100 160 220" stroke="#c5bda9" strokeWidth="16" fill="none" />
            {/* buildings */}
            <rect x="20" y="30" width="80" height="55" fill="#d8d2bf" stroke="#a8a08e" strokeWidth=".6" />
            <rect x="180" y="40" width="70" height="50" fill="#d8d2bf" stroke="#a8a08e" strokeWidth=".6" />
            <rect x="40" y="150" width="60" height="60" fill="#d8d2bf" stroke="#a8a08e" strokeWidth=".6" />
            <rect x="190" y="160" width="60" height="50" fill="#d8d2bf" stroke="#a8a08e" strokeWidth=".6" />
          </svg>
          {/* event pins */}
          {[
            { x: 60, y: 50, n: 6, c: W.crimson },
            { x: 220, y: 60, n: 3, c: W.ink },
            { x: 80, y: 170, n: 1, c: W.gold },
            { x: 220, y: 180, n: 2, c: '#3a8b5e', sel: true },
          ].map((p, i) => (
            <div key={i} style={{
              position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%,-50%)',
              padding: p.sel ? '4px 10px' : '3px 7px', borderRadius: 999,
              background: p.c, color: W.paper, font: '700 10px "Space Grotesk"',
              border: p.sel ? `2px solid ${W.paper}` : 'none',
              boxShadow: p.sel ? '0 2px 10px rgba(0,0,0,.3)' : '0 1px 4px rgba(0,0,0,.2)',
            }}>● {p.n}</div>
          ))}
          {/* you marker */}
          <div style={{
            position: 'absolute', left: 145, top: 110,
            width: 12, height: 12, borderRadius: '50%', background: '#1a73e8',
            border: `2px solid ${W.paper}`, boxShadow: '0 0 0 5px rgba(26,115,232,.3)',
          }} />
          <div style={{
            position: 'absolute', left: 10, top: 10,
            padding: '6px 10px', background: W.paper, borderRadius: 999,
            font: '500 9px "Space Grotesk"', color: W.ink,
            border: `1px solid ${W.rule}`,
          }}>📍 nearby · 800m</div>
        </div>

        {/* Bottom sheet */}
        <div style={{
          flex: 1, background: W.paper, borderTopLeftRadius: 16, borderTopRightRadius: 16,
          padding: '10px 14px', boxShadow: '0 -4px 14px rgba(0,0,0,.06)', marginTop: -16,
          overflow: 'auto', position: 'relative', zIndex: 1,
        }}>
          <div style={{ width: 36, height: 3, background: W.rule, borderRadius: 2, margin: '0 auto 10px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <L th="ใกล้คุณ" en="Near You · 12" size={11} weight={700} />
            <Chip active color={W.ink}>Map</Chip>
          </div>
          {[
            { th: 'อบรมปฐมพยาบาล', dist: '120m · Bldg A', cap: '6/15', c: '#3a8b5e' },
            { th: 'ฟุตซอลคืนวันศุกร์', dist: '340m · Court 2', cap: '10/10', full: true, c: W.crimson },
            { th: 'อ่านหนังสือกลุ่ม', dist: '90m · Library', cap: '4/8', c: W.ink },
          ].map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? `1px solid ${W.rule}` : 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: e.c, color: W.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 11px "Space Grotesk"' }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ font: '600 10px Sarabun', color: W.ink }}>{e.th}</div>
                <div style={{ font: '400 8px "Space Grotesk"', color: W.gray2 }}>{e.dist}</div>
              </div>
              <Chip active color={e.full ? W.gray2 : e.c}>{e.full ? 'FULL' : e.cap}</Chip>
            </div>
          ))}
        </div>
        {/* FAB */}
        <div style={{
          position: 'absolute', right: 14, bottom: 14, zIndex: 2,
          width: 50, height: 50, borderRadius: 14, background: W.crimson, color: W.paper,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          font: '300 26px "Space Grotesk"',
          boxShadow: '0 6px 16px rgba(168,24,42,.35)',
        }}>+</div>
      </div>
    </Phone>
  );
}

function ActivityV3() {
  return (
    <Phone variant="ios" activeTab={3}>
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <AppBar th="ค้นหากิจกรรม" en="Discover · Swipe" right={<Chip>list</Chip>} />
        <div style={{ flex: 1, position: 'relative', padding: '14px 0' }}>
          {/* card stack — 3 stacked, top in focus */}
          {[
            { off: 0, rot: 0, scale: 1, c: W.crimson, t: 'CRMA Run 2026', cap: '12/40', dt: 'Sat 7am · Field A' },
            { off: 6, rot: -2, scale: .96, c: W.ink, t: 'Robotics Club', cap: '8/20', dt: 'Mon 17:00' },
            { off: 12, rot: 2, scale: .92, c: '#3a8b5e', t: 'First Aid Workshop', cap: '6/15', dt: 'Wed 16:00' },
          ].reverse().map((c, i) => (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: 14,
              transform: `translateX(-50%) translateY(${c.off}px) rotate(${c.rot}deg) scale(${c.scale})`,
              width: 240, height: 340,
              background: W.paper, borderRadius: 14,
              border: `1px solid ${W.rule}`,
              boxShadow: '0 8px 24px rgba(20,25,40,.12)',
              padding: 14,
              display: 'flex', flexDirection: 'column',
              zIndex: i,
            }}>
              <Img w="100%" h={140} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <Chip active color={c.c}>{c.cap} spots</Chip>
                <span style={{ font: '500 9px "Space Grotesk"', color: W.gray2 }}>1/12</span>
              </div>
              <L th={c.t} size={14} weight={700} style={{ marginTop: 8 }} />
              <div style={{ font: '500 9px "Space Grotesk"', color: W.gray2, marginTop: 6 }}>🕒 {c.dt}</div>
              <div style={{ font: '400 9px Sarabun', color: W.ink2, marginTop: 6, lineHeight: 1.4 }}>
                วิ่ง 10K รอบฐานทัพ พร้อมเสื้อที่ระลึก · เปิดรับสมัครจนกว่าจะเต็ม
              </div>
            </div>
          ))}
          {/* Swipe controls */}
          <div style={{
            position: 'absolute', bottom: 14, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 14,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: W.paper,
              border: `2px solid ${W.gray}`, color: W.gray2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              font: '600 22px "Space Grotesk"',
            }}>✕</div>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: W.ink,
              color: W.gold, display: 'flex', alignItems: 'center', justifyContent: 'center',
              font: '700 10px "Space Grotesk"', textAlign: 'center', lineHeight: 1,
            }}>RSVP</div>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: W.paper,
              border: `2px solid ${W.crimson}`, color: W.crimson,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              font: '700 18px "Space Grotesk"',
            }}>♥</div>
          </div>
        </div>
        <Note style={{ position: 'absolute', right: 6, top: 80, transform: 'rotate(-4deg)' }}>
          swipe right = RSVP, left = pass — sends LINE flex
        </Note>
      </div>
    </Phone>
  );
}

Object.assign(window, { ActivityV1, ActivityV2, ActivityV3 });
