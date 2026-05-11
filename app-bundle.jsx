// SC Navigator — app-bundle.jsx
// Alle React-Komponenten in einer Datei (verhindert Babel-Multi-File Race Conditions).
//
// ── AKTIV ────────────────────────────────────────────────────────────────────
//   ServerStatus   → Echte RSI-Statuspage API (https://status.robertsspaceindustries.com)
//
// ── AUSKOMMENTIERT (bereit zum Reaktivieren) ─────────────────────────────────
//   HangarPanel    → Schiff-Übersicht mit HP/Fuel/Shields Bars
//   TradeRoutes    → Top-Routen mit Profit/Risk-Sortierung (UEXcorp API)
//   RefineryTimer  → Live-Countdown für Mining-Refinery-Jobs
//   BountyTracker  → Bounty-Missions-Tracker mit Reward-Summe
//   Watchlist      → Schiffspreis-Beobachtung mit Alert-Funktion
//   EventsPanel    → Aktive Events + Patch-Highlights
//   QuickActions   → 5 Quick-Action Buttons
//   ToolCard/Grid  → Filterbare Tool-Übersicht mit localStorage-Favoriten

const { useState, useEffect, useMemo } = React;

// ── Icon-Scope Fix ─────────────────────────────────────────────────────────
// Babel-Scripts laufen in isolierten Scopes. window.Icon (aus icons.jsx) hier
// als lokale Konstante verfügbar machen damit <Icon.XYZ /> überall funktioniert.
const Icon = window.Icon;

// ══════════════════════════════════════════════════════════════════════════════
// UTILITY-KOMPONENTEN
// ══════════════════════════════════════════════════════════════════════════════

// Panel — wiederverwendbarer Container mit optionalem Titel, Sub-Text und rechtem Slot
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

// Bar — horizontaler Fortschrittsbalken mit Status-Farben
// kind: 'rsi' (blau) | 'ok' (grün) | 'warn' (gelb) | 'crit' (rot)
function Bar({ value, kind = 'rsi', className = '' }) {
  const fill = kind === 'warn' ? 'bar-fill-warn' : kind === 'crit' ? 'bar-fill-crit' : kind === 'ok' ? 'bar-fill-ok' : 'bar-fill';
  return (
    <div className={`bar-track ${className}`}>
      <div className={fill} style={{ width: `${Math.max(0, Math.min(100, value))}%` }}></div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SERVER STATUS — echte RSI Statuspage API
// ══════════════════════════════════════════════════════════════════════════════

// RSI Statuspage API — liefert Service-Komponenten und Gesamtstatus.
// Doku: https://status.robertsspaceindustries.com (Atlassian Statuspage)
// Endpoint: GET https://status.robertsspaceindustries.com/api/v2/summary.json
//
// Antwort-Felder die wir nutzen:
//   status.indicator   → 'none' | 'minor' | 'major' | 'critical' | 'maintenance'
//   status.description → z.B. "All Systems Operational"
//   components[]       → Array der Services mit .name und .status
//   components[].status → 'operational' | 'degraded_performance' | 'partial_outage'
//                         | 'major_outage' | 'under_maintenance'

// ── RSI Status — lokal gecachte Datei ────────────────────────────────────────
// Der GitHub Action "Update RSI Status Cache" fetcht alle 5 Minuten die RSI API
// und speichert das Ergebnis als rsi-status.json im Repo.
// Das Frontend liest diese Datei von der eigenen Domain → kein CORS, kein Proxy.
//
// Pfad auf GitHub Pages: https://hobix0.github.io/SC-Navigator/rsi-status.json
const RSI_STATUS_URL = './rsi-status.json';

// Einfacher Fetch — kein Proxy nötig da same-origin
async function fetchStatusWithFallback() {
  const res = await fetch(RSI_STATUS_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Deutsch-Übersetzung + Reihenfolge der RSI-Komponenten die wir anzeigen wollen.
// Namen müssen exakt mit der API übereinstimmen (case-insensitive Vergleich unten).
const COMPONENT_MAP = [
  { apiName: 'Persistent Universe',        label: 'Persistent Universe (PU)' },
  { apiName: 'Electronic Access',          label: 'Electronic Access (EA)'   },
  { apiName: 'Star Citizen Tech Preview',  label: 'Tech Preview'             },
  { apiName: 'Roberts Space Industries',   label: 'Platform (RSI.com)'       },
  { apiName: 'RSI Launcher',               label: 'RSI Launcher'             },
  { apiName: 'Issue Council',              label: 'Issue Council'            },
];

// Statuspage-Status → { statusLabel, kind, dot }
function mapStatus(s) {
  switch (s) {
    case 'operational':          return { statusLabel: 'Online',       kind: 'ok',   dot: 'dot-ok'   };
    case 'degraded_performance': return { statusLabel: 'Beeinträchtigt', kind: 'warn', dot: 'dot-warn' };
    case 'partial_outage':       return { statusLabel: 'Teilausfall',  kind: 'warn', dot: 'dot-warn' };
    case 'major_outage':         return { statusLabel: 'Ausfall',      kind: 'crit', dot: 'dot-crit' };
    case 'under_maintenance':    return { statusLabel: 'Wartung',      kind: 'warn', dot: 'dot-warn' };
    default:                     return { statusLabel: 'Unbekannt',    kind: 'mute', dot: ''         };
  }
}

// Zeitstempel in "vor X Minuten/Sekunden" umrechnen
function timeAgo(isoString) {
  if (!isoString) return '';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60)   return `vor ${diff}s`;
  if (diff < 3600) return `vor ${Math.floor(diff / 60)}min`;
  return `vor ${Math.floor(diff / 3600)}h`;
}

function ServerStatus() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [data,      setData]      = useState(null);   // API-Antwort
  const [loading,   setLoading]   = useState(true);   // Initial-Load
  const [error,     setError]     = useState(null);   // Fehlertext
  const [updatedAt, setUpdatedAt] = useState(null);   // Zeitstempel des letzten Abrufs

  // ── Datenabruf ─────────────────────────────────────────────────────────────
  async function fetchStatus() {
    setLoading(true);
    setError(null);
    try {
      const json = await fetchStatusWithFallback();
      setData(json);
      setUpdatedAt(new Date().toISOString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Beim Mounten laden + alle 60 Sekunden automatisch aktualisieren
  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 60_000);
    return () => clearInterval(id); // Cleanup bei Unmount
  }, []);

  // ── Berechnete Werte aus API-Antwort ───────────────────────────────────────

  // Gesamtstatus aus data.status.indicator
  const overall = data?.status
    ? mapStatus(data.status.indicator === 'none' ? 'operational' : data.status.indicator)
    : null;

  // Relevante Komponenten in unserer definierten Reihenfolge heraussuchen
  const components = useMemo(() => {
    if (!data?.components) return [];
    return COMPONENT_MAP.map(entry => {
      const comp = data.components.find(
        c => c.name.toLowerCase() === entry.apiName.toLowerCase()
      );
      return comp
        ? { label: entry.label, ...mapStatus(comp.status) }
        : { label: entry.label, ...mapStatus('unknown') };
    });
  }, [data]);

  // Laufende Störungen und geplante Wartungen
  const incidents     = data?.incidents?.filter(i => i.status !== 'resolved') || [];
  const maintenances  = data?.scheduled_maintenances?.filter(m => m.status === 'in_progress') || [];

  // Zeitstempel "_cached_at" aus der gecachten Datei (vom GitHub Action gesetzt)
  const cacheAge = data?._cached_at ? timeAgo(data._cached_at) : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Panel title="Server Status" sub={cacheAge ? `RSI · Cache ${cacheAge}` : 'Roberts Space Industries'}  strong dense
      right={
        overall
          ? <span className={`chip chip-${overall.kind}`}><span className={`dot ${overall.dot}`}></span>{overall.statusLabel}</span>
          : <span className="chip">Lädt…</span>
      }
    >

      {/* ── Lade-Zustand ─────────────────────────────────────────────────── */}
      {loading && !data && (
        <div className="text-center py-8 text-white/40 text-[13px]">
          <Icon.Refresh className="w-5 h-5 mx-auto mb-2 opacity-40 animate-spin" />
          Verbinde mit RSI Statuspage…
        </div>
      )}

      {/* ── Fehler-Zustand ───────────────────────────────────────────────── */}
      {error && !data && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-[12.5px] text-red-300/80 leading-relaxed">
          <div className="font-semibold mb-1 text-red-300">Verbindungsfehler</div>
          {error}
          <div className="mt-2.5">
            <a href="https://status.robertsspaceindustries.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-white/55 hover:text-white underline text-[12px]">
              Status manuell prüfen →
            </a>
          </div>
        </div>
      )}

      {/* ── Haupt-Inhalt (Daten vorhanden) ──────────────────────────────── */}
      {data && (
        <>
          {/* Aktive Störungen — werden nur angezeigt wenn vorhanden */}
          {(incidents.length > 0 || maintenances.length > 0) && (
            <div className="mb-3 space-y-1.5">
              {[...maintenances, ...incidents].map((item, i) => (
                <div key={i} className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[12px]">
                  <span className="text-amber-300/80 font-medium">{item.name}</span>
                  {item.shortlink && (
                    <a href={item.shortlink} target="_blank" rel="noopener noreferrer"
                      className="ml-2 text-white/40 hover:text-white underline">Details</a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Service-Komponenten Liste */}
          <div className="space-y-2">
            {components.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                {/* Status-Dot */}
                <span className={`dot ${c.dot} flex-none`}></span>
                {/* Service-Name */}
                <span className="text-[13px] text-white/85 flex-1 truncate">{c.label}</span>
                {/* Status-Text */}
                <span className={`text-[11.5px] font-medium ${
                  c.kind === 'ok'   ? 'text-emerald-400' :
                  c.kind === 'warn' ? 'text-amber-400'   :
                  c.kind === 'crit' ? 'text-red-400'     : 'text-white/40'
                }`}>{c.statusLabel}</span>
              </div>
            ))}
          </div>

          {/* Footer: Build-Info + Refresh-Button */}
          <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
            <div className="text-[11.5px] text-white/45 min-w-0">
              {data.status?.description && (
                <span className="text-white/65 mr-1.5">{data.status.description}</span>
              )}
              {updatedAt && <span>· {timeAgo(updatedAt)}</span>}
            </div>
            <button onClick={fetchStatus} disabled={loading}
              className="btn !py-1 !px-2 !text-[11px] flex-none">
              <Icon.Refresh className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Lädt…' : 'Aktualisieren'}
            </button>
          </div>
        </>
      )}
    </Panel>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// AUSKOMMENTIERTE KOMPONENTEN
// Zum Reaktivieren: /* und */ entfernen + Aufruf in Hero/App einkommentieren
// ══════════════════════════════════════════════════════════════════════════════

/*
// ── HangarPanel ──────────────────────────────────────────────────────────────
// Zeigt aktives Schiff mit HP/Fuel/Shields + Schnellauswahl aller Schiffe.
// Daten: window.SCData.SHIPS (Array) — Format siehe ARCHITECTURE.md
function HangarPanel({ activeShipId, onSelect }) {
  const { SHIPS } = window.SCData;
  const ship = SHIPS?.find(s => s.id === activeShipId) || SHIPS?.[0];
  if (!ship) return (
    <Panel title="Hangar" sub="Keine Schiffe" strong dense>
      <div className="text-center py-8 text-white/40 text-[13px]">
        <Icon.Ship className="w-8 h-8 mx-auto mb-2 opacity-40" />Keine Schiff-Daten verfügbar
      </div>
    </Panel>
  );
  return (
    <Panel title="Hangar" sub={`${SHIPS?.length || 0} Schiffe`} strong dense
      right={<button className="btn !py-1 !px-2 !text-[11px]"><Icon.Plus className="w-3 h-3" />Hinzufügen</button>}>
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
          { label: 'Hülle',        value: ship.hp,      kind: ship.hp > 75 ? 'ok' : ship.hp > 40 ? 'warn' : 'crit' },
          { label: 'Quantum Fuel', value: ship.fuel,    kind: ship.fuel > 50 ? 'rsi' : 'warn' },
          { label: 'Schilde',      value: ship.shields, kind: 'rsi' },
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
          {SHIPS?.map(s => (
            <button key={s.id} onClick={() => onSelect(s.id)}
              className={`px-2.5 py-1 rounded-md text-[11.5px] transition border ${s.id === ship.id ? 'bg-accent-500/15 border-accent-500/40 text-white' : 'bg-white/[0.03] border-white/[0.07] text-white/65 hover:text-white hover:border-white/20'}`}>
              {s.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}
*/

/*
// ── TradeRoutes ───────────────────────────────────────────────────────────────
// Top-Handelrouten sortiert nach Profit, Risiko oder Name.
// Daten: window.SCData.TRADE_ROUTES — später: UEXcorp API live
function TradeRoutes() {
  const { TRADE_ROUTES } = window.SCData;
  const [sortBy, setSortBy] = useState('profit');
  const sorted = useMemo(() => {
    if (!TRADE_ROUTES?.length) return [];
    return [...TRADE_ROUTES].sort((a, b) => {
      if (sortBy === 'profit') return b.profit - a.profit;
      if (sortBy === 'risk')   return ({ low:0, med:1, high:2 })[a.risk] - ({ low:0, med:1, high:2 })[b.risk];
      return a.commodity.localeCompare(b.commodity);
    });
  }, [sortBy]);
  const max = TRADE_ROUTES?.length > 0 ? Math.max(...TRADE_ROUTES.map(r => r.profit)) : 1;
  return (
    <Panel title="Top Trade Routen" sub="UEXcorp · Live"
      right={
        <div className="flex gap-0.5 p-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
          {[['profit','Profit'],['risk','Risiko'],['name','Name']].map(([k,lbl]) =>
            <button key={k} onClick={() => setSortBy(k)}
              className={`px-2 py-1 rounded text-[11px] transition ${sortBy===k?'bg-white/[0.07] text-white':'text-white/50 hover:text-white'}`}>{lbl}</button>
          )}
        </div>
      }>
      <div className="space-y-1">
        {sorted.length > 0 ? sorted.map((r,i) => (
          <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center py-2 px-2 rounded-md hover:bg-white/[0.03]">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-white truncate">{r.commodity}</span>
                <span className={`chip chip-${r.risk==='high'?'crit':r.risk==='med'?'warn':'ok'}`}>{r.risk==='high'?'hoch':r.risk==='med'?'mittel':'niedrig'}</span>
              </div>
              <div className="text-[11.5px] text-white/45 mt-0.5 truncate">{r.from} → {r.to}</div>
            </div>
            <div className="w-20 hidden sm:block"><Bar value={(r.profit/max)*100} kind={r.risk==='high'?'warn':'rsi'} /></div>
            <div className="text-right tabular-nums">
              <div className="font-mono text-[13px] text-emerald-400 font-semibold">+{r.profit<100?r.profit.toFixed(1):r.profit.toLocaleString('de-DE')}</div>
              <div className="text-[10.5px] text-white/40">aUEC/SCU</div>
            </div>
          </div>
        )) : (
          <div className="text-center py-8 text-white/40 text-[12px]">
            <Icon.Map className="w-6 h-6 mx-auto mb-1 opacity-40" />Keine Trade-Routen verfügbar
          </div>
        )}
      </div>
    </Panel>
  );
}
*/

/*
// ── RefineryTimer ─────────────────────────────────────────────────────────────
// Live-Countdown für Mining-Raffinerie-Jobs mit Fortschrittsbalken.
// Daten: window.SCData.REFINERY — format: { id, station, method, ore, inputScu, outputScu, costAuec, eta, started }
function RefineryTimer() {
  const { REFINERY } = window.SCData;
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  function fmt(ms) {
    if (ms <= 0) return 'Fertig';
    const s = Math.floor(ms/1000), h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  }
  return (
    <Panel title="Refinery Jobs" sub="Regolith Co." right={<span className="chip">{REFINERY?.length||0} aktiv</span>}>
      <div className="space-y-3">
        {REFINERY?.length > 0 ? REFINERY.map(j => {
          const elapsed = now - j.started, progress = Math.min(100,(elapsed/j.eta)*100), remaining = Math.max(0,j.eta-elapsed), done = remaining===0;
          return (
            <div key={j.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate">{j.ore}</div>
                  <div className="text-[11px] text-white/45 truncate mt-0.5">{j.station} · {j.method}</div>
                </div>
                <div className="text-right flex-none">
                  <div className={`font-mono text-[13.5px] font-semibold tabular-nums ${done?'text-emerald-400':'text-white'}`}>{fmt(remaining)}</div>
                  <div className="text-[10.5px] text-white/45 font-mono">{j.outputScu}/{j.inputScu} SCU</div>
                </div>
              </div>
              <Bar value={progress} kind={done?'ok':'rsi'} />
            </div>
          );
        }) : (
          <div className="text-center py-8 text-white/40 text-[12px]">
            <Icon.Mining className="w-6 h-6 mx-auto mb-1 opacity-40" />Keine aktiven Refinery-Jobs
          </div>
        )}
      </div>
      <button className="btn w-full justify-center mt-3"><Icon.Plus className="w-3.5 h-3.5" />Neuer Job</button>
    </Panel>
  );
}
*/

/*
// ── BountyTracker ─────────────────────────────────────────────────────────────
// Bounty-Missionen mit Toggle (angenommen/offen) und Gesamt-Reward-Summe.
// Daten: window.SCData.BOUNTIES — format: { id, target, faction, loc, reward, tier, diff }
function BountyTracker() {
  const { BOUNTIES } = window.SCData;
  const [accepted, setAccepted] = useState(() => new Set());
  function toggle(id) { setAccepted(s => { const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; }); }
  const total = [...accepted].reduce((sum,id) => sum + (BOUNTIES.find(b=>b.id===id)?.reward||0), 0);
  return (
    <Panel title="Bounty Missionen" sub={`${accepted.size} angenommen`}
      right={<span className="font-mono text-[12px] text-emerald-400 tabular-nums">{total.toLocaleString('de-DE')} aUEC</span>}>
      <div className="space-y-2">
        {BOUNTIES?.length > 0 ? BOUNTIES.map(b => {
          const isOn = accepted.has(b.id), diff = b.diff==='hard'?'crit':b.diff==='med'?'warn':'ok';
          return (
            <button key={b.id} onClick={() => toggle(b.id)}
              className={`w-full text-left rounded-lg p-3 border transition ${isOn?'border-accent-500/30':'bg-white/[0.02] border-white/[0.06] hover:border-white/15'}`}
              style={isOn?{background:'rgba(59,130,246,0.08)',borderColor:'rgba(59,130,246,0.3)'}:null}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`chip chip-${diff}`}>Tier {b.tier}</span>
                    <span className="text-[13px] font-medium truncate">{b.target}</span>
                  </div>
                  <div className="text-[11.5px] text-white/50 mt-1">{b.faction} · {b.loc}</div>
                </div>
                <div className="text-right flex-none">
                  <div className="font-mono text-[12.5px] font-semibold tabular-nums">{b.reward.toLocaleString('de-DE')}</div>
                  <div className="text-[10px] text-white/40">aUEC</div>
                </div>
              </div>
            </button>
          );
        }) : (
          <div className="text-center py-8 text-white/40 text-[12px]">
            <Icon.Bounty className="w-6 h-6 mx-auto mb-1 opacity-40" />Keine Bounties verfügbar
          </div>
        )}
      </div>
    </Panel>
  );
}
*/

/*
// ── Watchlist ─────────────────────────────────────────────────────────────────
// Schiff-Preisbeobachtung mit Preis-Trend und Alert-Markierung.
// Daten: window.SCData.WATCHLIST — format: { ship, mfr, price, change, alert }
function Watchlist() {
  const { WATCHLIST } = window.SCData;
  return (
    <Panel title="Schiff-Watchlist" sub="Star Hangar · Pledge Store"
      right={<button className="btn !py-1 !px-2 !text-[11px]"><Icon.Plus className="w-3 h-3" /></button>}>
      <div className="space-y-1">
        {WATCHLIST?.length > 0 ? WATCHLIST.map((w,i) => (
          <div key={i} className="grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center py-2 px-2 rounded-md hover:bg-white/[0.03]">
            <div className="w-8 h-8 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-none">
              <Icon.Ship className="w-4 h-4 text-white/55" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] truncate">{w.ship}</div>
              <div className="text-[11px] text-white/45">{w.mfr}</div>
            </div>
            <div className={`font-mono text-[11.5px] font-medium tabular-nums ${w.change>0?'text-emerald-400':w.change<0?'text-red-400':'text-white/40'}`}>
              {w.change>0?'+':''}{w.change}%
            </div>
            <div className="text-right tabular-nums">
              <div className="font-mono text-[13px] font-semibold">${w.price}</div>
              {w.alert && <div className="text-[10px] text-amber-400/80">Alert aktiv</div>}
            </div>
          </div>
        )) : (
          <div className="text-center py-8 text-white/40 text-[12px]">
            <Icon.Ship className="w-6 h-6 mx-auto mb-1 opacity-40" />Keine Schiffe auf der Watchlist
          </div>
        )}
      </div>
    </Panel>
  );
}
*/

/*
// ── EventsPanel ───────────────────────────────────────────────────────────────
// Aktive In-Game-Events + Patch-Highlights.
// Daten: window.SCData.EVENTS + window.SCData.PATCH
function EventsPanel() {
  const { EVENTS, PATCH } = window.SCData;
  const patchSub = PATCH?.version ? `${PATCH.branch} ${PATCH.version} · ${PATCH.released}` : 'Keine Patch-Daten';
  return (
    <Panel title="Aktive Events & Patch" sub={patchSub}>
      <div className="space-y-2 mb-4">
        {EVENTS?.length > 0 ? EVENTS.map((e,i) => (
          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-3 min-w-0">
              <span className={`chip chip-${e.severity==='high'?'crit':'warn'}`}>{e.severity==='high'?'hoch':'mittel'}</span>
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
        )) : (
          <div className="text-center py-6 text-white/40 text-[12px]">
            <Icon.Bell className="w-6 h-6 mx-auto mb-1 opacity-40" />Keine aktiven Events
          </div>
        )}
      </div>
      <div className="border-t border-white/[0.06] pt-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[12.5px] font-medium">Patch Highlights</div>
          <button className="text-[11.5px] text-white/55 hover:text-white inline-flex items-center gap-1">
            Alle Notes <Icon.External className="w-3 h-3" />
          </button>
        </div>
        <ul className="text-[12.5px] text-white/65 space-y-1.5">
          {PATCH?.highlights?.length > 0 ? PATCH.highlights.map((h,i) => (
            <li key={i} className="flex gap-2"><span className="text-white/30 mt-0.5">·</span><span>{h}</span></li>
          )) : <li className="text-white/40">Keine Highlights verfügbar</li>}
        </ul>
      </div>
    </Panel>
  );
}
*/

/*
// ── QuickActions ──────────────────────────────────────────────────────────────
// 5 Quick-Action Buttons: Game Launcher, Bug Report, Route planen, Org-Chat, Refresh
function QuickActions() {
  const actions = [
    { id: 'launcher', label: 'Game Launcher', icon: 'Play',    primary: true },
    { id: 'issue',    label: 'Bug Report',    icon: 'Bug'     },
    { id: 'route',    label: 'Route planen',  icon: 'Map'     },
    { id: 'org',      label: 'Org-Chat',      icon: 'Comms'   },
    { id: 'refresh',  label: 'Daten neu laden',icon: 'Refresh' },
  ];
  return (
    <Panel title="Schnellzugriff" sub="Häufig genutzte Aktionen" dense>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {actions.map(a => {
          const I = window.Icon[a.icon];
          return (
            <button key={a.id}
              className={`flex items-center gap-2.5 py-2.5 px-3 rounded-lg border text-left transition ${a.primary?'bg-accent-500 border-accent-500 text-white hover:bg-accent-600':'bg-white/[0.02] border-white/[0.06] text-white/80 hover:bg-white/[0.05]'}`}
              style={a.primary?{background:'var(--accent)',borderColor:'var(--accent)',color:'#fff'}:null}>
              <I className="w-4 h-4 flex-none" />
              <span className="text-[12.5px] font-medium truncate">{a.label}</span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
*/

/*
// ── ToolCard + ToolGrid ────────────────────────────────────────────────────────
// Filterbares Tool-Verzeichnis mit Kategorie-Filter, Sortierung und localStorage-Favoriten.
// Daten: window.SCData.TOOLS + window.SCData.TOOL_CATS
// Hinweis: ToolGrid ist auch in tools.jsx definiert — die Version hier ist die integrierte.
function ToolCard({ tool, isFav, onFav }) {
  const I = window.Icon[tool.icon] || window.Icon.Tools;
  return (
    <a href={tool.url} target="_blank" rel="noopener noreferrer"
       className="tool-card glass p-4 block group relative">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center border border-white/[0.07]"
             style={{ background: `${tool.color}14` }}>
          <I style={{ width:18, height:18, color:tool.color }} />
        </div>
        <button onClick={e=>{e.preventDefault();e.stopPropagation();onFav(tool.id);}} className="p-1.5 -m-1.5 text-white/30 hover:text-amber-400 transition">
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
  const [favs, setFavs] = useState(() => JSON.parse(localStorage.getItem('sc-nav.favs')||'[]'));
  function toggleFav(id) {
    const n = favs.includes(id) ? favs.filter(x=>x!==id) : [...favs,id];
    setFavs(n); localStorage.setItem('sc-nav.favs', JSON.stringify(n));
  }
  const shown = useMemo(() => {
    let list = TOOLS||[];
    if (cat !== 'Alle') list = list.filter(t => t.cat===cat);
    if (q.trim()) { const ql=q.toLowerCase(); list=list.filter(t=>t.name.toLowerCase().includes(ql)||t.desc.toLowerCase().includes(ql)); }
    if (sort==='popular') list=[...list].sort((a,b)=>b.popularity-a.popularity);
    if (sort==='name')    list=[...list].sort((a,b)=>a.name.localeCompare(b.name));
    if (sort==='favs')    list=[...list].sort((a,b)=>(favs.includes(b.id)?1:0)-(favs.includes(a.id)?1:0));
    return list;
  }, [q,cat,sort,favs]);
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Icon.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tools suchen…" className="field w-full pl-9 !py-2" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(TOOL_CATS||[]).map(c=>(
            <button key={c} onClick={()=>setCat(c)} className={`tab ${cat===c?'tab-active':''}`}>{c}</button>
          ))}
        </div>
        <div className="flex gap-0.5 p-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] ml-auto">
          {[['popular','Top'],['name','A–Z'],['favs','★']].map(([k,l])=>(
            <button key={k} onClick={()=>setSort(k)} className={`px-2.5 py-1 rounded text-[11.5px] transition ${sort===k?'bg-white/[0.07] text-white':'text-white/50 hover:text-white'}`}>{l}</button>
          ))}
        </div>
      </div>
      {shown.length > 0
        ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {shown.map(t => <ToolCard key={t.id} tool={t} isFav={favs.includes(t.id)} onFav={toggleFav} />)}
          </div>
        : <div className="text-center py-12 text-white/40 text-[13px]"><Icon.Search className="w-6 h-6 mx-auto mb-2 opacity-40" />Keine Tools gefunden</div>
      }
    </div>
  );
}
*/

// ══════════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════════════════════════════

// TopBar — sticky Header mit Logo, Tab-Navigation und Suche
function TopBar({ query, setQuery }) {
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

      {/* Tab-Navigation — weitere Tabs folgen wenn fertig */}
      <nav className="hidden md:flex items-center gap-0.5 bg-white/[0.03] rounded-lg p-1 border border-white/[0.06]">
        <button className="tab tab-active">Übersicht</button>
        {['Item-DB', 'Trade', 'Mining', 'Schiffe'].map(t => (
          <button key={t} className="tab opacity-40 cursor-default" title="In Entwicklung">{t}</button>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <div className="hidden lg:flex relative">
          <Icon.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Schnell suchen…" className="field w-[220px] pl-9 !py-2" />
        </div>
        <button className="btn !p-2"><Icon.Bell className="w-4 h-4" /></button>
        <button className="btn !p-2"><Icon.Comms className="w-4 h-4" /></button>
        <div className="w-8 h-8 rounded-lg flex-none border border-white/10 bg-white/[0.04] flex items-center justify-center text-[11.5px] font-semibold">LT</div>
      </div>
    </header>
  );
}

// Sidebar — linke Navigation
// Aktiv: Übersicht. Andere Items sind vorbereitet aber noch ausgegraut.
function Sidebar({ section, setSection }) {
  const items = [
    { id: 'status',  label: 'Übersicht',  icon: 'Status',  active: true  },
    { id: 'tools',   label: 'Tools',      icon: 'Tools',   active: false },
    { id: 'trade',   label: 'Trade',      icon: 'Trade',   active: false },
    { id: 'mining',  label: 'Mining',     icon: 'Mining',  active: false },
    { id: 'hangar',  label: 'Hangar',     icon: 'Hangar',  active: false },
    { id: 'bounty',  label: 'Bounties',   icon: 'Bounty',  active: false },
    { id: 'watch',   label: 'Watchlist',  icon: 'Watch',   active: false },
    { id: 'org',     label: 'Org',        icon: 'Org',     active: false },
  ];
  return (
    <aside className="glass p-2 w-[180px] flex-none self-start sticky top-[78px]">
      <div className="cap px-2.5 pt-1.5 pb-2">Navigation</div>
      <nav className="space-y-0.5">
        {items.map(it => {
          const I = window.Icon[it.icon];
          return (
            <a key={it.id} href={it.active ? `#${it.id}` : undefined}
              onClick={() => it.active && setSection(it.id)}
              title={it.active ? it.label : 'Coming soon'}
              className={`sb-item ${it.id === section && it.active ? 'active' : ''} ${!it.active ? 'opacity-35 cursor-default' : ''}`}>
              <I className="sb-icon" />
              <span>{it.label}</span>
              {!it.active && <span className="ml-auto text-[9px] text-white/30 font-mono">soon</span>}
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
    </aside>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════════════════════════════

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "blur": 14,
  "background": "none",
  "dark": true
}/*EDITMODE-END*/;

const BACKGROUNDS = {
  none:    { label: 'Kein Hintergrund',  url: '' },
  stanton: { label: 'Stanton (Hurston)', url: 'https://images.unsplash.com/photo-1457364887197-9150188c107b?auto=format&fit=crop&w=2400&q=80' },
  nebula:  { label: 'Pyro Nebula',       url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2400&q=80' },
  station: { label: 'Orbital Station',   url: 'https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?auto=format&fit=crop&w=2400&q=80' },
  surface: { label: 'Planet Surface',    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=2400&q=80' },
};

function MyTweaks({ t, setTweak }) {
  return (
    <TweaksPanel title="Anpassen">
      <TweakSection label="Darstellung" />
      <TweakToggle  label="Dark Mode"  value={t.dark} onChange={v => setTweak('dark', v)} />
      <TweakSlider  label="Glass-Blur" value={t.blur} min={0} max={32} step={1} unit="px" onChange={v => setTweak('blur', v)} />
      <TweakSection label="Hintergrund" />
      <TweakSelect  label="Bild"
        value={t.background}
        options={Object.entries(BACKGROUNDS).map(([k, v]) => ({ value: k, label: v.label }))}
        onChange={v => setTweak('background', v)} />
    </TweaksPanel>
  );
}

function App() {
  const [t, setTweak]         = useTweaks(TWEAK_DEFAULTS);
  const [section, setSection] = useState('status');
  const [query, setQuery]     = useState('');

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

  return (
    <div className="min-h-screen p-4 md:p-5 max-w-[1500px] mx-auto">
      <TopBar query={query} setQuery={setQuery} />

      <div className="mt-4 flex gap-5">
        <Sidebar section={section} setSection={setSection} />

        <main className="flex-1 min-w-0 space-y-6">
          <div id="status">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
              <div>
                <div className="text-[12px] text-white/45 mb-2">Stanton System</div>
                <h1 className="text-[28px] leading-[1.1] font-semibold tracking-tight">
                  Willkommen zurück, <span className="text-white/55">Luca</span>
                </h1>
                <p className="text-white/55 text-[14px] mt-2 max-w-[480px]">
                  Star Citizen Command Hub — Alle wichtigen Daten an einem Ort.
                </p>
              </div>
            </div>
            <div className="max-w-[640px]">
              <ServerStatus />
            </div>
          </div>

          <footer className="pt-6 pb-4 text-center cap">
            SC Navigator · inoffizielles Fan-Dashboard · nicht verbunden mit CIG
          </footer>
        </main>
      </div>

      <MyTweaks t={t} setTweak={setTweak} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
