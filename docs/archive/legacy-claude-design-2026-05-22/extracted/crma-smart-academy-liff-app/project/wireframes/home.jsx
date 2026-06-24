// HOME — 3 variations
// V1: Classic LIFF home (iOS)
// V2: Mission Brief — daily briefing reframe (Android)
// V3: Command Deck — split dossier + unified stream (iOS)

// ---------- V1: Classic ----------
function HomeV1() {
  return (
    <Phone variant="ios" activeTab={0}>
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Profile banner */}
        <div style={{
          margin: '8px 12px 0', padding: 12, borderRadius: 10,
          background: W.shade, border: `1px solid ${W.rule}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', background: W.bone2,
            border: `1px solid ${W.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            font: '600 11px "Space Grotesk"', color: W.gray2,
          }}>2LT</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <L th="ร.ต. ภูริ พัฒน์" en="2LT Puri Phat" size={12} weight={700} />
            <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
              <Chip>Cadet</Chip>
              <Chip>Y4</Chip>
              <Chip color={W.crimson}>2LT</Chip>
            </div>
          </div>
          <div style={{ color: W.gray2, font: '300 18px "Space Grotesk"' }}>›</div>
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

        {/* Quick services 2x2 */}
        <div style={{ padding: '12px 12px 0' }}>
          <L th="บริการด่วน" en="Quick Services" size={11} weight={600} style={{ marginBottom: 6 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              { th: 'ตารางเรียน', en: 'Class', icon: '📚' },
              { th: 'อาหาร', en: 'Meal', icon: '🍱' },
              { th: 'สุขภาพ AI', en: 'Health AI', icon: '❤' },
              { th: 'แจ้งซ่อม', en: 'Report', icon: '🛠' },
            ].map(s => (
              <div key={s.en} style={{
                background: W.paper, border: `1px solid ${W.rule}`, borderRadius: 8,
                padding: '10px 10px', display: 'flex', alignItems: 'center', gap: 8,
              }}>
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
            <div style={{ paddingBottom: 6 }}>
              <L th="กิจกรรม" en="Events" size={10} weight={500} />
            </div>
          </div>
          {[1, 2].map(i => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Img w={56} h={48} />
              <div style={{ flex: 1 }}>
                <Skel w="100%" h={8} />
                <Skel w="80%" h={6} style={{ marginTop: 4 }} />
                <Skel w="40%" h={5} style={{ marginTop: 6 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

// ---------- V2: Mission Brief (Android) ----------
function HomeV2() {
  return (
    <Phone variant="android" activeTab={0}>
      <div style={{ height: '100%', overflow: 'hidden', background: '#f6f3ec' }}>
        {/* Dense date+briefing hero */}
        <div style={{
          background: W.ink, color: W.paper, padding: '14px 14px 18px',
          borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ font: '500 9px "Space Grotesk"', opacity: .7, letterSpacing: '.1em' }}>WED · 21 MAY 2026</div>
              <div style={{ font: '700 17px Sarabun, sans-serif', marginTop: 2 }}>สวัสดี ร.ต. ภูริ</div>
              <div style={{ font: '300 11px "Space Grotesk"', opacity: .7 }}>Good morning, 2LT Puri</div>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: `1.5px solid ${W.gold}`, background: 'rgba(255,255,255,.06)',
            }} />
          </div>
          {/* Today metrics row */}
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            {[
              { lbl: 'PFT', val: 'A−', sub: 'Today' },
              { lbl: 'kCal', val: '2.4k', sub: 'Target' },
              { lbl: 'Classes', val: '5', sub: 'Today' },
              { lbl: 'Tasks', val: '3', sub: 'Pending' },
            ].map(m => (
              <div key={m.lbl} style={{
                flex: 1, padding: '7px 6px', background: 'rgba(255,255,255,.06)',
                borderRadius: 6, border: '1px solid rgba(255,255,255,.08)',
              }}>
                <div style={{ font: '500 7px "Space Grotesk"', opacity: .6, letterSpacing: '.08em' }}>{m.lbl.toUpperCase()}</div>
                <div style={{ font: '700 14px "Space Grotesk"', marginTop: 1 }}>{m.val}</div>
                <div style={{ font: '400 7px "Space Grotesk"', opacity: .5 }}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal services */}
        <div style={{ padding: '10px 0 0 12px' }}>
          <L th="ดำเนินการด่วน" en="Quick Action" size={10} weight={600} style={{ marginBottom: 6 }} />
          <div style={{ display: 'flex', gap: 6, overflow: 'hidden' }}>
            {[
              { th: 'ตาราง', en: 'Class' },
              { th: 'อาหาร', en: 'Meal' },
              { th: 'AI', en: 'Health' },
              { th: 'ซ่อม', en: 'Fix' },
              { th: 'เกรด', en: 'Grades' },
            ].map(s => (
              <div key={s.en} style={{
                background: W.paper, border: `1px solid ${W.rule}`, borderRadius: 999,
                padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 5,
                flexShrink: 0,
              }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: W.shade2 }} />
                <L th={s.th} en={s.en} size={9} weight={600} />
              </div>
            ))}
          </div>
        </div>

        {/* Featured */}
        <div style={{ padding: '12px 12px 0' }}>
          <Img w="100%" h={90} label="Featured · Hero" />
          <div style={{ marginTop: 8, padding: '8px 10px', background: W.paper, borderRadius: 8, border: `1px solid ${W.rule}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <L th="พิธีสวนสนาม" en="Parade Ceremony" size={10} weight={700} />
              <Chip color={W.crimson} active>NEW</Chip>
            </div>
            <Skel w="70%" h={5} style={{ marginTop: 6 }} />
          </div>
        </div>

        {/* World news rail */}
        <div style={{ padding: '12px 0 0 12px' }}>
          <L th="ข่าวโลก" en="World" size={10} weight={600} style={{ marginBottom: 6 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            <Img w={90} h={64} />
            <Img w={90} h={64} />
            <Img w={90} h={64} />
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ---------- V3: Command Deck (iOS) — split dossier + unified stream ----------
function HomeV3() {
  return (
    <Phone variant="ios" activeTab={0}>
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* DOSSIER header */}
        <div style={{
          padding: '10px 14px 12px',
          background: `linear-gradient(180deg, ${W.shade} 0%, ${W.paper} 100%)`,
          borderBottom: `1px solid ${W.rule}`,
          position: 'relative',
        }}>
          {/* corner marks */}
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <path d="M8 8 L8 18 M8 8 L18 8" stroke={W.crimson} strokeWidth="1" fill="none" />
            <path d="M272 8 L272 18 M272 8 L262 8" stroke={W.crimson} strokeWidth="1" fill="none" />
          </svg>
          <div style={{ font: '500 8px "Space Grotesk"', color: W.crimson, letterSpacing: '.2em' }}>
            DOSSIER · 24/05/2026
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 6, alignItems: 'flex-start' }}>
            <div style={{
              width: 56, height: 70,
              background: W.bone, border: `1px solid ${W.rule}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              font: '600 9px "Space Grotesk"', color: W.gray2,
            }}>PORTRAIT</div>
            <div style={{ flex: 1 }}>
              <L th="พัฒน์, ภูริ" en="PHAT, PURI" size={14} weight={700} />
              <div style={{ height: 1, background: W.ink, margin: '4px 0 4px', width: 40 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px', font: '400 9px "Space Grotesk"', color: W.ink2 }}>
                <span>RANK</span><span style={{ color: W.crimson, fontWeight: 700 }}>2LT</span>
                <span>YEAR</span><span>IV</span>
                <span>BN</span><span>2</span>
                <span>ID</span><span>67-0421</span>
              </div>
            </div>
            <div style={{ color: W.gray2, font: '300 22px "Space Grotesk"' }}>›</div>
          </div>
        </div>

        {/* Unified stream — pills mark type */}
        <div style={{ flex: 1, overflow: 'auto', padding: '10px 12px' }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
            <Chip active color={W.ink}>All</Chip>
            <Chip>News</Chip>
            <Chip>Event</Chip>
            <Chip>Order</Chip>
            <Chip>World</Chip>
          </div>
          {/* feed items */}
          {[
            { type: 'ORDER', th: 'พลศึกษา 07:00', tone: W.crimson, img: false },
            { type: 'NEWS', th: 'ผบ.รร. ตรวจเยี่ยม', tone: W.ink, img: true },
            { type: 'EVENT', th: 'CRMA Run 2026', tone: W.gold, img: true },
            { type: 'WORLD', th: 'Reuters · ASEAN summit', tone: W.gray2, img: false },
          ].map((c, i) => (
            <div key={i} style={{
              display: 'flex', gap: 8, padding: '8px 0',
              borderBottom: i < 3 ? `1px solid ${W.rule}` : 'none',
            }}>
              <div style={{
                width: 3, alignSelf: 'stretch', background: c.tone, borderRadius: 1,
              }} />
              {c.img && <Img w={48} h={48} />}
              <div style={{ flex: 1 }}>
                <div style={{ font: '500 8px "Space Grotesk"', color: c.tone, letterSpacing: '.1em' }}>{c.type}</div>
                <L th={c.th} size={11} weight={600} style={{ marginTop: 2 }} />
                <Skel w="60%" h={5} style={{ marginTop: 4 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Quick services as floating action strip — replaces fixed grid */}
        <div style={{
          margin: '0 12px 8px',
          padding: '8px 10px', borderRadius: 999,
          background: W.ink, color: W.paper,
          display: 'flex', gap: 4, justifyContent: 'space-between',
        }}>
          {['CLASS', 'MEAL', 'HEALTH', 'FIX'].map(s => (
            <div key={s} style={{ font: '600 9px "Space Grotesk"', letterSpacing: '.08em', padding: '2px 6px' }}>{s}</div>
          ))}
        </div>
        <Note style={{ position: 'absolute', right: 16, top: 90, transform: 'rotate(-4deg)' }}>
          unified feed — no tabs
        </Note>
      </div>
    </Phone>
  );
}

Object.assign(window, { HomeV1, HomeV2, HomeV3 });
