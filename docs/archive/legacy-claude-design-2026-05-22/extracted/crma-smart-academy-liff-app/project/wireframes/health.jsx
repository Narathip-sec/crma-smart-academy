// HEALTH AI — 3 variations
// Multi-integration spotlight: Apple Health, Google Fit, Strava, Garmin
// V1: Apple-Health-style rings + integration selector (iOS)
// V2: PFT-focused dashboard w/ AI rec card (Android)
// V3: Provider-agnostic integration hub — pick + diff (iOS)

const PROVIDERS = [
  { id: 'apple',  name: 'Apple Health', mark: '', tone: '#000' },
  { id: 'google', name: 'Google Fit',   mark: 'G', tone: '#1a73e8' },
  { id: 'strava', name: 'Strava',       mark: 'S', tone: '#fc4c02' },
  { id: 'garmin', name: 'Garmin',       mark: 'G', tone: '#000' },
  { id: 'manual', name: 'Manual',       mark: 'M', tone: W.gray2 },
];

function ProviderDots({ active }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {PROVIDERS.map(p => (
        <div key={p.id} style={{
          width: 16, height: 16, borderRadius: 4,
          background: p.id === active ? p.tone : W.bone,
          color: p.id === active ? '#fff' : W.gray2,
          border: p.id === active ? 'none' : `1px solid ${W.rule}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          font: '700 8px "Space Grotesk"',
        }}>{p.mark || '◍'}</div>
      ))}
    </div>
  );
}

function HealthV1() {
  return (
    <Phone variant="ios">
      <div style={{ height: '100%', overflow: 'auto' }}>
        <AppBar back th="สุขภาพ AI" en="Health AI" right={<Chip>⚙</Chip>} />
        {/* Integration picker — horizontal app cards */}
        <div style={{ padding: '10px 0 0 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingRight: 14, marginBottom: 6 }}>
            <L th="แอปออกกำลังกาย" en="Workout Apps · sync source" size={10} weight={700} />
            <span style={{ font: '500 9px "Space Grotesk"', color: W.crimson }}>manage ›</span>
          </div>
          <div style={{ display: 'flex', gap: 6, overflow: 'hidden', paddingRight: 14 }}>
            {[
              { id: 'apple',  name: 'Apple Health', mark: '', tone: '#000',     status: 'on',  last: 'now' },
              { id: 'strava', name: 'Strava',       mark: 'S', tone: '#fc4c02', status: 'on',  last: '2h' },
              { id: 'garmin', name: 'Garmin',       mark: 'G', tone: '#000',    status: 'off', last: 'tap to link' },
              { id: 'google', name: 'Google Fit',   mark: 'G', tone: '#1a73e8', status: 'off', last: 'tap to link' },
              { id: 'manual', name: 'Manual',       mark: 'M', tone: W.gray2,   status: 'off', last: '' },
            ].map(p => {
              const on = p.status === 'on';
              return (
                <div key={p.id} style={{
                  flex: '0 0 86px',
                  padding: '8px 8px',
                  background: on ? W.paper : 'transparent',
                  border: `1px ${on ? 'solid' : 'dashed'} ${on ? p.tone : W.rule}`,
                  borderRadius: 10,
                  position: 'relative',
                }}>
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
                    {on ? `synced ${p.last}` : p.last}
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
              ['MOVE',    '465 / 600', W.crimson, 'kcal'],
              ['EXERCISE','38 / 60',  '#3a8b5e', 'min'],
              ['STAND',   '8 / 12',   '#1a73e8', 'hr'],
            ].map(([l, v, c, u]) => (
              <div key={l} style={{ marginBottom: 6 }}>
                <div style={{ font: '600 8px "Space Grotesk"', color: c, letterSpacing: '.1em' }}>{l}</div>
                <div style={{ font: '700 14px "Space Grotesk"', color: W.ink }}>{v} <span style={{ font: '400 9px "Space Grotesk"', color: W.gray2 }}>{u}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* metric cards */}
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
            PFT รอบหน้า · เน้น push-up & 2km run
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            <Btn style={{ background: W.gold, color: W.ink, borderColor: W.gold }}>Start plan</Btn>
            <Btn style={{ borderColor: 'rgba(255,255,255,.3)', color: W.paper }}>Later</Btn>
          </div>
        </div>
      </div>
    </Phone>
  );
}

function HealthV2() {
  return (
    <Phone variant="android">
      <div style={{ height: '100%', overflow: 'auto', background: '#f6f3ec' }}>
        <AppBar back th="สมรรถภาพ" en="Fitness · PFT" />
        {/* PFT scorecard */}
        <div style={{ margin: '12px 12px 0', padding: 12, background: W.ink, color: W.paper, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={{ font: '500 8px "Space Grotesk"', color: 'rgba(255,255,255,.5)', letterSpacing: '.15em' }}>PFT SCORE · APR</div>
              <div style={{ font: '700 30px "Space Grotesk"', color: W.gold }}>87<span style={{ font: '500 14px "Space Grotesk"', color: 'rgba(255,255,255,.5)' }}>/100</span></div>
              <div style={{ font: '500 9px "Space Grotesk"', color: '#7fc995' }}>↑ 6 vs last</div>
            </div>
            <div style={{
              padding: '6px 10px', borderRadius: 6, background: W.crimson, color: W.paper,
              font: '700 14px "Space Grotesk"',
            }}>A−</div>
          </div>
          {/* mini chart bars */}
          <div style={{ marginTop: 12, display: 'flex', gap: 4, alignItems: 'flex-end', height: 32 }}>
            {[55, 62, 68, 71, 78, 81, 87].map((v, i) => (
              <div key={i} style={{
                flex: 1, height: `${v / 87 * 100}%`,
                background: i === 6 ? W.gold : 'rgba(255,255,255,.4)',
                borderRadius: '2px 2px 0 0',
              }} />
            ))}
          </div>
        </div>

        {/* Event breakdown */}
        <div style={{ padding: '14px 12px 0' }}>
          <L th="รายการ" en="Events" size={10} weight={700} style={{ marginBottom: 6 }} />
          {[
            ['Push-up · 2min', '68 reps', 92, '#3a8b5e'],
            ['Sit-up · 2min',  '74 reps', 88, '#3a8b5e'],
            ['2km Run',         '8:42',   78, W.gold],
            ['Pull-up',         '12 reps', 70, W.crimson],
          ].map(([n, v, s, c]) => (
            <div key={n} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0',
              borderBottom: `1px solid ${W.rule}`,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ font: '600 10px "Space Grotesk"', color: W.ink }}>{n}</div>
                <div style={{ font: '400 8px "Space Grotesk"', color: W.gray2 }}>{v}</div>
              </div>
              <div style={{ width: 80, height: 4, background: W.bone2, borderRadius: 2 }}>
                <div style={{ width: `${s}%`, height: '100%', background: c, borderRadius: 2 }} />
              </div>
              <div style={{ width: 24, font: '700 11px "Space Grotesk"', color: W.ink, textAlign: 'right' }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Source */}
        <div style={{ padding: '14px 12px 14px' }}>
          <div style={{ font: '500 8px "Space Grotesk"', color: W.gray2, letterSpacing: '.15em' }}>DATA FROM</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
            <Chip active color="#fc4c02">◍ Strava</Chip>
            <Chip active color="#000">⚡ Garmin</Chip>
            <Chip>Apple Health</Chip>
            <Chip>Manual</Chip>
            <Chip>+ link</Chip>
          </div>
        </div>
      </div>
    </Phone>
  );
}

function HealthV3() {
  // Provider hub — compare/swap providers, see what each contributes
  return (
    <Phone variant="ios">
      <div style={{ height: '100%', overflow: 'auto' }}>
        <AppBar back th="แหล่งข้อมูล" en="Integration Hub" />
        {/* Hero summary */}
        <div style={{ padding: '12px 14px 0', textAlign: 'center' }}>
          <div style={{ font: '500 8px "Space Grotesk"', color: W.gray2, letterSpacing: '.15em' }}>UNIFIED HEALTH SCORE</div>
          <div style={{ font: '700 42px "Space Grotesk"', color: W.ink, lineHeight: 1 }}>92</div>
          <div style={{ font: '500 9px "Space Grotesk"', color: W.crimson, marginTop: 2 }}>aggregated from 3 sources</div>
        </div>

        {/* Provider list */}
        <div style={{ padding: '14px 12px 0' }}>
          <L th="เชื่อมต่อ" en="Connected" size={10} weight={700} style={{ marginBottom: 6 }} />
          {[
            { ...PROVIDERS[0], status: 'on',  contrib: 'HR · Sleep · Steps', last: 'now' },
            { ...PROVIDERS[2], status: 'on',  contrib: 'Runs · GPX',         last: '2h' },
            { ...PROVIDERS[3], status: 'on',  contrib: 'PFT events · VO₂',   last: '1d' },
            { ...PROVIDERS[1], status: 'off', contrib: 'tap to link',         last: '—' },
          ].map((p, i) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
              borderBottom: i < 3 ? `1px solid ${W.rule}` : 'none',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, background: p.status === 'on' ? p.tone : W.bone,
                color: p.status === 'on' ? '#fff' : W.gray2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: '700 11px "Space Grotesk"',
              }}>{p.mark || '◍'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ font: '600 11px "Space Grotesk"', color: W.ink }}>{p.name}</div>
                <div style={{ font: '400 9px "Space Grotesk"', color: W.gray2 }}>{p.contrib}</div>
              </div>
              <div style={{ font: '500 9px "Space Grotesk"', color: p.status === 'on' ? '#3a8b5e' : W.gray2 }}>
                {p.status === 'on' ? `● ${p.last}` : '+ link'}
              </div>
            </div>
          ))}
        </div>

        {/* Conflict resolution */}
        <div style={{ margin: '14px 14px 14px', padding: '10px 12px', border: `1px dashed ${W.gold}`, borderRadius: 8 }}>
          <div style={{ font: '700 8px "Space Grotesk"', color: W.gold, letterSpacing: '.15em' }}>⚠ CONFLICT</div>
          <div style={{ font: '500 10px Sarabun', color: W.ink, marginTop: 4 }}>
            Steps · Apple 8,420 vs Garmin 9,140
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            <Chip active color="#000">Trust Apple</Chip>
            <Chip>Trust Garmin</Chip>
            <Chip>Average</Chip>
          </div>
        </div>
        <Note style={{ position: 'absolute', right: 8, top: 110, transform: 'rotate(-3deg)' }}>
          one cadet may use 2-3 providers — let them pick the source of truth
        </Note>
      </div>
    </Phone>
  );
}

Object.assign(window, { HealthV1, HealthV2, HealthV3 });
