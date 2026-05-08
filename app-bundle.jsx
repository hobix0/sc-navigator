// SC Navigator — modern minimal aesthetic.
// Single bundle file (avoids babel multi-file race conditions).

const { useState, useEffect, useMemo } = React;

// ──────────────────────────────────────── Reusable shell

function Panel({ title, sub, right, children, className = '', dense = false, strong = false }) {
  return (
    <section className={`${strong ? 'glass-strong' : 'glass'} ${className}`}>
      {(title || right) && (
        <header className={`flex items-center justify-between gap-3 ${dense ? 'px-4 pt-3.5 pb-3' : 'px-5 pt-4 pb-3.5'}`}>
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold tracking-tight truncate">{title}</h3>
            {sub && <p className="text-[12px] text-white/50 mt-0.5 truncate">{sub}</p>}
          </div>
          {right && <div className="flex items-center gap-2 flex-none">{right}</div>}
        </header>
      )}
      <div className={dense ? 'px-4 pb-4' : 'px-5 pb-5'}>{children}</div>
    </section>
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

// ──────────────────────────────────────── Server Status

function ServerStatus() {
  const { SERVERS, PATCH } = window.SCData;

  return (
    <Panel title="Server Status" sub="Live · alle Regionen" strong dense
      right={<span className="chip chip-ok"><span className="dot dot-ok"></span>Online</span>}
    >
      <div className="space-y-2">
        {SERVERS.map(s => (
          <div key={s.region} className="flex items-center gap-3">
            <span className={`dot ${s.status === 'ok' ? 'dot-ok' : s.status === 'warn' ? 'dot-warn' : 'dot-crit'} flex-none`}></span>
            <span className="text-[13px] text-white/85 w-[88px] flex-none truncate">{s.region}</span>
            <div className="flex-1 min-w-[60px]">
              <Bar value={s.load * 100} kind={s.status === 'crit' ? 'crit' : s.status === 'warn' ? 'warn' : 'rsi'} />
            </div>
            <span className="font-mono text-[11.5px] text-white/55 w-12 text-right tabular-nums">{s.ping}ms</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
        <div className="text-[12px] text-white/55">
          Build <span className="font-mono text-white/85 ml-0.5">{PATCH.version}</span>
          <span className="mx-1.5 text-white/30">·</span>
          <span className="text-white/85">{PATCH.branch}</span>
        </div>
        <button className="btn !py-1 !px-2 !text-[11px]"><Icon.Refresh className="w-3 h-3" />Aktualisieren</button>
      </div>
    </Panel>
  );
}

// ──────────────────────────────────────── Hangar

function HangarPanel({ activeShipId, onSelect }) {
  const { SHIPS } = window.SCData;
  const ship = SHIPS.find(s => s.id === activeShipId) || SHIPS[0];

  return (
    <Panel title="Hangar" sub={`${SHIPS.length} Schiffe`} strong dense
      right={<button className="btn !py-1 !px-2 !text-[11px]"><Icon.Plus className="w-3 h-3" />Hinzufügen</button>}
    >
      <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] mb-3 overflow-hidden">
        <div className="aspect-[16/9] flex items-center justify-center bg-gradient-to-br from-white/[0.04] to-transparent">
          <Icon.Ship className="w-12 h-12 text-white/30" />
        </div>
        <div className="px-3 py-2.5 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-[13.5px] font-semibold truncate">{ship.name}</div>
            <div className="text-[11.5px] text-white/50 mt-0.5">{ship.mfr} · {ship.role}</div>
          </div>
          <span className={`chip ${ship.status === 'Bereit' ? 'chip-ok' : ship.status === 'In Wartung' ? 'chip-warn' : 'chip-mute'}`}>{ship.status}</span>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { label: 'Hülle',         value: ship.hp,      kind: ship.hp > 75 ? 'ok' : ship.hp > 40 ? 'warn' : 'crit' },
          { label: 'Quantum Fuel',  value: ship.fuel,    kind: ship.fuel > 50 ? 'rsi' : 'warn' },
          { label: 'Schilde',       value: ship.shields, kind: 'rsi' },
        ].map(r => (
          <div key={r.label}>
            <div className="flex justify-between text-[12px] mb-1.5">
              <span className="text-white/55">{r.label}</span>
              <span className="font-mono text-white/85 tabular-nums">{r.value}%</span>
            </div>
            <Bar value={r.value} kind={r.kind} />
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3.5 border-t border-white/[0.06]">
        <div className="cap mb-2">Schnellauswahl</div>
        <div className="flex flex-wrap gap-1.5">
          {SHIPS.map(s => (
            <button key={s.id} onClick={() => onSelect(s.id)}
              className={`px-2.5 py-1 rounded-md text-[11.5px] transition border
                ${s.id === ship.id ? 'bg-accent-500/15 border-accent-500/40 text-white' : 'bg-white/[0.03] border-white/[0.07] text-white/65 hover:text-white hover:border-white/20'}`}>
              {s.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}

// ──────────────────────────────────────── Trade Routes

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
    <Panel title="Top Trade Routen" sub="UEXcorp · Live"
      right={
        <div className="flex gap-0.5 p-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
          {[['profit', 'Profit'], ['risk', 'Risiko'], ['name', 'Name']].map(([k, lbl]) =>
            <button key={k} onClick={() => setSortBy(k)}
              className={`px-2 py-1 rounded text-[11px] transition ${sortBy === k ? 'bg-white/[0.07] text-white' : 'text-white/50 hover:text-white'}`}>
              {lbl}
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-1">
        {sorted.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center py-2 px-2 rounded-md hover:bg-white/[0.03]">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-white truncate">{r.commodity}</span>
                <span className={`chip ${r.risk === 'high' ? 'chip-crit' : r.risk === 'med' ? 'chip-warn' : 'chip-ok'}`}>{r.risk === 'high' ? 'hoch' : r.risk === 'med' ? 'mittel' : 'niedrig'}</span>
              </div>
              <div className="text-[11.5px] text-white/45 mt-0.5 truncate">{r.from} → {r.to}</div>
            </div>
            <div className="w-20 hidden sm:block">
              <Bar value={(r.profit / max) * 100} kind={r.risk === 'high' ? 'warn' : 'rsi'} />
            </div>
            <div className="text-right tabular-nums">
              <div className="font-mono text-[13px] text-emerald-400 font-semibold">+{r.profit < 100 ? r.profit.toFixed(1) : r.profit.toLocaleString('de-DE')}</div>
              <div className="text-[10.5px] text-white/40">aUEC/SCU</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ──────────────────────────────────────── Refinery Timer

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
    <Panel title="Refinery Jobs" sub="Regolith Co."
      right={<span className="chip">{REFINERY.length} aktiv</span>}
    >
      <div className="space-y-3">
        {REFINERY.map(j => {
          const elapsed = now - j.started;
          const progress = Math.min(100, (elapsed / j.eta) * 100);
          const remaining = Math.max(0, j.eta - elapsed);
          const done = remaining === 0;
          return (
            <div key={j.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate">{j.ore}</div>
                  <div className="text-[11px] text-white/45 truncate mt-0.5">{j.station} · {j.method}</div>
                </div>
                <div className="text-right flex-none">
                  <div className={`font-mono text-[13.5px] font-semibold tabular-nums ${done ? 'text-emerald-400' : 'text-white'}`}>{fmt(remaining)}</div>
                  <div className="text-[10.5px] text-white/45 font-mono">{j.outputScu}/{j.inputScu} SCU</div>
                </div>
              </div>
              <Bar value={progress} kind={done ? 'ok' : 'rsi'} />
            </div>
          );
        })}
      </div>
      <button className="btn w-full justify-center mt-3"><Icon.Plus className="w-3.5 h-3.5" />Neuer Job</button>
    </Panel>
  );
}

// ──────────────────────────────────────── Bounty Tracker

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
    <Panel title="Bounty Missionen" sub={`${accepted.size} angenommen`}
      right={<span className="font-mono text-[12px] text-emerald-400 tabular-nums">{total.toLocaleString('de-DE')} aUEC</span>}
    >
      <div className="space-y-2">
        {BOUNTIES.map(b => {
          const isOn = accepted.has(b.id);
          const diff = b.diff === 'hard' ? 'crit' : b.diff === 'med' ? 'warn' : 'ok';
          return (
            <button key={b.id} onClick={() => toggle(b.id)}
              className={`w-full text-left rounded-lg p-3 border transition ${isOn ? 'bg-accent-500/8 border-accent-500/30' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/15'}`}
              style={isOn ? { background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.3)' } : null}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`chip chip-${diff}`}>Tier {b.tier}</span>
                    <span className="text-[13px] font-medium truncate">{b.target}</span>
                  </div>
                  <div className="text-[11.5px] text-white/50 mt-1">{b.faction} · {b.loc}</div>
                </div>
                <div className="text-right flex-none">
                  <div className={`font-mono text-[12.5px] font-semibold tabular-nums ${isOn ? 'text-white' : 'text-white/80'}`}>{b.reward.toLocaleString('de-DE')}</div>
                  <div className="text-[10px] text-white/40">aUEC</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

// ──────────────────────────────────────── Watchlist

function Watchlist() {
  const { WATCHLIST } = window.SCData;
  return (
    <Panel title="Schiff-Watchlist" sub="Star Hangar · Pledge Store"
      right={<button className="btn !py-1 !px-2 !text-[11px]"><Icon.Plus className="w-3 h-3" /></button>}
    >
      <div className="space-y-1">
        {WATCHLIST.map((w, i) => (
          <div key={i} className="grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center py-2 px-2 rounded-md hover:bg-white/[0.03]">
            <div className="w-8 h-8 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-none">
              <Icon.Ship className="w-4 h-4 text-white/55" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] truncate">{w.ship}</div>
              <div className="text-[11px] text-white/45">{w.mfr}</div>
            </div>
            <div className={`font-mono text-[11.5px] font-medium tabular-nums ${w.change > 0 ? 'text-emerald-400' : w.change < 0 ? 'text-red-400' : 'text-white/40'}`}>
              {w.change > 0 ? '+' : ''}{w.change}%
            </div>
            <div className="text-right tabular-nums">
              <div className="font-mono text-[13px] font-semibold">${w.price}</div>
              {w.alert && <div className="text-[10px] text-amber-400/80">Alert aktiv</div>}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ──────────────────────────────────────── Events / Patch

function EventsPanel() {
  const { EVENTS, PATCH } = window.SCData;
  return (
    <Panel title="Aktive Events &amp; Patch" sub={`${PATCH.version} ${PATCH.branch} · ${PATCH.released}`}>
      <div className="space-y-2 mb-4">
        {EVENTS.map((e, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-3 min-w-0">
              <span className={`chip chip-${e.severity === 'high' ? 'crit' : 'warn'}`}>{e.severity === 'high' ? 'hoch' : 'mittel'}</span>
              <div className="min-w-0">
                <div className="text-[13px] font-medium truncate">{e.name}</div>
                <div className="text-[11.5px] text-white/45 truncate">{e.loc}</div>
              </div>
            </div>
            <div className="text-right flex-none">
              <div className="cap">Endet in</div>
              <div className="font-mono text-[12px] text-white">{e.endsIn}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.06] pt-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[12.5px] font-medium">Patch Highlights</div>
          <button className="text-[11.5px] text-white/55 hover:text-white inline-flex items-center gap-1">
            Alle Notes <Icon.External className="w-3 h-3" />
          </button>
        </div>
        <ul className="text-[12.5px] text-white/65 space-y-1.5">
          {PATCH.highlights.map((h, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-white/30 mt-0.5">·</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

// ──────────────────────────────────────── Quick Actions

function QuickActions() {
  const actions = [
    { id: 'launcher', label: 'Game Launcher', icon: 'Play',     primary: true },
    { id: 'issue',    label: 'Bug Report',    icon: 'Bug'      },
    { id: 'route',    label: 'Route planen',  icon: 'Map'      },
    { id: 'org',      label: 'Org-Chat',      icon: 'Comms'    },
    { id: 'refresh',  label: 'Daten neu laden', icon: 'Refresh'  },
  ];
  return (
    <Panel title="Schnellzugriff" sub="Häufig genutzte Aktionen" dense>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {actions.map((a) => {
          const I = window.Icon[a.icon];
          return (
            <button key={a.id}
              className={`flex items-center gap-2.5 py-2.5 px-3 rounded-lg border text-left transition
                ${a.primary
                  ? 'bg-accent-500 border-accent-500 text-white hover:bg-accent-600'
                  : 'bg-white/[0.02] border-white/[0.06] text-white/80 hover:bg-white/[0.05] hover:border-white/15 hover:text-white'}`}
              style={a.primary ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' } : null}>
              <I className="w-4 h-4 flex-none" />
              <span className="text-[12.5px] font-medium truncate">{a.label}</span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

// ──────────────────────────────────────── Tool Card + Grid

function ToolCard({ tool, isFav, onFav }) {
  const I = window.Icon[tool.icon] || window.Icon.Tools;
  return (
    <a href={tool.url} target="_blank" rel="noopener noreferrer"
       className="tool-card glass p-4 block group relative">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center border border-white/[0.07]"
             style={{ background: `${tool.color}14` }}>
          <I className="w-4.5 h-4.5" style={{ width: 18, height: 18, color: tool.color }} />
        </div>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFav(tool.id); }}
          className="p-1.5 -m-1.5 text-white/30 hover:text-amber-400 transition"
          aria-label="Favorit">
          {isFav ? <Icon.StarFill className="w-4 h-4 text-amber-400" /> : <Icon.Star className="w-4 h-4" />}
        </button>
      </div>

      <div className="text-[14px] font-semibold mb-1.5 tracking-tight">{tool.name}</div>
      <p className="text-[12.5px] text-white/55 leading-relaxed mb-3 line-clamp-2 min-h-[2.8em]">{tool.desc}</p>

      <div className="flex items-center justify-between">
        <span className="chip">{tool.tag}</span>
        <span className="flex items-center gap-1 text-[11.5px] text-white/40 group-hover:text-white transition">
          öffnen <Icon.External className="w-3 h-3" />
        </span>
      </div>
    </a>
  );
}

function ToolGrid() {
  const { TOOLS, TOOL_CATS } = window.SCData;

  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Alle');
  const [sort, setSort] = useState('popular');
  const [favOnly, setFavOnly] = useState(false);
  const [favs, setFavs] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('sc-nav.favs') || '[]')); } catch (e) { return new Set(); }
  });

  useEffect(() => { localStorage.setItem('sc-nav.favs', JSON.stringify([...favs])); }, [favs]);

  function toggleFav(id) {
    setFavs(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const filtered = useMemo(() => {
    let list = TOOLS;
    if (cat !== 'Alle') list = list.filter(t => t.cat === cat);
    if (favOnly) list = list.filter(t => favs.has(t.id));
    if (q.trim()) {
      const ql = q.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(ql) ||
        t.desc.toLowerCase().includes(ql) ||
        t.tag.toLowerCase().includes(ql) ||
        t.cat.toLowerCase().includes(ql));
    }
    if (sort === 'popular')   list = [...list].sort((a, b) => b.popularity - a.popularity);
    else if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'cat')  list = [...list].sort((a, b) => a.cat.localeCompare(b.cat) || a.name.localeCompare(b.name));
    return list;
  }, [q, cat, sort, favOnly, favs]);

  return (
    <Panel title="Tool-Verzeichnis" sub={`${filtered.length} von ${TOOLS.length} sichtbar`} strong
      right={
        <button onClick={() => setFavOnly(v => !v)}
          className={`btn !py-1.5 !px-2.5 !text-[11.5px] ${favOnly ? '!text-amber-400' : ''}`}
          style={favOnly ? { borderColor: 'rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.08)' } : null}>
          <Icon.Star className="w-3.5 h-3.5" /> Favoriten ({favs.size})
        </button>
      }
    >
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Icon.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Tools durchsuchen…"
            className="field w-full pl-9" />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className="field !text-[12.5px]">
          <option value="popular">Beliebt</option>
          <option value="name">Name (A–Z)</option>
          <option value="cat">Kategorie</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {TOOL_CATS.map(c => {
          const count = c === 'Alle' ? TOOLS.length : TOOLS.filter(t => t.cat === c).length;
          const active = cat === c;
          return (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium border transition flex items-center gap-1.5
                ${active
                  ? 'bg-white/[0.06] border-white/15 text-white'
                  : 'bg-transparent border-white/[0.07] text-white/55 hover:text-white hover:border-white/15'}`}>
              {c} <span className="font-mono text-[10.5px] opacity-50">{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-white/40 text-[13px]">
          <Icon.Search className="w-7 h-7 mx-auto mb-2 opacity-40" />
          Keine Tools gefunden.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
          {filtered.map(t => <ToolCard key={t.id} tool={t} isFav={favs.has(t.id)} onFav={toggleFav} />)}
        </div>
      )}
    </Panel>
  );
}

// ──────────────────────────────────────── Top bar

function TopBar({ tab, setTab, query, setQuery }) {
  const tabs = [
    { id: 'overview', label: 'Übersicht' },
    { id: 'tools',    label: 'Tools' },
    { id: 'trade',    label: 'Trade' },
    { id: 'mining',   label: 'Mining' },
    { id: 'fleet',    label: 'Schiffe' },
  ];
  return (
    <header className="glass-strong px-4 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-40">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-7-7 18-2-9z"/></svg>
        </div>
        <div className="leading-tight">
          <div className="text-[14px] font-semibold tracking-tight">SC Navigator</div>
          <div className="text-[11.5px] text-white/45">Citizen Command Hub</div>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-0.5 bg-white/[0.03] rounded-lg p-1 border border-white/[0.06]">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`tab ${tab === t.id ? 'tab-active' : ''}`}>
            {t.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <div className="hidden lg:flex relative">
          <Icon.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Schnell suchen…"
            className="field w-[220px] pl-9 !py-2" />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/45 border border-white/10">⌘K</span>
        </div>
        <button className="btn !p-2"><Icon.Bell className="w-4 h-4" /></button>
        <button className="btn !p-2 relative">
          <Icon.Comms className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500"></span>
        </button>
        <div className="w-8 h-8 rounded-lg flex-none border border-white/10 bg-white/[0.04] flex items-center justify-center text-[11.5px] font-semibold">DA</div>
      </div>
    </header>
  );
}

// ──────────────────────────────────────── Sidebar

function Sidebar({ section, setSection }) {
  const items = [
    { id: 'status',  label: 'Übersicht',  icon: 'Status' },
    { id: 'tools',   label: 'Tools',      icon: 'Tools' },
    { id: 'trade',   label: 'Trade',      icon: 'Trade' },
    { id: 'mining',  label: 'Mining',     icon: 'Mining' },
    { id: 'hangar',  label: 'Hangar',     icon: 'Hangar' },
    { id: 'bounty',  label: 'Bounties',   icon: 'Bounty' },
    { id: 'watch',   label: 'Watchlist',  icon: 'Watch' },
    { id: 'org',     label: 'Org',        icon: 'Org' },
  ];
  return (
    <aside className="glass p-2 w-[180px] flex-none self-start sticky top-[78px]">
      <div className="cap px-2.5 pt-1.5 pb-2">Navigation</div>
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
      <div className="border-t border-white/[0.06] mt-2 pt-2">
        <a href="#settings" className="sb-item">
          <Icon.Settings className="sb-icon" />
          <span>Einstellungen</span>
        </a>
      </div>
      <div className="cap px-2.5 pt-3.5 pb-1.5">Org · IRONFLEET</div>
      <div className="px-2.5 py-2 rounded-md bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="dot dot-ok"></span>
          <span className="text-[12px]">42 online</span>
        </div>
        <div className="text-[11px] text-white/45 mt-0.5">3 Operationen aktiv</div>
      </div>
    </aside>
  );
}

// ──────────────────────────────────────── Hero

function Hero({ activeShipId, setActiveShipId }) {
  return (
    <section>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="text-[12px] text-white/45 mb-2">Stanton System · Build 4.0.1 LIVE</div>
          <h1 className="text-[34px] leading-[1.1] font-semibold tracking-tight">Willkommen zurück, <span className="text-white/55">Daniel</span></h1>
          <p className="text-white/55 text-[14px] mt-2 max-w-[540px]">Alle Tools, Routen und Hangar-Daten an einem Ort. Schnellzugriff auf das, was du heute brauchst.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip"><span className="dot dot-ok"></span>RSI Auth verbunden</span>
          <span className="chip chip-warn">PTU 4.1 verfügbar</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
        <ServerStatus />
        <HangarPanel activeShipId={activeShipId} onSelect={setActiveShipId} />
      </div>
    </section>
  );
}

// ──────────────────────────────────────── Tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "blur": 14,
  "background": "none",
  "dark": true
}/*EDITMODE-END*/;

const BACKGROUNDS = {
  none:     { label: 'Kein Hintergrund',   url: '' },
  stanton:  { label: 'Stanton (Hurston)',  url: 'https://images.unsplash.com/photo-1457364887197-9150188c107b?auto=format&fit=crop&w=2400&q=80' },
  nebula:   { label: 'Pyro Nebula',        url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2400&q=80' },
  station:  { label: 'Orbital Station',    url: 'https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?auto=format&fit=crop&w=2400&q=80' },
  surface:  { label: 'Planet Surface',     url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=2400&q=80' },
};

function MyTweaks({ t, setTweak }) {
  return (
    <TweaksPanel title="Anpassen">
      <TweakSection label="Darstellung" />
      <TweakToggle  label="Dark Mode"   value={t.dark} onChange={v => setTweak('dark', v)} />
      <TweakSlider  label="Glass-Blur"  value={t.blur} min={0} max={32} step={1} unit="px"
                                        onChange={v => setTweak('blur', v)} />
      <TweakSection label="Hintergrund" />
      <TweakSelect  label="Bild"
                    value={t.background}
                    options={Object.entries(BACKGROUNDS).map(([k, v]) => ({ value: k, label: v.label }))}
                    onChange={v => setTweak('background', v)} />
    </TweaksPanel>
  );
}

// ──────────────────────────────────────── App

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = useState('overview');
  const [section, setSection] = useState('status');
  const [activeShipId, setActiveShipId] = useState('connie');
  const [query, setQuery] = useState('');

  useEffect(() => { document.documentElement.style.setProperty('--blur', t.blur + 'px'); }, [t.blur]);
  useEffect(() => { document.body.classList.toggle('light', !t.dark); }, [t.dark]);
  useEffect(() => {
    const url = BACKGROUNDS[t.background]?.url || '';
    const bg = document.getElementById('bg-image');
    if (bg) {
      bg.style.backgroundImage = url ? `url('${url}')` : 'none';
      bg.style.opacity = url ? (t.dark ? 0.18 : 0.06) : 0;
    }
  }, [t.background, t.dark]);

  const matchingTools = useMemo(() => {
    if (!query.trim()) return [];
    const ql = query.toLowerCase();
    return window.SCData.TOOLS.filter(x =>
      x.name.toLowerCase().includes(ql) || x.desc.toLowerCase().includes(ql)
    ).slice(0, 5);
  }, [query]);

  return (
    <div className="min-h-screen p-4 md:p-5 max-w-[1500px] mx-auto">
      <TopBar tab={tab} setTab={setTab} query={query} setQuery={setQuery} />

      {query && matchingTools.length > 0 && (
        <div className="glass-strong p-3 mt-2">
          <div className="cap mb-2">Suchergebnisse</div>
          <div className="space-y-0.5">
            {matchingTools.map(m => (
              <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer"
                 className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <Icon.Tools className="w-3.5 h-3.5 text-white/55" />
                  <span className="text-[13px]">{m.name}</span>
                  <span className="cap">{m.cat}</span>
                </div>
                <Icon.External className="w-3.5 h-3.5 text-white/40" />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-5">
        <Sidebar section={section} setSection={setSection} />

        <main className="flex-1 min-w-0 space-y-6">
          <div id="status" data-screen-label="01 Übersicht">
            <Hero activeShipId={activeShipId} setActiveShipId={setActiveShipId} />
          </div>

          <QuickActions />

          <div id="trade" data-screen-label="02 Operations" className="sec-h">
            <span>Operations</span>
            <span className="sec-h-sub">Trade · Mining · Bounty</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <TradeRoutes />
            <RefineryTimer />
            <BountyTracker />
          </div>

          <div id="tools" data-screen-label="03 Tools" className="sec-h">
            <span>Tools &amp; Ressourcen</span>
            <span className="sec-h-sub">17 Community Tools</span>
          </div>

          <ToolGrid />

          <div id="watch" data-screen-label="04 Markt &amp; Universum" className="sec-h">
            <span>Markt &amp; Universum</span>
            <span className="sec-h-sub">Preise · Events · Patches</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Watchlist />
            <EventsPanel />
          </div>

          <footer className="pt-6 pb-4 text-center cap">
            SC Navigator · inoffizielles Fan-Dashboard · Demo-Daten
          </footer>
        </main>
      </div>

      <MyTweaks t={t} setTweak={setTweak} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
