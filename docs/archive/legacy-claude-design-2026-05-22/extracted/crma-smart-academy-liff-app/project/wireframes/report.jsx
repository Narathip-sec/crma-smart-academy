// REPORT / FIX — 3 variations
// V1: Quick form — category + desc + photo (iOS)
// V2: Map-based pin drop (Android)
// V3: Chat-style AI triage (iOS)

function ReportV1() {
  return (
    <Phone variant="ios">
      <div style={{ height: '100%', overflow: 'auto' }}>
        <AppBar back th="แจ้งซ่อม / เหตุ" en="Report / Fix" />
        {/* Severity banner */}
        <div style={{ padding: '12px 14px 0' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <Chip active color="#3a8b5e">Routine</Chip>
            <Chip>Urgent</Chip>
            <Chip>Emergency</Chip>
          </div>
        </div>

        {/* Category */}
        <div style={{ padding: '14px 14px 0' }}>
          <L th="หมวด" en="Category" size={10} weight={700} style={{ marginBottom: 6 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {[
              ['🚿', 'น้ำ'], ['💡', 'ไฟ'], ['🛏', 'พักอาศัย'],
              ['🚿', 'สุขา'], ['❄', 'แอร์'], ['📶', 'WiFi'],
            ].map(([e, n], i) => (
              <div key={i} style={{
                padding: 10, background: i === 1 ? W.shade : W.paper,
                border: `1px solid ${i === 1 ? W.ink : W.rule}`, borderRadius: 8,
                textAlign: 'center',
              }}>
                <div style={{ font: '400 18px sans-serif' }}>{e}</div>
                <div style={{ font: '500 9px Sarabun', color: W.ink, marginTop: 2 }}>{n}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Location with map pin */}
        <div style={{ padding: '14px 14px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <L th="สถานที่" en="Location · pin on map" size={10} weight={700} />
            <span style={{ font: '500 9px "Space Grotesk"', color: W.crimson }}>📍 use GPS</span>
          </div>
          <div style={{ border: `1px solid ${W.rule}`, borderRadius: 8, overflow: 'hidden' }}>
            {/* Mini map */}
            <div style={{ position: 'relative', height: 90, background: '#e8e3d4' }}>
              <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <pattern id="repgrid" width="14" height="14" patternUnits="userSpaceOnUse">
                    <path d="M14 0 L0 0 0 14" fill="none" stroke="#c9c1ad" strokeWidth=".4" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#repgrid)" />
                {/* roads */}
                <path d="M0 45 Q140 50 280 38" stroke="#c5bda9" strokeWidth="10" fill="none" />
                <path d="M120 0 L150 120" stroke="#c5bda9" strokeWidth="10" fill="none" />
                {/* buildings */}
                <rect x="20" y="14" width="60" height="22" fill="#d8d2bf" stroke="#a8a08e" strokeWidth=".5" />
                <rect x="180" y="10" width="50" height="20" fill="#d8d2bf" stroke="#a8a08e" strokeWidth=".5" />
                <rect x="34" y="58" width="40" height="22" fill="#d8d2bf" stroke="#a8a08e" strokeWidth=".5" />
                <rect x="178" y="58" width="58" height="22" fill="#d8d2bf" stroke="#a8a08e" strokeWidth=".5" />
              </svg>
              {/* dropped pin */}
              <div style={{
                position: 'absolute', left: '52%', top: '54%',
                transform: 'translate(-50%,-100%)',
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50% 50% 50% 0',
                  background: W.crimson, transform: 'rotate(-45deg)',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 6px rgba(0,0,0,.3)',
                }} />
              </div>
              {/* Drag hint */}
              <div style={{
                position: 'absolute', bottom: 4, left: 4,
                padding: '2px 6px', background: 'rgba(251,250,246,.92)', borderRadius: 4,
                font: '500 7px "Space Grotesk"', color: W.gray2, letterSpacing: '.1em',
              }}>DRAG TO ADJUST</div>
              <div style={{
                position: 'absolute', top: 4, right: 4, display: 'flex', gap: 2,
              }}>
                <div style={{ width: 16, height: 16, background: W.paper, border: `1px solid ${W.rule}`, borderRadius: 3, font: '700 11px "Space Grotesk"', color: W.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</div>
                <div style={{ width: 16, height: 16, background: W.paper, border: `1px solid ${W.rule}`, borderRadius: 3, font: '700 11px "Space Grotesk"', color: W.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</div>
              </div>
            </div>
            {/* Address row */}
            <div style={{
              padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderTop: `1px solid ${W.rule}`,
            }}>
              <div>
                <div style={{ font: '600 10px Sarabun', color: W.ink }}>หอพัก 4 · ห้อง 207</div>
                <div style={{ font: '400 8px "Space Grotesk"', color: W.gray2 }}>Dorm 4 · Rm 207 · 13.74°N 100.51°E</div>
              </div>
              <Chip>change</Chip>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ padding: '14px 14px 0' }}>
          <L th="รายละเอียด" en="Details" size={10} weight={700} style={{ marginBottom: 6 }} />
          <div style={{
            padding: 10, border: `1px solid ${W.rule}`, borderRadius: 8, minHeight: 60,
            font: '400 10px Sarabun', color: W.gray2,
          }}>
            หลอดไฟกระพริบ · เปลี่ยนหลอดได้ไหม
          </div>
        </div>

        {/* Photo */}
        <div style={{ padding: '14px 14px 14px' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <Img w={64} h={64} label="📷 photo" />
            <div style={{
              width: 64, height: 64, border: `1px dashed ${W.rule}`, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              font: '300 20px "Space Grotesk"', color: W.gray2,
            }}>+</div>
          </div>
          <Btn primary style={{ marginTop: 14, width: '100%' }}>SEND REPORT</Btn>
        </div>
      </div>
    </Phone>
  );
}

function ReportV2() {
  return (
    <Phone variant="android">
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#f6f3ec' }}>
        <AppBar back th="แจ้งจุดเสีย" en="Pin a Problem" />
        {/* Map */}
        <div style={{ flex: 1, position: 'relative', background: '#e8e3d4', borderBottom: `1px solid ${W.rule}` }}>
          {/* fake map */}
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M20 0 L0 0 0 20" fill="none" stroke="#c9c1ad" strokeWidth=".5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* roads */}
            <path d="M0 100 Q140 100 280 80" stroke="#c5bda9" strokeWidth="14" fill="none" />
            <path d="M120 0 L150 400" stroke="#c5bda9" strokeWidth="14" fill="none" />
            {/* buildings */}
            <rect x="20" y="30" width="80" height="50" fill="#d8d2bf" stroke="#a8a08e" strokeWidth="0.6" />
            <rect x="180" y="20" width="60" height="40" fill="#d8d2bf" stroke="#a8a08e" strokeWidth="0.6" />
            <rect x="40" y="140" width="50" height="50" fill="#d8d2bf" stroke="#a8a08e" strokeWidth="0.6" />
            <rect x="170" y="160" width="70" height="60" fill="#d8d2bf" stroke="#a8a08e" strokeWidth="0.6" />
          </svg>
          {/* existing pins */}
          {[
            [60, 50, '#3a8b5e', '2'],
            [200, 40, W.gold, '1'],
          ].map(([x, y, c, n], i) => (
            <div key={i} style={{
              position: 'absolute', left: x, top: y, transform: 'translate(-50%,-100%)',
              padding: '2px 6px', background: c, color: '#fff', borderRadius: 999,
              font: '700 9px "Space Grotesk"',
            }}>{n}</div>
          ))}
          {/* my drop pin */}
          <div style={{
            position: 'absolute', left: '52%', top: '50%', transform: 'translate(-50%,-100%)',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50% 50% 50% 0', background: W.crimson,
              transform: 'rotate(-45deg)', boxShadow: '0 2px 8px rgba(0,0,0,.25)',
              border: '2px solid #fff',
            }} />
          </div>
          {/* address chip */}
          <div style={{
            position: 'absolute', left: 10, top: 10,
            padding: '6px 10px', background: W.paper, borderRadius: 999,
            border: `1px solid ${W.rule}`, font: '500 9px "Space Grotesk"', color: W.ink,
          }}>📍 Dorm 4 · 13.74°N</div>
        </div>

        {/* Bottom sheet */}
        <div style={{
          background: W.paper, borderTopLeftRadius: 16, borderTopRightRadius: 16,
          padding: '12px 14px 16px', boxShadow: '0 -4px 14px rgba(0,0,0,.06)',
        }}>
          <div style={{ width: 36, height: 3, background: W.rule, borderRadius: 2, margin: '0 auto 10px' }} />
          <L th="หลอดไฟกระพริบ · หอ 4 ห้อง 207" en="Flickering light · Dorm 4 Rm 207" size={11} weight={700} />
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            <Chip active color={W.gold}>Electric</Chip>
            <Chip>Urgent</Chip>
          </div>
          <Btn primary style={{ marginTop: 10, width: '100%' }}>CONFIRM PIN</Btn>
        </div>
      </div>
    </Phone>
  );
}

function ReportV3() {
  // Chat AI triage
  const turns = [
    { who: 'ai', th: 'รายงานอะไรครับ?', en: 'What needs reporting?' },
    { who: 'me', th: 'หลอดไฟกระพริบ' },
    { who: 'ai', th: 'ที่ห้อง 207 ใช่ไหม?', chips: ['ใช่', 'ห้องอื่น'] },
    { who: 'me', th: 'ใช่' },
    { who: 'ai', th: 'เปิดงาน W-2206 · ช่างจะถึงในวันนี้', tone: 'ok' },
  ];
  return (
    <Phone variant="ios">
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <AppBar back th="แชทแจ้งซ่อม" en="Report Concierge" right={<Chip active color="#3a8b5e">● AI</Chip>} />
        <div style={{ flex: 1, overflow: 'auto', padding: '10px 14px' }}>
          {turns.map((t, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: t.who === 'me' ? 'flex-end' : 'flex-start',
              marginBottom: 8,
            }}>
              <div style={{
                maxWidth: '78%',
                padding: '8px 10px',
                borderRadius: 12,
                background: t.who === 'me' ? W.ink : (t.tone === 'ok' ? '#e6f3ec' : W.shade),
                color: t.who === 'me' ? W.paper : W.ink,
                border: t.tone === 'ok' ? `1px solid #3a8b5e` : 'none',
              }}>
                {t.who === 'ai' && (
                  <div style={{ font: '700 7px "Space Grotesk"', color: W.crimson, letterSpacing: '.15em', marginBottom: 2 }}>AI · WORK ORDER</div>
                )}
                <div style={{ font: '500 11px Sarabun' }}>{t.th}</div>
                {t.en && <div style={{ font: '400 8px "Space Grotesk"', color: 'rgba(0,0,0,.4)', marginTop: 2 }}>{t.en}</div>}
                {t.chips && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                    {t.chips.map(c => <Chip key={c}>{c}</Chip>)}
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* Generated ticket */}
          <div style={{ marginTop: 10, padding: 10, border: `1px solid ${W.rule}`, borderRadius: 10, background: W.paper }}>
            <div style={{ font: '700 8px "Space Grotesk"', color: W.gray2, letterSpacing: '.15em' }}>TICKET</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
              <div style={{ font: '700 13px "Space Grotesk"', color: W.ink }}>W-2206</div>
              <Chip active color="#3a8b5e">queued</Chip>
            </div>
            <div style={{ font: '500 10px Sarabun', color: W.ink2, marginTop: 4 }}>Electric · Dorm 4 · Rm 207</div>
            <div style={{ font: '400 8px "Space Grotesk"', color: W.gray2, marginTop: 2 }}>ETA today 16:00–18:00</div>
          </div>
        </div>
        {/* Composer */}
        <div style={{
          padding: '8px 12px 12px', borderTop: `1px solid ${W.rule}`,
          display: 'flex', gap: 6, alignItems: 'center',
        }}>
          <div style={{
            width: 32, height: 32, border: `1px solid ${W.rule}`, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', font: '500 14px sans-serif',
          }}>📷</div>
          <div style={{ flex: 1, padding: '8px 12px', borderRadius: 999, border: `1px solid ${W.rule}`, font: '400 10px Sarabun', color: W.gray2 }}>
            พิมพ์รายละเอียด...
          </div>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: W.crimson, color: W.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 11px sans-serif' }}>↑</div>
        </div>
      </div>
    </Phone>
  );
}

Object.assign(window, { ReportV1, ReportV2, ReportV3 });
