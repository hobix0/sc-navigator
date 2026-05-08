// Main App — top bar, sidebar, hero, widget rows, tools grid, tweaks panel.

const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "blur": 22,
  "background": "stanton",
  "dark": true
}/*EDITMODE-END*/;

const BACKGROUNDS = {
  stanton:  { label: 'Stanton (Hurston)', url: 'https://images.unsplash.com/photo-1457364887197-9150188c107b?auto=format&fit=crop&w=2400&q=80' },
  nebula:   { label: 'Pyro Nebula',       url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2400&q=80' },
  station:  { label: 'Orbital Station',   url: 'https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?auto=format&fit=crop&w=2400&q=80' },
  surface:  { label: 'Planet Surface',    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=2400&q=80' },
  none:     { label: 'Reines Sternenfeld',url: '' },
};

// ─────────────── Top bar

function TopBar({ tab, setTab, query, setQuery }) {
  const tabs = [
    { id: 'overview', label: 'Übersicht' },
    { id: 'tools',    label: 'Tools' },
    { id: 'trade',    label: 'Trade' },
    { id: 'mining',   label: 'Mining' },
    { id: 'fleet',    label: 'Schiffe' },
  ];
  const now = new Date();
  return (
    <header className="glass-strong rounded-lg px-4 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-9 h-9 rounded-md flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, #00B4FF, #0078B5)', boxShadow: '0 0 24px rgba(0,180,255,0.45), inset 0 1px 0 rgba(255,255,255,0.4)' }}>
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#001626]" fill="currentColor"><path d="M3 12h7l2-9 2 9h7l-6 5 2 7-5-4-5 4 2-7z"/></svg>
        </div>
        <div className="leading-tight">
          <div className="font-display text-[14px] font-bold tracking-[0.2em] glow">SC NAVIGATOR</div>
          <div className="cap">Citizen Command Hub</div>
        </div>
      </div>

      {/* Tabs (centered) */}
      <nav className="hidden md:flex items-center gap-1 bg-white/[0.02] rounded-lg p-1 border border-white/[0.06]">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`tab ${tab === t.id ? 'tab-active' : ''}`}>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Right cluster */}
      <div className="flex items-center gap-2">
        <div className="hidden lg:flex relative">
          <Icon.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tools, Schiffe, Routen…" className="field w-[220px] pl-9 !py-2" />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[9.5px] tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">⌘K</span>
        </div>
        <button className="btn !p-2"><Icon.Bell className="w-4 h-4" /></button>
        <button className="btn !p-2 relative">
          <Icon.Comms className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-crit"></span>
        </button>
        <div className="hidden lg:flex flex-col items-end leading-tight font-mono text-[10px] px-2 border-l border-white/10 ml-1">
          <span className="text-rsi-300 tracking-wider">{now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} UTC</span>
          <span className="text-white/40">SET 2954.04</span>
        </div>
        <div className="w-9 h-9 rounded-md flex-none border border-rsi-400/40 bg-gradient-to-br from-rsi-400/30 to-rsi-700/30 flex items-center justify-center font-display text-[11px] font-bold text-white">DA</div>
      </div>
    </header>
  );
}

// ─────────────── Sidebar

function Sidebar({ section, setSection }) {
  const items = [
    { id: 'status',  label: 'Status',     icon: 'Status' },
    { id: 'tools',   label: 'Tools',      icon: 'Tools' },
    { id: 'trade',   label: 'Trade',      icon: 'Trade' },
    { id: 'mining',  label: 'Mining',     icon: 'Mining' },
    { id: 'hangar',  label: 'Hangar',     icon: 'Hangar' },
    { id: 'bounty',  label: 'Bounties',   icon: 'Bounty' },
    { id: 'watch',   label: 'Watchlist',  icon: 'Watch' },
    { id: 'org',     label: 'Org',        icon: 'Org' },
  ];
  return (
    <aside className="glass rounded-lg p-2 w-[160px] flex-none self-start sticky top-[78px]">
      <div className="cap px-2 pt-1.5 pb-2">Navigation</div>
      <nav className="space-y-0.5">
        {items.map(it => {
          const I = window.Icon[it.icon];
          return (
            <a key={it.id} href={`#${it.id}`}
              onClick={() => setSection(it.id)}
              className={`sb-item ${section === it.id ? 'active' : ''}`}>
              <I className="sb-icon" />
              <span>{it.label}</span>
            </a>
          );
        })}
      </nav>
      <div className="border-t border-white/[0.08] mt-2 pt-2">
        <a href="#settings" className="sb-item">
          <Icon.Settings className="sb-icon" />
          <span>Settings</span>
        </a>
      </div>
      <div className="cap px-2 pt-3 pb-1.5">Org · IRONFLEET</div>
      <div className="px-2 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="dot dot-ok"></span>
          <span className="text-[11px]">42 online</span>
        </div>
        <div className="cap mt-0.5">3 in Op</div>
      </div>
    </aside>
  );
}

// ─────────────── Hero

function Hero({ activeShipId, setActiveShipId }) {
  return (
    <section className="relative">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="cap mb-1.5">⟁ STANTON SYSTEM · 4.0.1 LIVE</div>
          <h1 className="font-display text-[44px] leading-none font-bold tracking-tight glow-soft">Citizen Command Hub</h1>
          <p className="text-white/55 text-[13.5px] mt-2 max-w-[520px]">Alle Tools, Routen und Hangar-Daten in einem Cockpit. Master the &apos;verse, drive the convoy, chase the bounty.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip"><span className="dot dot-ok pulse-ring" style={{ color: '#00D17A' }}></span>RSI Auth · OK</span>
          <span className="chip chip-warn">PTU 4.1 verfügbar</span>
        </div>
      </div>

      {/* Hero overlay row: Sidebar (separate), main hero with center stat & right hangar */}
      <div className="grid grid-cols-[1fr_auto] gap-5 items-start min-h-[420px]">
        {/* Center: ship-grid playground with center server-status floating card */}
        <div className="relative rounded-xl border border-white/[0.08] overflow-hidden ship-grid scanlines"
             style={{ minHeight: 420, background: 'linear-gradient(180deg, rgba(10,18,36,0.4), rgba(3,6,14,0.65))' }}>
          {/* large ship silhouette placeholder */}
          <svg viewBox="0 0 800 420" className="absolute inset-0 w-full h-full opacity-[0.55]" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="sh" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"  stopColor="#0078B5" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="#001E33" stopOpacity="0.3"/>
              </linearGradient>
              <radialGradient id="thrust" cx="0.05" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#FFB020" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#FF4D4D" stopOpacity="0"/>
              </radialGradient>
            </defs>
            {/* hull */}
            <path d="M120 220 L260 170 L520 165 L640 200 L700 220 L640 240 L520 245 L260 250 L120 220 Z" fill="url(#sh)" stroke="#00B4FF" strokeOpacity="0.5"/>
            <path d="M260 170 L320 130 L480 130 L520 165 Z" fill="url(#sh)" stroke="#00B4FF" strokeOpacity="0.5"/>
            <path d="M260 250 L320 285 L480 285 L520 245 Z" fill="url(#sh)" stroke="#00B4FF" strokeOpacity="0.5"/>
            <circle cx="380" cy="155" r="6" fill="#00B4FF" opacity="0.8"/>
            <circle cx="430" cy="155" r="4" fill="#00B4FF" opacity="0.6"/>
            {/* engine glow */}
            <ellipse cx="125" cy="220" rx="80" ry="14" fill="url(#thrust)"/>
            {/* HUD reticle marks */}
            <g stroke="#00B4FF" strokeOpacity="0.35" fill="none" strokeWidth="1">
              <circle cx="380" cy="210" r="160"/>
              <line x1="380" y1="20" x2="380" y2="60"/>
              <line x1="380" y1="360" x2="380" y2="400"/>
              <line x1="120" y1="210" x2="160" y2="210"/>
              <line x1="600" y1="210" x2="640" y2="210"/>
            </g>
          </svg>

          {/* labels */}
          <div className="absolute top-3 left-3 chip">VESSEL · {(window.SCData.SHIPS.find(s => s.id === activeShipId) || window.SCData.SHIPS[0]).name}</div>
          <div className="absolute top-3 right-3 chip chip-mute font-mono">⌖ 380.21 / 210.55 · ALT 12.4km</div>
          <div className="absolute bottom-3 left-3 cap">⟁ Konvoi-Ankunft 00:14:22 · Quantum Bereit</div>
          <div className="absolute bottom-3 right-3 chip chip-ok">Schilde 100%</div>

          {/* Center floating server status */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <ServerStatus />
          </div>
        </div>

        {/* Right: Hangar */}
        <HangarPanel activeShipId={activeShipId} onSelect={setActiveShipId} />
      </div>
    </section>
  );
}

// ─────────────── Ticker

function Ticker() {
  const items = [
    'aUEC/SCU Laranite ARC-L1→CRU-L1 +306',
    'XenoThreat aktiv · Pyro · 4d 12h',
    'Patch 4.1 PTU verfügbar',
    'Drake Corsair −15% bei Star Hangar',
    'Quantanium HUR-L2 → 9.410 aUEC/SCU',
    'Server Meshing Replication: stable',
    'Org IRONFLEET: 3 Operationen aktiv',
    'Issue Council: 218 neue Reports diese Woche',
  ];
  return (
    <div className="glass rounded-md py-2 px-1 overflow-hidden">
      <div className="marquee-track text-[11px] font-mono text-white/65">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-3">
            <span className="text-rsi-400">▸</span>{t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────── Tweaks

function MyTweaks({ t, setTweak }) {
  return (
    <TweaksPanel title="SC Navigator">
      <TweakSection label="Darstellung" />
      <TweakToggle  label="Dark Mode"           value={t.dark}  onChange={v => setTweak('dark', v)} />
      <TweakSlider  label="Glass-Blur"          value={t.blur}  min={0} max={48} step={1} unit="px"
                                                onChange={v => setTweak('blur', v)} />
      <TweakSection label="Hintergrund" />
      <TweakSelect  label="Ship Render"
                    value={t.background}
                    options={Object.entries(BACKGROUNDS).map(([k, v]) => ({ value: k, label: v.label }))}
                    onChange={v => setTweak('background', v)} />
    </TweaksPanel>
  );
}

// ─────────────── App

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = useStateA('overview');
  const [section, setSection] = useStateA('status');
  const [activeShipId, setActiveShipId] = useStateA('connie');
  const [query, setQuery] = useStateA('');

  // Apply tweaks
  useEffectA(() => {
    document.documentElement.style.setProperty('--blur', t.blur + 'px');
  }, [t.blur]);
  useEffectA(() => {
    document.body.classList.toggle('light', !t.dark);
  }, [t.dark]);
  useEffectA(() => {
    const url = BACKGROUNDS[t.background]?.url || '';
    const bg = document.getElementById('bg-image');
    if (bg) {
      bg.style.backgroundImage = url ? `url('${url}')` : 'none';
      bg.style.opacity = url ? (t.dark ? 0.55 : 0.18) : 0;
    }
  }, [t.background, t.dark]);

  // Filtered tools by global search
  const matchingTools = useMemoA(() => {
    if (!query.trim()) return [];
    const ql = query.toLowerCase();
    return window.SCData.TOOLS.filter(x => x.name.toLowerCase().includes(ql) || x.desc.toLowerCase().includes(ql)).slice(0, 5);
  }, [query]);

  return (
    <div className="min-h-screen p-4 md:p-5 max-w-[1600px] mx-auto">
      <TopBar tab={tab} setTab={setTab} query={query} setQuery={setQuery} />

      {/* Global search results overlay */}
      {query && matchingTools.length > 0 && (
        <div className="glass-strong rounded-lg p-3 mt-2 border-rsi-400/30">
          <div className="cap mb-2">Globale Suche · Tools</div>
          <div className="space-y-1">
            {matchingTools.map(m => (
              <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/[0.04]">
                <div className="flex items-center gap-2"><Icon.Tools className="w-3.5 h-3.5 text-rsi-300" /><span className="text-[12.5px]">{m.name}</span><span className="cap">{m.cat}</span></div>
                <Icon.External className="w-3.5 h-3.5 text-white/40" />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-5">
        <Sidebar section={section} setSection={setSection} />

        <main className="flex-1 min-w-0 space-y-6">
          {/* Hero */}
          <div id="status" data-screen-label="01 Status"><Hero activeShipId={activeShipId} setActiveShipId={setActiveShipId} /></div>

          <Ticker />

          {/* Quick Actions */}
          <QuickActions />

          {/* Section header */}
          <div id="trade" data-screen-label="02 Trade & Mining" className="sec-h"><span>⟁</span><span>Operations</span><div className="line"></div></div>

          {/* Trade / Mining / Bounty row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <TradeRoutes />
            <RefineryTimer />
            <BountyTracker />
          </div>

          {/* Tools section header */}
          <div id="tools" data-screen-label="03 Tools" className="sec-h"><span>⟁</span><span>Tool Verzeichnis</span><div className="line"></div></div>

          <ToolGrid />

          {/* Watchlist + Events */}
          <div id="watch" data-screen-label="04 Watch & Events" className="sec-h"><span>⟁</span><span>Markt &amp; Universum</span><div className="line"></div></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Watchlist />
            <EventsPanel />
          </div>

          {/* Footer */}
          <footer className="pt-6 pb-4 text-center cap">
            SC Navigator · inoffizielles Fan-Dashboard · Daten zu Demo-Zwecken
          </footer>
        </main>
      </div>

      <MyTweaks t={t} setTweak={setTweak} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
