// Widgets used across the dashboard.
// Each is a self-contained component with its own glassmorphism shell.

const { useState, useEffect, useMemo, useRef } = React;

// ──────────────────────────────────────────── Reusable shell

function Panel({ title, kicker, right, children, className = '', dense = false, strong = false }) {
  return (
    <section className={`hud-corners rounded-lg ${strong ? 'glass-strong' : 'glass'} ${className}`}>
      <span className="hud-c1"></span><span className="hud-c2"></span>
      {(title || right) && (
        <header className={`flex items-center justify-between ${dense ? 'px-3 pt-2.5 pb-2' : 'px-4 pt-3 pb-2.5'}`}>
          <div className="flex items-baseline gap-2 min-w-0">
            {kicker && <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-rsi-300/80">{kicker}</span>}
            <h3 className="font-display text-[13px] font-semibold tracking-wider uppercase truncate">{title}</h3>
          </div>
          {right}
        </header>
      )}
      <div className={dense ? 'px-3 pb-3' : 'px-4 pb-4'}>{children}</div>
    </section>
  );
}

function StatRow({ icon, label, value, accent }) {
  const I = window.Icon[icon];
  return (
    <div className="flex items-center justify-between py-2 px-2.5 rounded-md hover:bg-white/[0.03] transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        {I && <I className="w-4 h-4 text-rsi-300/80 flex-none" />}
        <span className="text-[12.5px] text-white/70">{label}</span>
      </div>
      <span className={`font-mono text-[13px] font-semibold ${accent ? 'text-rsi-300' : 'text-white'}`}>{value}</span>
    </div>
  );
}

function Bar({ value, kind = 'rsi', className = '' }) {
  const fill = kind === 'warn' ? 'bar-fill-warn' : kind === 'crit' ? 'bar-fill-crit' : kind === 'ok' ? 'bar-fill-ok' : 'bar-fill';
  return (
    <div className={`bar-track ${className}`}>
      <div className={fill} style={{ width: `${Math.max(0, Math.min(100, value))}%` }}></div>
    </div>
  );
}

// ──────────────────────────────────────────── Server Status (centered glass overlay)

function ServerStatus() {
  const { SERVERS, PATCH } = window.SCData;
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => x+1), 5000); return () => clearInterval(t); }, []);

  return (
    <Panel title="Server Status" kicker="LIVE" strong
      right={<span className="chip chip-ok"><span className="dot dot-ok pulse-ring" style={{ color: '#00D17A' }}></span> Online</span>}
      className="w-[340px]"
      dense
    >
      <div className="space-y-1.5">
        {SERVERS.map(s => (
          <div key={s.region} className="flex items-center gap-3">
            <span className={`dot ${s.status === 'ok' ? 'dot-ok' : s.status === 'warn' ? 'dot-warn' : 'dot-crit'}`}></span>
            <span className="text-[12.5px] text-white/85 w-[90px] truncate">{s.region}</span>
            <div className="flex-1">
              <Bar value={s.load * 100} kind={s.status === 'crit' ? 'crit' : s.status === 'warn' ? 'warn' : 'rsi'} />
            </div>
            <span className="font-mono text-[11px] text-white/60 w-10 text-right">{s.ping}ms</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between">
        <div>
          <div className="cap">Build</div>
          <div className="font-mono text-[11.5px] text-white">{PATCH.version} <span className="text-rsi-300">{PATCH.branch}</span> <span className="text-white/40">· {PATCH.build}</span></div>
        </div>
        <button className="btn !py-1.5 !px-2.5 !text-[10px]"><Icon.Refresh className="w-3 h-3" /> Refresh</button>
      </div>
    </Panel>
  );
}

// ──────────────────────────────────────────── Hangar (right column card stack)

function HangarPanel({ activeShipId, onSelect }) {
  const { SHIPS } = window.SCData;
  const ship = SHIPS.find(s => s.id === activeShipId) || SHIPS[0];

  return (
    <Panel title="Hangar Übersicht" kicker="6 SHIPS" strong className="w-[300px]"
      right={<button className="btn !py-1.5 !px-2.5 !text-[10px]"><Icon.Plus className="w-3 h-3" /> Add</button>}
      dense
    >
      {/* active ship hero */}
      <div className="rounded-md ship-grid relative overflow-hidden border border-white/[0.08] mb-3" style={{ height: 96 }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon.Ship className="w-16 h-16 text-rsi-400/70" />
        </div>
        <div className="absolute top-2 left-2 chip">{ship.mfr}</div>
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div>
            <div className="font-display text-[12.5px] tracking-wider">{ship.name}</div>
            <div className="cap">{ship.role}</div>
          </div>
          <span className={`chip ${ship.status === 'Bereit' ? 'chip-ok' : ship.status === 'In Wartung' ? 'chip-warn' : 'chip-mute'}`}>{ship.status}</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <div>
          <div className="flex justify-between text-[11px] mb-1"><span className="text-white/55">Hülle</span><span className="font-mono text-white">{ship.hp}%</span></div>
          <Bar value={ship.hp} kind={ship.hp > 75 ? 'ok' : ship.hp > 40 ? 'warn' : 'crit'} />
        </div>
        <div>
          <div className="flex justify-between text-[11px] mb-1"><span className="text-white/55">Quantum Fuel</span><span className="font-mono text-white">{ship.fuel}%</span></div>
          <Bar value={ship.fuel} kind={ship.fuel > 50 ? 'rsi' : 'warn'} />
        </div>
        <div>
          <div className="flex justify-between text-[11px] mb-1"><span className="text-white/55">Schilde</span><span className="font-mono text-white">{ship.shields}%</span></div>
          <Bar value={ship.shields} kind="rsi" />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/[0.08]">
        <div className="cap mb-1.5">Schnellauswahl</div>
        <div className="flex flex-wrap gap-1.5">
          {SHIPS.map(s => (
            <button key={s.id}
              onClick={() => onSelect(s.id)}
              className={`px-2 py-1 rounded text-[10.5px] font-medium transition border
                ${s.id === ship.id ? 'bg-rsi-400/20 border-rsi-400 text-white' : 'bg-white/[0.03] border-white/10 text-white/65 hover:text-white hover:border-white/30'}`}>
              {s.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}

// ──────────────────────────────────────────── Trade Routes

function TradeRoutes() {
  const { TRADE_ROUTES } = window.SCData;
  const [sortBy, setSortBy] = useState('profit');

  const sorted = useMemo(() => {
    return [...TRADE_ROUTES].sort((a, b) => {
      if (sortBy === 'profit') return b.profit - a.profit;
      if (sortBy === 'risk')   return ({ low: 0, med: 1, high: 2 })[a.risk] - ({ low: 0, med: 1, high: 2 })[b.risk];
      return a.commodity.localeCompare(b.commodity);
    });
  }, [sortBy]);

  const max = Math.max(...TRADE_ROUTES.map(r => r.profit));

  return (
    <Panel title="Trade Routes" kicker="UEX · Live"
      right={
        <div className="flex gap-1 text-[10px]">
          {['profit', 'risk', 'name'].map(k =>
            <button key={k} onClick={() => setSortBy(k)}
              className={`px-2 py-1 rounded font-mono uppercase tracking-wider ${sortBy === k ? 'bg-rsi-400/20 text-rsi-300 border border-rsi-400/40' : 'text-white/50 hover:text-white border border-transparent'}`}>
              {k}
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-2">
        {sorted.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center py-1.5 px-2 rounded-md hover:bg-white/[0.03] group">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-[12px] tracking-wide text-white truncate">{r.commodity}</span>
                <span className={`chip ${r.risk === 'high' ? 'chip-crit' : r.risk === 'med' ? 'chip-warn' : 'chip-ok'} !text-[9px] !px-1.5 !py-0`}>{r.risk}</span>
              </div>
              <div className="text-[10.5px] text-white/50 mt-0.5 truncate">{r.from} → {r.to}</div>
            </div>
            <div className="w-24">
              <Bar value={(r.profit / max) * 100} kind={r.risk === 'high' ? 'warn' : 'rsi'} />
            </div>
            <div className="text-right">
              <div className="font-mono text-[12.5px] text-rsi-300 font-semibold">+{r.profit < 100 ? r.profit.toFixed(1) : r.profit.toLocaleString('de-DE')}</div>
              <div className="text-[9.5px] text-white/45 font-mono">aUEC/SCU · {r.scu}</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ──────────────────────────────────────────── Refinery Timer (live countdowns)

function RefineryTimer() {
  const { REFINERY } = window.SCData;
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  function fmt(ms) {
    if (ms <= 0) return 'Fertig';
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  }

  return (
    <Panel title="Refinery Jobs" kicker="Regolith"
      right={<span className="chip">{REFINERY.length} aktiv</span>}
    >
      <div className="space-y-3">
        {REFINERY.map(j => {
          const elapsed = now - j.started;
          const progress = Math.min(100, (elapsed / j.eta) * 100);
          const remaining = Math.max(0, j.eta - elapsed);
          const done = remaining === 0;
          return (
            <div key={j.id} className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5">
              <div className="flex items-start justify-between mb-1.5">
                <div className="min-w-0">
                  <div className="font-display text-[12px] tracking-wide truncate">{j.ore}</div>
                  <div className="text-[10px] text-white/45 truncate">{j.station} · {j.method}</div>
                </div>
                <div className="text-right flex-none ml-2">
                  <div className={`font-mono text-[13px] font-semibold ${done ? 'text-ok' : 'text-rsi-300'}`}>{fmt(remaining)}</div>
                  <div className="text-[9.5px] text-white/45 font-mono">{j.outputScu}/{j.inputScu} SCU · {j.costAuec.toLocaleString('de-DE')} aUEC</div>
                </div>
              </div>
              <Bar value={progress} kind={done ? 'ok' : 'rsi'} />
            </div>
          );
        })}
      </div>
      <button className="btn w-full justify-center mt-3 !text-[11px]"><Icon.Plus className="w-3.5 h-3.5" /> Neuer Refining Job</button>
    </Panel>
  );
}

// ──────────────────────────────────────────── Bounty Tracker

function BountyTracker() {
  const { BOUNTIES } = window.SCData;
  const [accepted, setAccepted] = useState(() => new Set(['b1']));

  function toggle(id) {
    setAccepted(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const total = [...accepted].reduce((sum, id) => sum + (BOUNTIES.find(b => b.id === id)?.reward || 0), 0);

  return (
    <Panel title="Bounty Tracker" kicker="Mission Manager"
      right={<span className="font-mono text-[11px] text-rsi-300">{total.toLocaleString('de-DE')} aUEC</span>}
    >
      <div className="space-y-2">
        {BOUNTIES.map(b => {
          const isOn = accepted.has(b.id);
          const diff = b.diff === 'hard' ? 'crit' : b.diff === 'med' ? 'warn' : 'ok';
          return (
            <button key={b.id} onClick={() => toggle(b.id)}
              className={`w-full text-left rounded-md p-2.5 border transition ${isOn ? 'bg-rsi-400/10 border-rsi-400/40' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/20'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`chip chip-${diff} !text-[9px] !px-1.5 !py-0`}>Tier {b.tier}</span>
                    <span className="font-display text-[12px] truncate">{b.target}</span>
                  </div>
                  <div className="text-[10.5px] text-white/50 mt-1">{b.faction} · {b.loc}</div>
                </div>
                <div className="text-right flex-none">
                  <div className={`font-mono text-[12px] font-semibold ${isOn ? 'text-rsi-300' : 'text-white/80'}`}>{b.reward.toLocaleString('de-DE')}</div>
                  <div className="text-[9.5px] text-white/40">aUEC</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

// ──────────────────────────────────────────── Watchlist (ships/prices)

function Watchlist() {
  const { WATCHLIST } = window.SCData;
  return (
    <Panel title="Schiff-Watchlist" kicker="Star Hangar · Pledge"
      right={<button className="btn !py-1 !px-2 !text-[10px]"><Icon.Plus className="w-3 h-3" /></button>}
    >
      <div className="space-y-1">
        {WATCHLIST.map((w, i) => (
          <div key={i} className="grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center py-1.5 px-2 rounded-md hover:bg-white/[0.03]">
            <Icon.Ship className="w-4 h-4 text-rsi-300/70" />
            <div className="min-w-0">
              <div className="font-display text-[12px] truncate">{w.ship}</div>
              <div className="text-[10px] text-white/45">{w.mfr}</div>
            </div>
            <div className={`font-mono text-[11px] font-semibold ${w.change > 0 ? 'text-ok' : w.change < 0 ? 'text-crit' : 'text-white/50'}`}>
              {w.change > 0 ? '+' : ''}{w.change}%
            </div>
            <div className="text-right">
              <div className="font-mono text-[12.5px] font-semibold">${w.price}</div>
              {w.alert && <span className="chip chip-warn !text-[9px] !px-1 !py-0 mt-0.5">Alert</span>}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ──────────────────────────────────────────── Active Events / Patch

function EventsPanel() {
  const { EVENTS, PATCH } = window.SCData;
  return (
    <Panel title="Aktive Events" kicker="PU · Stanton/Pyro">
      <div className="space-y-2 mb-3">
        {EVENTS.map((e, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-md bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`chip chip-${e.severity === 'high' ? 'crit' : 'warn'} !text-[9px] !px-1.5`}>{e.severity}</span>
              <div className="min-w-0">
                <div className="font-display text-[12px] truncate">{e.name}</div>
                <div className="text-[10px] text-white/45 truncate">{e.loc}</div>
              </div>
            </div>
            <div className="text-right flex-none">
              <div className="cap">Endet</div>
              <div className="font-mono text-[11.5px] text-rsi-300">{e.endsIn}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.08] pt-3">
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <div className="cap">Patch Highlights</div>
            <div className="font-display text-[12px]">{PATCH.version} {PATCH.branch} · {PATCH.released}</div>
          </div>
          <button className="btn !py-1 !px-2 !text-[10px]"><Icon.External className="w-3 h-3" /></button>
        </div>
        <ul className="text-[11px] text-white/60 space-y-0.5">
          {PATCH.highlights.map((h, i) => <li key={i} className="flex gap-1.5"><span className="text-rsi-400">›</span><span>{h}</span></li>)}
        </ul>
      </div>
    </Panel>
  );
}

// ──────────────────────────────────────────── Quick Actions

function QuickActions({ onLaunchTool }) {
  const actions = [
    { id: 'launcher', label: 'Game Launcher', icon: 'Play',     primary: true },
    { id: 'issue',    label: 'Bug Report',    icon: 'Bug'      },
    { id: 'refresh',  label: 'Refresh All',   icon: 'Refresh'  },
    { id: 'route',    label: 'Route planen',  icon: 'Map'      },
    { id: 'org',      label: 'Org-Chat',      icon: 'Comms'    },
  ];
  return (
    <Panel title="Quick Actions" kicker="Hotkeys · F1–F5" dense>
      <div className="grid grid-cols-5 gap-2">
        {actions.map((a, i) => {
          const I = window.Icon[a.icon];
          return (
            <button key={a.id} onClick={() => onLaunchTool && onLaunchTool(a.id)}
              className={`group relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-md border transition
                ${a.primary ? 'bg-gradient-to-b from-rsi-400 to-rsi-700 border-rsi-300 text-[#001626] shadow-[0_0_24px_rgba(0,180,255,0.4)]' : 'bg-white/[0.02] border-white/[0.06] hover:border-rsi-400 hover:bg-rsi-400/5'}`}>
              <I className="w-5 h-5" />
              <span className="text-[10px] font-medium uppercase tracking-wider">{a.label}</span>
              <span className="absolute top-1 right-1.5 font-mono text-[8.5px] opacity-50">F{i+1}</span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

Object.assign(window, { Panel, StatRow, Bar, ServerStatus, HangarPanel, TradeRoutes, RefineryTimer, BountyTracker, Watchlist, EventsPanel, QuickActions });
