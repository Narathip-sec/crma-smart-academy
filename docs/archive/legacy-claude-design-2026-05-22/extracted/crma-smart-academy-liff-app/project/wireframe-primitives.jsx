// Shared wireframe primitives: phone shells, status bar, bottom nav,
// bilingual labels, sketchy boxes. Mid-fi grayscale-leaning, with sparing
// navy + crimson accents.

// ---------------------------- Palettes ----------------------------
// W is a mutable bag — applyTheme() copies one of these into it, and JSX
// re-reads W.* on every render so a theme swap + key bump is enough to
// repaint the whole app.
const LIGHT_PALETTE = {
  paper: '#fbfaf6',
  ink: '#15203a',
  ink2: '#3a4561',
  crimson: '#a8182a',
  gold: '#b8923a',
  bone: '#ece8de',
  bone2: '#dad4c5',
  gray: '#9c958a',
  gray2: '#6f6a60',
  rule: '#cdc6b7',
  shade: '#ebe7db',
  shade2: '#e3decf',
  stage: 'radial-gradient(circle at 30% 20%, #e9e3d2 0%, #cdc4ac 70%)',
  stageInk: 'rgba(20,32,58,.55)',
};

const DARK_PALETTE = {
  paper: '#131a2e',
  ink: '#f0eee9',
  ink2: '#c8cee0',
  crimson: '#e04654',
  gold: '#d4ad55',
  bone: '#1c2238',
  bone2: '#2a3149',
  gray: '#6a7188',
  gray2: '#9aa3bd',
  rule: '#2c344b',
  shade: '#1a2138',
  shade2: '#212942',
  stage: 'radial-gradient(circle at 30% 20%, #1a2540 0%, #0a1224 70%)',
  stageInk: 'rgba(255,255,255,.5)',
};

const W = { ...LIGHT_PALETTE };

function applyTheme(name) {
  const next = name === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
  Object.assign(W, next);
  if (typeof document !== 'undefined') {
    document.body.style.background = name === 'dark' ? '#0a1224' : '#cdc4ac';
  }
}

// ---------------------------- Language ----------------------------
function getLang() { return window.__lang || 'en'; }
function setLang(l) { window.__lang = l; }
// Pick the right string from a {th, en} bag. Falls back to whichever is present.
function tx(bag) {
  if (bag == null) return '';
  if (typeof bag === 'string') return bag;
  const lang = getLang();
  return bag[lang] ?? bag.en ?? bag.th ?? '';
}

// ---------------------------- Bilingual label ----------------------------
// Renders only the active language (no stacked TH/EN). Pass th + en — the
// component picks based on window.__lang.
function L({ th, en, style, size = 12, weight = 500, align = 'left', mono, color }) {
  const text = tx({ th, en });
  if (!text) return null;
  const fontStack = mono
    ? '"JetBrains Mono", ui-monospace, monospace'
    : '"Sarabun", "Space Grotesk", system-ui, sans-serif';
  return (
    <div style={{
      font: `${weight} ${size}px ${fontStack}`,
      color: color || W.ink,
      lineHeight: 1.25,
      textAlign: align,
      ...style,
    }}>
      {text}
    </div>
  );
}

// ---------------------------- Sketchy primitives ----------------------------
const Sketch = ({ children, style }) => (
  <div style={{ position: 'relative', ...style }}>{children}</div>
);

const Box = ({ w, h, label, dashed, fill = W.shade, border = W.rule, style, children, onClick }) => (
  <div
    onClick={onClick}
    style={{
      width: w,
      height: h,
      background: fill,
      border: `1px ${dashed ? 'dashed' : 'solid'} ${border}`,
      borderRadius: 6,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: W.gray2,
      font: '400 9px "Space Grotesk", sans-serif',
      letterSpacing: '.05em',
      textTransform: 'uppercase',
      flexShrink: 0,
      ...style,
    }}
  >
    {children ?? label}
  </div>
);

// Diagonal-hatch image placeholder
const Img = ({ w, h, label, style, dark, children }) => (
  <div
    style={{
      width: w,
      height: h,
      background: `repeating-linear-gradient(135deg, ${dark ? '#cbc4b3' : W.shade2} 0 6px, ${dark ? '#d9d3c2' : W.bone} 6px 12px)`,
      border: `1px solid ${W.rule}`,
      borderRadius: 8,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
      color: W.gray2,
      font: '500 9px "Space Grotesk", sans-serif',
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      padding: 6,
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
      ...style,
    }}
  >
    {/* corner X */}
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: .25, pointerEvents: 'none' }}>
      <line x1="0" y1="0" x2="100%" y2="100%" stroke={W.gray2} strokeWidth="0.6" />
      <line x1="100%" y1="0" x2="0" y2="100%" stroke={W.gray2} strokeWidth="0.6" />
    </svg>
    <span style={{ position: 'relative', zIndex: 1, background: 'rgba(251,250,246,.85)', padding: '1px 4px', borderRadius: 2 }}>
      {children ?? label}
    </span>
  </div>
);

const Line = ({ w = '60%', thickness = 1, color = W.rule, style }) => (
  <div style={{ width: w, height: thickness, background: color, ...style }} />
);

const Skel = ({ w, h = 8, style }) => (
  <div style={{ width: w, height: h, background: W.bone2, borderRadius: h / 2, ...style }} />
);

const Chip = ({ children, active, color = W.ink, style }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 8px',
      borderRadius: 999,
      border: `1px solid ${active ? color : W.rule}`,
      background: active ? color : 'transparent',
      color: active ? W.paper : W.ink2,
      font: '500 9px "Space Grotesk", sans-serif',
      letterSpacing: '.04em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

const Btn = ({ children, primary, style, w }) => (
  <div
    style={{
      width: w,
      padding: '8px 12px',
      borderRadius: 6,
      background: primary ? W.ink : 'transparent',
      border: primary ? 'none' : `1px solid ${W.ink}`,
      color: primary ? W.paper : W.ink,
      font: '600 11px "Space Grotesk", sans-serif',
      letterSpacing: '.05em',
      textTransform: 'uppercase',
      textAlign: 'center',
      ...style,
    }}
  >
    {children}
  </div>
);

// Annotation in handwriting font — used for designer notes
const Note = ({ children, style, arrow, color = W.crimson }) => (
  <div
    style={{
      font: '500 11px "Caveat", "Architects Daughter", cursive',
      color,
      lineHeight: 1.15,
      ...style,
    }}
  >
    {arrow && <span style={{ marginRight: 4 }}>↳</span>}
    {children}
  </div>
);

// ---------------------------- Phone shells ----------------------------
// Common screen interior dims: 280 x 560.
const SCREEN_W = 280;
const SCREEN_H = 560;

function StatusBar({ variant = 'ios', dark }) {
  const color = dark ? '#f5f3ef' : W.ink;
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: variant === 'ios' ? '0 18px' : '0 14px',
        color,
        font: '600 10px "Space Grotesk", sans-serif',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <span>{variant === 'ios' ? '9:41' : '09:41'}</span>
      {variant === 'ios' ? (
        <div style={{
          position: 'absolute',
          top: 6,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 70,
          height: 18,
          background: '#000',
          borderRadius: 20,
        }} />
      ) : (
        <div style={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 8,
          height: 8,
          background: '#000',
          borderRadius: '50%',
        }} />
      )}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {/* signal bars */}
        <svg width="13" height="9" viewBox="0 0 13 9">
          <rect x="0" y="6" width="2" height="3" fill={color} />
          <rect x="3" y="4" width="2" height="5" fill={color} />
          <rect x="6" y="2" width="2" height="7" fill={color} />
          <rect x="9" y="0" width="2" height="9" fill={color} />
        </svg>
        {/* battery */}
        <svg width="18" height="9" viewBox="0 0 18 9">
          <rect x="0.5" y="0.5" width="14" height="8" rx="1.5" fill="none" stroke={color} strokeWidth="0.8" />
          <rect x="2" y="2" width="11" height="5" fill={color} />
          <rect x="15" y="3" width="1.5" height="3" fill={color} />
        </svg>
      </div>
    </div>
  );
}

// BottomNav — 5 tabs: Home, Calendar, To-do, Activity, Service
const NAV = [
  { th: 'หน้าหลัก', en: 'Home', icon: 'home' },
  { th: 'ปฏิทิน', en: 'Calendar', icon: 'cal' },
  { th: 'งาน', en: 'To-do-list', icon: 'check' },
  { th: 'กิจกรรม', en: 'Activity', icon: 'flag' },
  { th: 'บริการ', en: 'Service', icon: 'grid' },
];

function NavIcon({ kind, color }) {
  const s = { fill: 'none', stroke: color, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (kind) {
    case 'home':
      return <svg width="20" height="20" viewBox="0 0 24 24"><path {...s} d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1V11z" /></svg>;
    case 'cal':
      return <svg width="20" height="20" viewBox="0 0 24 24"><rect {...s} x="3" y="5" width="18" height="16" rx="2" /><path {...s} d="M3 9h18M8 3v4M16 3v4" /></svg>;
    case 'check':
      return <svg width="20" height="20" viewBox="0 0 24 24"><path {...s} d="M9 11l3 3 7-7" /><path {...s} d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>;
    case 'flag':
      return <svg width="20" height="20" viewBox="0 0 24 24"><path {...s} d="M4 21V4M4 4h12l-2 4 2 4H4" /></svg>;
    case 'grid':
      return <svg width="20" height="20" viewBox="0 0 24 24"><rect {...s} x="3" y="3" width="7" height="7" /><rect {...s} x="14" y="3" width="7" height="7" /><rect {...s} x="3" y="14" width="7" height="7" /><rect {...s} x="14" y="14" width="7" height="7" /></svg>;
  }
}

function BottomNav({ active = 0, variant = 'ios', onTabChange }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: variant === 'android' ? 64 : 56,
        background: W.paper,
        borderTop: `1px solid ${W.rule}`,
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: 8,
        paddingBottom: variant === 'ios' ? 14 : 6,
        zIndex: 4,
      }}
    >
      {NAV.map((n, i) => (
        <div
          key={n.en}
          onClick={() => onTabChange && onTabChange(i)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            color: i === active ? W.crimson : W.gray2,
            cursor: onTabChange ? 'pointer' : 'default',
            userSelect: 'none',
          }}
        >
          <NavIcon kind={n.icon} color={i === active ? W.crimson : W.gray2} />
          <div style={{ font: `${i === active ? 600 : 500} 8px "Space Grotesk", Sarabun, sans-serif`, letterSpacing: getLang() === 'th' ? 0 : '.04em' }}>
            {getLang() === 'th' ? n.th : n.en.toUpperCase()}
          </div>
        </div>
      ))}
      {/* iOS home indicator */}
      {variant === 'ios' && (
        <div style={{
          position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)',
          width: 100, height: 4, borderRadius: 2, background: W.ink,
        }} />
      )}
      {/* Android 3-button */}
      {variant === 'android' && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 22,
          background: '#0c1320', display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        }}>
          <div style={{ width: 10, height: 10, border: `1.2px solid ${W.bone}`, borderRadius: 1 }} />
          <div style={{ width: 11, height: 11, border: `1.2px solid ${W.bone}`, borderRadius: '50%' }} />
          <div style={{ width: 10, height: 2, background: W.bone }} />
        </div>
      )}
    </div>
  );
}

// Phone shell. variant: ios | android | plain
function Phone({ variant = 'ios', activeTab = 0, dark, noNav, noStatus, children, headerLabel, onTabChange }) {
  const radius = variant === 'ios' ? 36 : variant === 'android' ? 22 : 10;
  const bezel = variant === 'plain' ? 1 : 8;
  const screenH = SCREEN_H;
  return (
    <div
      style={{
        width: SCREEN_W + bezel * 2,
        height: screenH + bezel * 2,
        background: variant === 'plain' ? 'transparent' : '#0c1320',
        borderRadius: radius,
        padding: bezel,
        boxShadow: variant === 'plain' ? 'none' : '0 4px 18px rgba(20,25,40,.18), inset 0 0 0 1px rgba(255,255,255,.05)',
        position: 'relative',
      }}
    >
      {/* Variant chip — top right of bezel */}
      {variant !== 'plain' && (
        <div style={{
          position: 'absolute',
          top: -16,
          right: 4,
          font: '500 8px "Space Grotesk", sans-serif',
          color: W.gray2,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
        }}>
          {variant === 'ios' ? '⌘ iOS' : '⌬ Android'}
        </div>
      )}
      {headerLabel && (
        <div style={{
          position: 'absolute',
          top: -16,
          left: 8,
          font: '500 9px "Space Grotesk", sans-serif',
          color: W.ink,
          letterSpacing: '.06em',
        }}>
          {headerLabel}
        </div>
      )}
      <div
        style={{
          width: SCREEN_W,
          height: screenH,
          background: dark ? '#101a2e' : W.paper,
          borderRadius: radius - bezel,
          overflow: 'hidden',
          position: 'relative',
          color: dark ? W.bone : W.ink,
        }}
      >
        {!noStatus && <StatusBar variant={variant === 'plain' ? 'ios' : variant} dark={dark} />}
        <div
          style={{
            position: 'absolute',
            top: noStatus ? 0 : 28,
            left: 0,
            right: 0,
            bottom: noNav ? 0 : (variant === 'android' ? 64 : 56),
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
        {!noNav && <BottomNav active={activeTab} variant={variant === 'plain' ? 'ios' : variant} onTabChange={onTabChange} />}
      </div>
    </div>
  );
}

// AppBar inside a phone screen
function AppBar({ th, en, right, back, onBack, style }) {
  return (
    <div style={{
      height: 44,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '0 14px',
      borderBottom: `1px solid ${W.rule}`,
      background: W.paper,
      ...style,
    }}>
      {back && (
        <div
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 24, height: 24, marginLeft: -6,
            cursor: onBack ? 'pointer' : 'default',
            borderRadius: 6,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={W.ink} strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </div>
      )}
      <div style={{ flex: 1 }}>
        <L th={th} en={en} size={13} weight={600} />
      </div>
      {right}
    </div>
  );
}

// Make available everywhere
Object.assign(window, {
  W, L, tx, applyTheme, getLang, setLang,
  LIGHT_PALETTE, DARK_PALETTE,
  Sketch, Box, Img, Line, Skel, Chip, Btn, Note,
  Phone, AppBar, StatusBar, BottomNav, NavIcon,
  SCREEN_W, SCREEN_H, NAV,
});
