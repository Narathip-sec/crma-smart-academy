// MEAL / CALORIE AI — 3 variations
// V1: Daily meals cards w/ AI banner (iOS)
// V2: Calorie ring + AI chat composer (Android)
// V3: "Tray" — tap items, AI computes (iOS)

function MealV1() {
  const meals = [
    { th: 'อาหารเช้า', en: 'Breakfast', t: '06:30', kcal: 620, items: ['ข้าวต้ม', 'หมูสับ', 'นมถั่วเหลือง'] },
    { th: 'อาหารกลางวัน', en: 'Lunch', t: '12:00', kcal: 920, items: ['ข้าวผัด', 'ไข่ดาว', 'ผักรวม', 'ส้ม'], extras: [{ n: 'น้ำเก๊กฮวย', src: 'canteen', kcal: 90, baht: 15 }] },
    { th: 'อาหารเย็น', en: 'Dinner', t: '18:00', kcal: 780, items: ['ข้าว', 'แกงเขียวหวาน', 'ผัดผัก'] },
  ];
  return (
    <Phone variant="ios">
      <div style={{ height: '100%', overflow: 'auto' }}>
        <AppBar back th="โรงเลี้ยง" en="Mess Hall" right={<Chip>+ ADD</Chip>} />
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
            <L th="คุณต้องการ 3,200 kCal" en="Target 3,200 kcal · PT day" size={11} weight={700} style={{ color: W.paper }} />
            <div style={{ font: '400 9px "Space Grotesk"', color: 'rgba(255,255,255,.7)', marginTop: 2 }}>+ protein 140g · hydrate 3L</div>
          </div>
          <span style={{ color: 'rgba(255,255,255,.5)', font: '300 18px "Space Grotesk"' }}>›</span>
        </div>

        {/* Day progress bar */}
        <div style={{ padding: '10px 14px 4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ font: '500 9px "Space Grotesk"', color: W.gray2 }}>วันนี้ · 2,410 / 3,200</span>
            <span style={{ font: '700 9px "Space Grotesk"', color: W.crimson }}>75%</span>
          </div>
          <div style={{ height: 6, background: W.bone, borderRadius: 3 }}>
            <div style={{ width: '75%', height: '100%', background: W.crimson, borderRadius: 3 }} />
          </div>
        </div>

        {/* Meal cards */}
        <div style={{ padding: '6px 14px 8px' }}>
          {meals.map((m, i) => (
            <div key={i} style={{
              marginTop: 8, padding: 10, background: W.paper,
              border: `1px solid ${W.rule}`, borderRadius: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <L th={m.th} en={`${m.en} · ${m.t}`} size={11} weight={700} />
                <div>
                  <span style={{ font: '700 14px "Space Grotesk"', color: W.ink }}>{m.kcal + (m.extras ? m.extras.reduce((s, e) => s + e.kcal, 0) : 0)}</span>
                  <span style={{ font: '500 8px "Space Grotesk"', color: W.gray2, marginLeft: 2 }}>kcal</span>
                </div>
              </div>
              {/* Standard mess hall items */}
              <div style={{ font: '500 7px "Space Grotesk"', color: W.gray2, letterSpacing: '.15em', marginTop: 8 }}>MESS HALL</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                {m.items.map(it => <Chip key={it}>{it}</Chip>)}
              </div>
              {/* User-logged extras */}
              {m.extras && (
                <>
                  <div style={{ font: '500 7px "Space Grotesk"', color: W.crimson, letterSpacing: '.15em', marginTop: 8 }}>ซื้อเพิ่ม · CANTEEN</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                    {m.extras.map(e => (
                      <Chip key={e.n} active color={W.crimson}>
                        + {e.n} · {e.kcal}kcal · ฿{e.baht}
                      </Chip>
                    ))}
                  </div>
                </>
              )}
              {/* Add purchase action */}
              <div style={{
                marginTop: 8, padding: '6px 8px',
                border: `1px dashed ${W.rule}`, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                font: '500 9px "Space Grotesk"', color: W.gray2,
              }}>
                <span>+ บันทึกที่ซื้อเพิ่ม / Log purchase</span>
                <span style={{ color: W.ink }}>📷 🔍</span>
              </div>
            </div>
          ))}
        </div>

        {/* Today's spend summary */}
        <div style={{
          margin: '0 14px 14px', padding: '8px 10px',
          background: W.shade, borderRadius: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ font: '500 8px "Space Grotesk"', color: W.gray2, letterSpacing: '.1em' }}>CANTEEN SPEND · TODAY</div>
            <div style={{ font: '700 14px "Space Grotesk"', color: W.ink, marginTop: 2 }}>฿ 15 <span style={{ font: '400 9px "Space Grotesk"', color: W.gray2 }}>· 1 item</span></div>
          </div>
          <Chip>view history</Chip>
        </div>
      </div>
    </Phone>
  );
}

function MealV2() {
  return (
    <Phone variant="android">
      <div style={{ height: '100%', overflow: 'auto', background: '#f6f3ec' }}>
        <AppBar back th="คำนวณแคลอรี" en="Calorie AI" />
        {/* big ring */}
        <div style={{ padding: '14px 14px 0', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 150, height: 150, margin: '0 auto' }}>
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="62" fill="none" stroke={W.bone2} strokeWidth="10" />
              <circle cx="75" cy="75" r="62" fill="none" stroke={W.crimson} strokeWidth="10"
                strokeDasharray={`${Math.PI * 62 * 2 * 0.72} 999`} transform="rotate(-90 75 75)" strokeLinecap="round" />
              <circle cx="75" cy="75" r="48" fill="none" stroke={W.bone2} strokeWidth="6" />
              <circle cx="75" cy="75" r="48" fill="none" stroke={W.ink} strokeWidth="6"
                strokeDasharray={`${Math.PI * 48 * 2 * 0.58} 999`} transform="rotate(-90 75 75)" strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ font: '700 30px "Space Grotesk"', color: W.ink }}>2,320</div>
              <div style={{ font: '500 9px "Space Grotesk"', color: W.gray2 }}>/ 3,200 kcal</div>
            </div>
          </div>
          {/* macro pills */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}>
            {[['P', '120/140g', W.crimson], ['C', '280/400g', W.ink], ['F', '70/90g', W.gold]].map(([k, v, c]) => (
              <div key={k} style={{
                padding: '4px 10px', borderRadius: 999, border: `1px solid ${c}`,
                font: '500 9px "Space Grotesk"', color: c,
              }}><b>{k}</b> · {v}</div>
            ))}
          </div>
        </div>

        {/* AI chat composer */}
        <div style={{ padding: '14px 12px 0' }}>
          <L th="ถาม AI โค้ช" en="Ask AI Coach" size={10} weight={700} style={{ marginBottom: 6 }} />
          {/* sample bubbles */}
          <div style={{ padding: 8, background: W.paper, border: `1px solid ${W.rule}`, borderRadius: 8 }}>
            <div style={{ font: '500 9px Sarabun', color: W.ink2, marginBottom: 6 }}>
              <span style={{ color: W.gold, fontWeight: 700 }}>AI · </span>
              วันนี้ฝึก PT แนะนำ +500 kcal และโปรตีน 30g หลังฝึก
            </div>
            <Line w="100%" />
            <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Chip>+ Tuna sandwich</Chip>
              <Chip>+ Whey shake</Chip>
              <Chip>+ Banana</Chip>
            </div>
          </div>
          {/* input */}
          <div style={{
            marginTop: 8, display: 'flex', gap: 6, alignItems: 'center',
            padding: '8px 10px', background: W.paper, border: `1px solid ${W.rule}`, borderRadius: 999,
          }}>
            <span style={{ font: '500 9px "Space Grotesk"', color: W.gray2, flex: 1 }}>"ฉันควรกินอะไรหลังฝึก?"</span>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', background: W.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: W.paper, font: '700 10px sans-serif',
            }}>↑</div>
          </div>
        </div>
        <div style={{ height: 14 }} />
      </div>
    </Phone>
  );
}

function MealV3() {
  // Tray view — visual food items, tap to add
  return (
    <Phone variant="ios">
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <AppBar back th="ถาดอาหาร" en="Build Your Tray" />
        {/* Hero tray */}
        <div style={{ padding: '12px 14px 0' }}>
          <div style={{
            position: 'relative',
            padding: 12,
            background: W.shade,
            border: `2px dashed ${W.gray}`,
            borderRadius: 14,
            minHeight: 130,
            display: 'flex', flexWrap: 'wrap', gap: 6, alignContent: 'flex-start',
          }}>
            {[
              { e: '🍚', n: 'ข้าว', k: 220 },
              { e: '🍳', n: 'ไข่ดาว', k: 90 },
              { e: '🥬', n: 'ผัก', k: 40 },
              { e: '🍗', n: 'ไก่ย่าง', k: 280 },
            ].map((f, i) => (
              <div key={i} style={{
                padding: '6px 10px', background: W.paper, border: `1px solid ${W.rule}`,
                borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4,
                font: '500 10px Sarabun',
              }}>
                <span style={{ font: '500 14px sans-serif' }}>{f.e}</span>
                <span>{f.n}</span>
                <span style={{ color: W.gray2, font: '500 8px "Space Grotesk"' }}>{f.k}</span>
                <span style={{ color: W.crimson }}>×</span>
              </div>
            ))}
            <div style={{
              position: 'absolute', right: 10, bottom: 10,
              padding: '6px 10px', background: W.ink, color: W.paper,
              borderRadius: 999, font: '700 11px "Space Grotesk"',
            }}>630 kcal</div>
          </div>
        </div>

        {/* AI verdict */}
        <div style={{ margin: '10px 14px 0', padding: '8px 10px', background: '#fff8e8', border: `1px solid ${W.gold}`, borderRadius: 8 }}>
          <div style={{ font: '700 9px "Space Grotesk"', color: W.gold, letterSpacing: '.1em' }}>AI VERDICT</div>
          <div style={{ font: '500 10px Sarabun', color: W.ink, marginTop: 2 }}>
            โปรตีนพอเพียง แต่ขาดคาร์บก่อนฝึก เพิ่มกล้วย 1 ลูก
          </div>
        </div>

        {/* Picker */}
        <div style={{ padding: '12px 14px 14px', overflow: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <L th="เมนูวันนี้" en="Today's Menu" size={10} weight={700} />
            <div style={{ display: 'flex', gap: 4 }}>
              <Chip active color={W.ink}>All</Chip><Chip>Protein</Chip><Chip>Carbs</Chip>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {[
              { e: '🥗', n: 'สลัด', k: 110 },
              { e: '🍜', n: 'ก๋วยเตี๋ยว', k: 380 },
              { e: '🍱', n: 'เบนโตะ', k: 540 },
              { e: '🍌', n: 'กล้วย', k: 90 },
              { e: '🥛', n: 'นม', k: 150 },
              { e: '🍎', n: 'แอปเปิล', k: 80 },
            ].map((f, i) => (
              <div key={i} style={{
                padding: 8, background: W.paper, border: `1px solid ${W.rule}`, borderRadius: 8,
                textAlign: 'center',
              }}>
                <div style={{ font: '400 20px sans-serif' }}>{f.e}</div>
                <div style={{ font: '500 9px Sarabun', color: W.ink, marginTop: 2 }}>{f.n}</div>
                <div style={{ font: '500 8px "Space Grotesk"', color: W.gray2 }}>{f.k} kcal</div>
                <div style={{
                  marginTop: 4, padding: '2px 0', borderRadius: 4,
                  background: W.shade, font: '700 9px "Space Grotesk"', color: W.ink,
                }}>+ ADD</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Phone>
  );
}

Object.assign(window, { MealV1, MealV2, MealV3 });
