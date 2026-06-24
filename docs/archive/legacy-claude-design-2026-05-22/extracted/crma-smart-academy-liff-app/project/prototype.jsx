// prototype.jsx — Shell + router + centered/scaled phone + Tweaks panel.

const TAB_ROUTES = ['home', 'calendar', 'todo', 'activity', 'service'];

// Routes that should highlight a specific tab when they're on the stack.
const ROUTE_PARENT_TAB = {
  home: 0, calendar: 1, todo: 2, activity: 3, service: 4,
  // Sub-screens — show whichever tab their entry-point lives under.
  profile: 0, class: 0, meal: 0, health: 0, report: 0,
};

const SCREEN_MAP = {
  home:     () => window.HomeScreen,
  profile:  () => window.ProfileScreen,
  class:    () => window.ClassScreen,
  meal:     () => window.MealScreen,
  health:   () => window.HealthScreen,
  report:   () => window.ReportScreen,
  calendar: () => window.CalendarScreen,
  todo:     () => window.TodoScreen,
  activity: () => window.ActivityScreen,
  service:  () => window.ServiceScreen,
};

// Persistent tweak defaults — host can rewrite this block on disk.
const TWEAKS = /*EDITMODE-BEGIN*/{
  "frame": "ios",
  "lang": "en",
  "theme": "light",
  "showHints": true
}/*EDITMODE-END*/;

function PrototypeApp() {
  const [stack, setStack] = React.useState(['home']);
  const current = stack[stack.length - 1];
  const tabIndex = ROUTE_PARENT_TAB[current] ?? 0;

  // Tweaks state — includes lang + theme
  const [tweaks, setTweaksState] = React.useState(TWEAKS);
  // Apply lang + theme on mount AND whenever they change. Bump a key to
  // force a full remount so every JSX subtree re-reads W.* from the
  // freshly-mutated palette.
  const [refreshKey, setRefreshKey] = React.useState(0);
  React.useEffect(() => {
    window.setLang(tweaks.lang);
    window.applyTheme(tweaks.theme);
    setRefreshKey(k => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tweaks.lang, tweaks.theme]);

  const setTweak = (key, value) => {
    const next = typeof key === 'object' ? { ...tweaks, ...key } : { ...tweaks, [key]: value };
    setTweaksState(next);
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: typeof key === 'object' ? key : { [key]: value } }, '*');
    } catch (e) { /* sandbox */ }
  };

  // Edit-mode toolbar bridge
  const [editOpen, setEditOpen] = React.useState(false);
  React.useEffect(() => {
    const handler = (e) => {
      if (!e.data) return;
      if (e.data.type === '__activate_edit_mode') setEditOpen(true);
      else if (e.data.type === '__deactivate_edit_mode') setEditOpen(false);
    };
    window.addEventListener('message', handler);
    try {
      window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    } catch (e) {}
    return () => window.removeEventListener('message', handler);
  }, []);

  const nav = {
    push: (route) => setStack(s => [...s, route]),
    back: () => setStack(s => s.length > 1 ? s.slice(0, -1) : s),
    tab: (i) => {
      const route = TAB_ROUTES[i];
      if (!route) return;
      // Reset to a fresh stack of that tab
      setStack([route]);
    },
    current,
    canBack: stack.length > 1,
  };

  const Screen = SCREEN_MAP[current] && SCREEN_MAP[current]();
  return (
    <ProtoStage key={refreshKey} theme={tweaks.theme}>
      <ProtoPhone
        variant={tweaks.frame}
        activeTab={tabIndex}
        onTabChange={nav.tab}
        stackDepth={stack.length}
      >
        {Screen ? <Screen nav={nav} /> : <div style={{ padding: 24 }}>Missing screen: {current}</div>}
      </ProtoPhone>
      {tweaks.showHints && stack.length === 1 && current === 'home' && (
        <HintOverlay onDismiss={() => setTweak('showHints', false)} theme={tweaks.theme} />
      )}
      {editOpen && <TweaksPanel tweaks={tweaks} setTweak={setTweak} onClose={() => {
        setEditOpen(false);
        try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
      }} />}
    </ProtoStage>
  );
}

// ----------------------------- Stage ---------------------------------------
function ProtoStage({ children, theme }) {
  const isDark = theme === 'dark';
  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: isDark
        ? 'radial-gradient(circle at 30% 20%, #1a2540 0%, #0a1224 70%)'
        : 'radial-gradient(circle at 30% 20%, #e9e3d2 0%, #cdc4ac 70%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', position: 'fixed', inset: 0,
    }}>
      {/* Subtle hatch */}
      <svg style={{ position: 'absolute', inset: 0, opacity: isDark ? .04 : .08, pointerEvents: 'none' }} width="100%" height="100%">
        <defs>
          <pattern id="stagehatch" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M22 0 L0 0 0 22" fill="none" stroke={isDark ? '#fff' : '#15203a'} strokeWidth=".5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stagehatch)" />
      </svg>
      {/* Title bar */}
      <div style={{
        position: 'absolute', top: 16, left: 16,
        color: isDark ? 'rgba(255,255,255,.5)' : 'rgba(20,32,58,.55)',
        font: '700 9px "Space Grotesk", sans-serif', letterSpacing: '.25em',
      }}>
        ⬢ CRMA SMART ACADEMY · LIFF PROTOTYPE
      </div>
      <div style={{
        position: 'absolute', top: 16, right: 16,
        color: isDark ? 'rgba(255,255,255,.4)' : 'rgba(20,32,58,.45)',
        font: '500 9px "Space Grotesk", sans-serif', letterSpacing: '.15em',
      }}>
        v1 · interactive
      </div>
      {children}
    </div>
  );
}

// ----------------------------- Phone w/ scale ------------------------------
function ProtoPhone({ variant, activeTab, onTabChange, children, stackDepth }) {
  // Compute scale based on viewport
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const recompute = () => {
      const W_TARGET = 320;
      const H_TARGET = 620;
      const sx = (window.innerWidth - 80) / W_TARGET;
      const sy = (window.innerHeight - 80) / H_TARGET;
      setScale(Math.min(1.6, Math.max(0.7, Math.min(sx, sy))));
    };
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, []);

  return (
    <div style={{
      transform: `scale(${scale})`,
      transformOrigin: 'center center',
      transition: 'transform .2s ease',
    }}>
      <Phone variant={variant} activeTab={activeTab} onTabChange={onTabChange}>
        {children}
      </Phone>
    </div>
  );
}

// ----------------------------- First-load hint ------------------------------
function HintOverlay({ onDismiss, theme }) {
  const isDark = theme === 'dark';
  return (
    <div style={{
      position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      padding: '10px 16px', borderRadius: 999,
      background: isDark ? 'rgba(20,25,40,.85)' : 'rgba(20,25,40,.9)',
      backdropFilter: 'blur(10px)',
      color: '#fff', font: '500 11px "Space Grotesk"', letterSpacing: '.05em',
      display: 'flex', alignItems: 'center', gap: 12,
      maxWidth: '90vw',
    }}>
      <span>👆 {tx({ th: 'แตะบริการด่วน · แถบนำทางล่าง · ข้อมูลบน — ทุกอย่างกดได้', en: 'Tap quick services, bottom nav, profile · all interactive' })}</span>
      <span onClick={onDismiss} style={{ cursor: 'pointer', opacity: .7, marginLeft: 4 }}>✕</span>
    </div>
  );
}

// ----------------------------- Tweaks Panel --------------------------------
function TweaksPanel({ tweaks, setTweak, onClose }) {
  const segGroup = (current, options, key) => (
    <div style={{ display: 'flex', gap: 4 }}>
      {options.map(v => (
        <div
          key={v.val}
          onClick={() => setTweak(key, v.val)}
          style={{
            flex: 1, padding: '6px 8px', borderRadius: 6, textAlign: 'center',
            background: current === v.val ? '#b8923a' : 'rgba(255,255,255,.06)',
            color: current === v.val ? '#15203a' : '#fff',
            font: `${current === v.val ? 700 : 500} 10px "Space Grotesk"`,
            cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '.05em',
            userSelect: 'none',
          }}
        >{v.label}</div>
      ))}
    </div>
  );
  return (
    <div style={{
      position: 'fixed', right: 16, top: 56,
      width: 260, padding: 14, borderRadius: 12,
      background: 'rgba(20,25,40,.92)', backdropFilter: 'blur(14px)',
      color: '#fff', boxShadow: '0 12px 36px rgba(0,0,0,.4)',
      font: '500 11px "Space Grotesk", sans-serif',
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <div>
          <div style={{ font: '700 9px "Space Grotesk"', color: '#b8923a', letterSpacing: '.2em' }}>TWEAKS</div>
          <div style={{ font: '700 13px Sarabun', marginTop: 1 }}>ปรับแต่ง</div>
        </div>
        <span onClick={onClose} style={{ cursor: 'pointer', opacity: .6 }}>✕</span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ font: '600 8px "Space Grotesk"', color: 'rgba(255,255,255,.5)', letterSpacing: '.15em', marginBottom: 6 }}>LANGUAGE · ภาษา</div>
        {segGroup(tweaks.lang, [{ val: 'en', label: 'EN' }, { val: 'th', label: 'TH · ไทย' }], 'lang')}
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ font: '600 8px "Space Grotesk"', color: 'rgba(255,255,255,.5)', letterSpacing: '.15em', marginBottom: 6 }}>THEME</div>
        {segGroup(tweaks.theme, [{ val: 'light', label: '☼ Light' }, { val: 'dark', label: '☾ Dark' }], 'theme')}
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ font: '600 8px "Space Grotesk"', color: 'rgba(255,255,255,.5)', letterSpacing: '.15em', marginBottom: 6 }}>DEVICE FRAME</div>
        {segGroup(tweaks.frame, [{ val: 'ios', label: 'iOS' }, { val: 'android', label: 'Android' }, { val: 'plain', label: 'Plain' }], 'frame')}
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ font: '600 8px "Space Grotesk"', color: 'rgba(255,255,255,.5)', letterSpacing: '.15em', marginBottom: 6 }}>SHOW HINT</div>
        <div
          onClick={() => setTweak('showHints', !tweaks.showHints)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 8px', borderRadius: 6,
            background: 'rgba(255,255,255,.06)', cursor: 'pointer',
          }}
        >
          <div style={{
            width: 32, height: 18, borderRadius: 9, padding: 2,
            background: tweaks.showHints ? '#3a8b5e' : 'rgba(255,255,255,.2)',
            display: 'flex', alignItems: 'center',
          }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%', background: '#fff',
              marginLeft: tweaks.showHints ? 14 : 0,
              transition: 'margin-left .15s',
            }} />
          </div>
          <span>{tweaks.showHints ? 'Visible' : 'Hidden'}</span>
        </div>
      </div>

      <div style={{
        padding: 8, borderRadius: 6, background: 'rgba(184,146,58,.1)',
        border: '1px solid rgba(184,146,58,.3)',
        font: '400 10px "Space Grotesk"', color: '#e8d9b3', lineHeight: 1.5,
      }}>
        Switch language anytime — every screen updates. Theme swap repaints all surfaces.
      </div>
    </div>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<PrototypeApp />);
