// PROFILE / GRADES — 3 variations
// V1: Standard profile + grade transcript (iOS)
// V2: Stats dashboard with histogram (Android)
// V3: Military service record / dossier (iOS)

function ProfileV1() {
  const grades = [
    ['MA201', 'แคลคูลัส II', 'Calculus II', '3', 'A'],
    ['CS210', 'การเขียนโปรแกรม', 'Programming', '3', 'A-'],
    ['MS220', 'ยุทธวิธี', 'Tactics I', '3', 'B+'],
    ['PE201', 'พลศึกษา', 'PE', '1', 'A'],
    ['EN201', 'ภาษาอังกฤษ', 'English II', '2', 'B+'],
  ];
  return (
    <Phone variant="ios">
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <AppBar back th="ประวัติ" en="Profile" />
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
              <div style={{ font: '400 9px "Space Grotesk"', color: W.gray2, marginTop: 2 }}>ID 67-0421 · Battalion 2</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                <Chip>Y4</Chip>
                <Chip color={W.crimson}>2LT</Chip>
                <Chip>BN-2</Chip>
              </div>
            </div>
          </div>
        </div>

        {/* Grade Report */}
        <div style={{ padding: '12px 14px 0', flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <L th="รายงานผลการเรียน" en="Grade Report" size={11} weight={700} />
            <div style={{
              border: `1px solid ${W.rule}`, borderRadius: 6, padding: '4px 8px',
              display: 'flex', alignItems: 'center', gap: 6, font: '500 9px "Space Grotesk"', color: W.ink,
            }}>
              <span>2/2025</span>
              <span style={{ color: W.gray2 }}>▾</span>
            </div>
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
                <div>
                  <div style={{ font: '600 10px Sarabun', color: W.ink }}>{g[1]}</div>
                  <div style={{ font: '400 8px "Space Grotesk"', color: W.gray2 }}>{g[2]}</div>
                </div>
                <span style={{ font: '500 10px "Space Grotesk"', color: W.ink2 }}>{g[3]}</span>
                <span style={{ font: '700 11px "Space Grotesk"', color: g[4].startsWith('A') ? W.ink : W.ink2 }}>{g[4]}</span>
              </div>
            ))}
          </div>
          <Note style={{ marginTop: 8 }}>current semester locked — only past visible</Note>
        </div>
      </div>
    </Phone>
  );
}

function ProfileV2() {
  // Histogram bars for A, A-, B+, B, B-, C+, C
  const dist = [
    { g: 'A', n: 8 }, { g: 'A-', n: 5 }, { g: 'B+', n: 6 }, { g: 'B', n: 3 }, { g: 'B-', n: 1 }, { g: 'C+', n: 1 }, { g: 'C', n: 0 },
  ];
  const max = 8;
  return (
    <Phone variant="android">
      <div style={{ height: '100%', overflow: 'auto', background: '#f6f3ec' }}>
        <AppBar back th="ผลการเรียน" en="Academic Record" />
        {/* GPA Hero — large gauge */}
        <div style={{ padding: '14px 14px 0', textAlign: 'center' }}>
          <div style={{ font: '500 9px "Space Grotesk"', color: W.gray2, letterSpacing: '.15em' }}>CUMULATIVE GPAX</div>
          {/* gauge */}
          <div style={{ position: 'relative', width: 140, height: 80, margin: '6px auto 0' }}>
            <svg width="140" height="80" viewBox="0 0 140 80">
              <path d="M10 70 A60 60 0 0 1 130 70" stroke={W.bone2} strokeWidth="8" fill="none" strokeLinecap="round" />
              <path d="M10 70 A60 60 0 0 1 105 22" stroke={W.crimson} strokeWidth="8" fill="none" strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 4 }}>
              <div style={{ font: '700 28px "Space Grotesk"', color: W.ink }}>3.48</div>
              <div style={{ font: '400 8px "Space Grotesk"', color: W.gray2 }}>/ 4.00</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 4, font: '500 9px "Space Grotesk"', color: W.gray2 }}>
            <span>RANK 18/124</span>
            <span>↑ 0.06 vs 1/2025</span>
          </div>
        </div>

        {/* Semester selector — chips row */}
        <div style={{ padding: '14px 12px 0' }}>
          <div style={{ font: '500 9px "Space Grotesk"', color: W.gray2, letterSpacing: '.1em', marginBottom: 6 }}>SEMESTER</div>
          <div style={{ display: 'flex', gap: 4, overflow: 'hidden' }}>
            <Chip>1/24</Chip><Chip>2/24</Chip><Chip>1/25</Chip><Chip active color={W.ink}>2/25</Chip>
            <Chip style={{ background: W.bone, color: W.gray }}>1/26 🔒</Chip>
          </div>
        </div>

        {/* Histogram */}
        <div style={{ padding: '14px 14px 0' }}>
          <L th="การกระจายเกรด" en="Grade Distribution" size={10} weight={700} style={{ marginBottom: 6 }} />
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 80, padding: '0 4px', borderBottom: `1px solid ${W.rule}` }}>
            {dist.map(d => (
              <div key={d.g} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '100%', height: `${(d.n / max) * 70}px`,
                  background: d.g.startsWith('A') ? W.crimson : d.g.startsWith('B') ? W.ink : W.gray,
                  opacity: d.g.startsWith('A') ? 1 : .7,
                  borderRadius: '3px 3px 0 0',
                }} />
                <div style={{ font: '500 8px "Space Grotesk"', color: W.gray2, marginTop: 3 }}>{d.g}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Course list condensed */}
        <div style={{ padding: '14px 12px' }}>
          {['MA201 · Calculus II · A', 'CS210 · Programming · A-', 'MS220 · Tactics · B+'].map((c, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 12px', background: W.paper, border: `1px solid ${W.rule}`,
              borderRadius: 8, marginBottom: 6,
            }}>
              <div style={{ font: '500 11px Sarabun, sans-serif', color: W.ink }}>{c.split(' · ').slice(0, 2).join(' · ')}</div>
              <Chip active color={c.endsWith('A') ? W.crimson : W.ink}>{c.split(' · ').pop()}</Chip>
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

function ProfileV3() {
  return (
    <Phone variant="ios" dark>
      <div style={{ height: '100%', overflow: 'auto', background: '#0e1626', color: W.bone }}>
        {/* Stamp header */}
        <div style={{
          padding: '14px 16px 12px', borderBottom: `1px solid rgba(255,255,255,.08)`,
          position: 'relative',
        }}>
          <div style={{ font: '600 8px "Space Grotesk"', color: W.gold, letterSpacing: '.25em' }}>
            ⬢ SERVICE RECORD · CONFIDENTIAL
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 10, alignItems: 'flex-start' }}>
            <div style={{
              width: 60, height: 76, background: 'rgba(255,255,255,.04)',
              border: `1px solid rgba(255,255,255,.15)`, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              font: '500 9px "Space Grotesk"', color: 'rgba(255,255,255,.4)',
            }}>OFFICIAL<br/>PORTRAIT</div>
            <div style={{ flex: 1 }}>
              <div style={{ font: '500 9px "Space Grotesk"', color: 'rgba(255,255,255,.5)' }}>SURNAME, GIVEN</div>
              <div style={{ font: '700 16px "Space Grotesk"', color: W.bone, letterSpacing: '.04em' }}>PHAT, PURI</div>
              <div style={{ font: '500 8px "Space Grotesk"', color: 'rgba(255,255,255,.5)', marginTop: 8 }}>RANK · YEAR</div>
              <div style={{ font: '700 13px "Space Grotesk"', color: W.gold }}>2LT · CLASS OF 2027</div>
            </div>
          </div>
          {/* Ribbon row */}
          <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
            {[W.crimson, W.gold, '#3a6fae', W.bone].map((c, i) => (
              <div key={i} style={{ flex: 1, height: 8, background: c, borderRadius: 1 }} />
            ))}
          </div>
        </div>

        {/* Sections */}
        {[
          ['ACADEMIC', 'GPAX 3.48', 'Rank 18/124'],
          ['PHYSICAL FITNESS', 'PFT A−', 'Top 14%'],
          ['CONDUCT', '92 / 100', 'No reports'],
          ['LEADERSHIP', '4 events', 'Squad Leader'],
        ].map(([h, m, sub]) => (
          <div key={h} style={{
            padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ font: '500 8px "Space Grotesk"', color: 'rgba(255,255,255,.5)', letterSpacing: '.15em' }}>{h}</div>
              <div style={{ font: '700 14px "Space Grotesk"', color: W.bone, marginTop: 1 }}>{m}</div>
              <div style={{ font: '400 9px "Space Grotesk"', color: 'rgba(255,255,255,.45)' }}>{sub}</div>
            </div>
            <span style={{ color: 'rgba(255,255,255,.4)', font: '300 18px "Space Grotesk"' }}>›</span>
          </div>
        ))}
        <Note style={{ position: 'absolute', right: 10, top: 200, transform: 'rotate(-3deg)' }} color={W.gold}>
          dossier vibe
        </Note>
      </div>
    </Phone>
  );
}

Object.assign(window, { ProfileV1, ProfileV2, ProfileV3 });
