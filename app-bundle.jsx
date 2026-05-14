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

const { useState, useEffect, useMemo, useRef } = React;

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
// ITEM-DATENBANK — Daten via GitHub Action (update-items.yml)
// Quelle: api.star-citizen.wiki — echte Spieldaten, täglich aktualisiert
// Tabelle: Name | Typ | Hersteller | Größe | Grade | Link
// Filter:  Suche, Kategorie, Hersteller
// Sort:    Klick auf Spaltenheader
// ══════════════════════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────────────────────
// ITEM DETAIL POPUP — Modal für Item-Details von der Wiki API
// ──────────────────────────────────────────────────────────────────────────────

const ITEM_KIND_ICON = {
  'FPS Waffe': '🔫', 'Rüstung': '🛡️', 'Kleidung': '👔',
  'Waffenaufsatz': '⚙️', 'Medizin': '💊', 'Schiffswaffe': '🚀',
  'Schild': '🛡️', 'Kühler': '❄️', 'Reaktor': '⚡',
  'Quantum-Antrieb': '🌌', 'Flugregler': '🎛️', 'Rakete': '💣', 'Mining-Laser': '⛏️',
};

const STAT_LABELS = {
  mass: 'Masse (kg)', size: 'Größe', grade: 'Grade', damage: 'Schaden',
  rof: 'Feuerrate', range: 'Reichweite', effective_range: 'Eff. Reichweite',
  zeroing_range: 'Nullung', ammo_count: 'Magazin', ammo_cost: 'Munitionskosten',
  rpm: 'Schuss/Min', velocity: 'Geschoss m/s', power_use: 'Stromverbrauch (EU)',
  heat_generated: 'Wärme', cooldown_time: 'Abkühlung (s)', hp: 'Trefferpunkte',
  regen_rate: 'Regen-Rate', regen_delay: 'Regen-Verzögerung (s)',
  quantum_speed: 'Quantum-Geschw.', spool_time: 'Spul-Zeit (s)',
  damage_reduction: 'Schadensreduktion', temp_resist_min: 'Temp-Resist. Min',
  temp_resist_max: 'Temp-Resist. Max', encumbrance: 'Belastung',
  capacity: 'Kapazität', radius: 'Radius', ir_emission: 'IR-Emission',
  em_emission: 'EM-Emission', cross_section_reduction: 'Querschn.-Reduktion',
  heat_capacity: 'Wärmekapazität', heat_dissipation: 'Wärmeableitung',
  mining_laser_power: 'Laser-Stärke', mining_throttle_rate: 'Throttle-Rate',
  instability_reduction: 'Instab.-Reduktion',
};

// Skip fields shown in header or not user-facing
const STAT_SKIP = new Set([
  'uuid','name','class_name','description','manufacturer','shops','media',
  'type','sub_type','size','grade','links','version','kind','is_illegal',
  'best_buy','best_sell','profit','wiki_url','id',
]);

function StatRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  const display = typeof value === 'boolean' ? (value ? 'Ja' : 'Nein')
    : typeof value === 'number' ? value.toLocaleString('de-DE')
    : String(value);
  return (
    <div className="flex justify-between items-baseline gap-4 py-2 border-b border-white/[0.05] last:border-0">
      <span className="text-[12.5px] text-white/45 shrink-0">{label}</span>
      <span className="text-[12.5px] font-mono text-white/80 text-right">{display}</span>
    </div>
  );
}

function ItemDetailModal({ item, onClose }) {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('info');

  useEffect(() => {
    if (!item) return;
    const ctrl = new AbortController();
    setApiData(null);
    setLoading(true);
    setTab('info');
    fetch(
      `https://api.star-citizen.wiki/api/v2/items/${encodeURIComponent(item.class_name)}?include=shops,components,ports`,
      { headers: { Accept: 'application/json' }, signal: ctrl.signal }
    )
      .then(r => r.json())
      .then(j => { if (!ctrl.signal.aborted) setApiData(j.data || null); })
      .catch(() => {})
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [item?.class_name]);

  if (!item) return null;

  const d = apiData || {};

  // ── Derived values ──────────────────────────────────────────────────────────
  const image   = d.media?.[0]?.thumbnail || d.media?.[0]?.source_url || null;
  const mfr     = typeof d.manufacturer === 'object' ? d.manufacturer?.name : (d.manufacturer || item.manufacturer);
  const desc    = d.description || null;
  const shops   = Array.isArray(d.shops) ? d.shops : [];

  // All scalar stats from API (excluding header/meta fields)
  const statsFlat = Object.entries(d).filter(([k, v]) =>
    !STAT_SKIP.has(k) && v !== null && v !== undefined && v !== '' && typeof v !== 'object'
  );

  // Nested objects worth showing (e.g. damage breakdown, components)
  const statsNested = Object.entries(d).filter(([k, v]) =>
    !STAT_SKIP.has(k) && v !== null && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0
  );

  // Arrays worth showing (e.g. ports, attachments)
  const statsArrays = Object.entries(d).filter(([k, v]) =>
    !STAT_SKIP.has(k) && !['shops','media','components'].includes(k) &&
    Array.isArray(v) && v.length > 0
  );

  const hasStats = statsFlat.length || statsNested.length || statsArrays.length;

  const tabs = [
    { id: 'info',  label: 'Info' },
    ...(hasStats   ? [{ id: 'stats', label: 'Stats' }] : []),
    ...(shops.length ? [{ id: 'shops', label: `Kaufen (${shops.length})` }] : []),
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
         onClick={onClose}>
      <div className="glass-strong w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl"
           onClick={e => e.stopPropagation()}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start gap-4 p-5 border-b border-white/[0.06] flex-none">
          <div className="w-[88px] h-[88px] rounded-lg overflow-hidden border border-white/[0.08] bg-white/[0.04] flex items-center justify-center flex-none">
            {loading
              ? <span className="cap">…</span>
              : image
                ? <img src={image} alt={item.name} className="w-full h-full object-cover"
                       onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}/>
                : null}
            {!loading && !image && (
              <span className="text-3xl">{ITEM_KIND_ICON[item.kind] || '📦'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-bold leading-tight">{item.name}</h2>
            <p className="text-[11px] font-mono text-white/30 mt-0.5 truncate">{item.class_name}</p>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="chip">{item.kind}</span>
              {item.size  && <span className="chip">S{item.size}</span>}
              {item.grade && <span className="chip">Grade {item.grade}</span>}
              {mfr        && <span className="chip">{mfr}</span>}
              <span className={`chip ${item.is_illegal ? 'chip-crit' : 'chip-ok'}`}>
                {item.is_illegal ? 'Illegal' : 'Legal'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn !p-1.5 flex-none">
            <Icon.X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 px-4 pt-2 border-b border-white/[0.06] flex-none">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`tab pb-2 !rounded-b-none !border-b-0 !border-x-0 !border-t-0 ${tab === t.id ? 'tab-active' : ''}`}>
              {t.label}
            </button>
          ))}
          {loading && <span className="ml-auto self-center cap pr-1">Lade Wiki…</span>}
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* INFO TAB */}
          {tab === 'info' && (
            <>
              {desc && (
                <div>
                  <p className="text-[11px] font-semibold text-white/35 uppercase tracking-wider mb-2">Beschreibung</p>
                  <p className="text-[13px] text-white/65 leading-relaxed">{desc}</p>
                </div>
              )}
              <div>
                <p className="text-[11px] font-semibold text-white/35 uppercase tracking-wider mb-1">Grunddaten</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  {[
                    ['Typ',         item.kind],
                    ['Subtyp',      item.type || d.sub_type],
                    ['Hersteller',  mfr],
                    ['Größe',       item.size],
                    ['Grade',       item.grade],
                    ['Klasse',      item.class_name],
                    ['Status',      item.is_illegal ? 'Illegal ⛔' : 'Legal ✓'],
                  ].filter(([, v]) => v).map(([l, v]) => <StatRow key={l} label={l} value={v} />)}
                </div>
              </div>
              {!apiData && !loading && (
                <p className="cap text-center py-4 text-white/30">
                  Keine weiteren Wiki-Daten verfügbar für dieses Item.
                </p>
              )}
            </>
          )}

          {/* STATS TAB */}
          {tab === 'stats' && (
            <>
              {statsFlat.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-white/35 uppercase tracking-wider mb-1">Werte</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    {statsFlat.map(([k, v]) => (
                      <StatRow key={k} label={STAT_LABELS[k] || k} value={v} />
                    ))}
                  </div>
                </div>
              )}
              {statsNested.map(([k, obj]) => (
                <div key={k}>
                  <p className="text-[11px] font-semibold text-white/35 uppercase tracking-wider mb-1">
                    {STAT_LABELS[k] || k}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    {Object.entries(obj).filter(([, v]) => v !== null && v !== undefined)
                      .map(([sk, sv]) => (
                        <StatRow key={sk} label={STAT_LABELS[sk] || sk}
                          value={typeof sv === 'object' ? JSON.stringify(sv) : sv} />
                      ))}
                  </div>
                </div>
              ))}
              {statsArrays.map(([k, arr]) => (
                <div key={k}>
                  <p className="text-[11px] font-semibold text-white/35 uppercase tracking-wider mb-2">
                    {STAT_LABELS[k] || k} ({arr.length})
                  </p>
                  <div className="space-y-1.5">
                    {arr.map((entry, i) => (
                      <div key={i} className="glass px-3 py-2 text-[12px] text-white/70">
                        {typeof entry === 'object'
                          ? Object.entries(entry).filter(([, v]) => v !== null && v !== undefined)
                              .map(([ek, ev]) => `${ek}: ${ev}`).join(' · ')
                          : String(entry)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* SHOPS TAB */}
          {tab === 'shops' && (
            <div className="space-y-2">
              {shops.map((shop, i) => (
                <div key={i} className="glass p-3 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">
                      {shop.name || shop.name_raw || 'Unbekannte Station'}
                    </p>
                    {shop.position && (
                      <p className="text-[11px] text-white/40 mt-0.5">{shop.position}</p>
                    )}
                    {shop.type && (
                      <p className="text-[11px] text-white/30 mt-0.5">{shop.type}</p>
                    )}
                  </div>
                  <div className="flex gap-4 flex-none">
                    {shop.price_buy != null && (
                      <div className="text-right">
                        <p className="text-[10px] text-white/35 uppercase">Kaufen</p>
                        <p className="text-[13px] font-mono text-green-400">
                          {shop.price_buy.toLocaleString('de-DE')} aUEC
                        </p>
                      </div>
                    )}
                    {shop.price_sell != null && (
                      <div className="text-right">
                        <p className="text-[10px] text-white/35 uppercase">Verkaufen</p>
                        <p className="text-[13px] font-mono text-blue-400">
                          {shop.price_sell.toLocaleString('de-DE')} aUEC
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="border-t border-white/[0.06] px-5 py-3 flex items-center justify-between flex-none">
          <a href={`https://star-citizen.wiki/w/${encodeURIComponent(item.name)}`}
             target="_blank" rel="noopener"
             className="btn text-[12px] gap-1.5">
            <Icon.External className="w-3.5 h-3.5" />
            Wiki öffnen
          </a>
          <button onClick={onClose} className="btn text-[12px]">Schließen</button>
        </div>
      </div>
    </div>
  );
}


// Spalten-Definition
const COLUMNS = [
  { key: 'name',         label: 'Name',        sortable: true  },
  { key: 'kind',         label: 'Typ',          sortable: true  },
  { key: 'manufacturer', label: 'Hersteller',   sortable: true  },
  { key: 'size',         label: 'Größe',        sortable: true  },
  { key: 'grade',        label: 'Grade',        sortable: true  },
  { key: '_link',        label: '',             sortable: false },
];

function ItemDatabase() {
  const [data,   setData]   = useState(null);
  const [loading,setLoading]= useState(true);
  const [error,  setError]  = useState(null);

  // Filter-State
  const [search, setSearch] = useState('');
  const [kind,   setKind]   = useState('Alle');
  const [mfr,    setMfr]    = useState('Alle');

  // Sort-State
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Modal-State für Item-Details
  const [selectedItem, setSelectedItem] = useState(null);

  // Daten laden
  useEffect(() => {
    fetch('./data-items.json', { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // Unique Kategorien + Hersteller für Filter-Dropdowns
  const kinds = useMemo(() => {
    if (!data?.items?.length) return ['Alle'];
    const s = new Set(data.items.map(i => i.kind).filter(Boolean));
    return ['Alle', ...Array.from(s).sort()];
  }, [data]);

  const mfrs = useMemo(() => {
    if (!data?.items?.length) return ['Alle'];
    const s = new Set(data.items.map(i => i.manufacturer).filter(Boolean));
    return ['Alle', ...Array.from(s).sort()];
  }, [data]);

  // Gefilterte + sortierte Liste
  const rows = useMemo(() => {
    if (!data?.items) return [];
    let list = data.items;

    if (kind !== 'Alle') list = list.filter(i => i.kind === kind);
    if (mfr  !== 'Alle') list = list.filter(i => i.manufacturer === mfr);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.manufacturer || '').toLowerCase().includes(q) ||
        (i.kind || '').toLowerCase().includes(q) ||
        (i.class_name || '').toLowerCase().includes(q)
      );
    }

    // Sortierung
    return [...list].sort((a, b) => {
      const va = (a[sortCol] ?? '').toString().toLowerCase();
      const vb = (b[sortCol] ?? '').toString().toLowerCase();
      // Numerisch für size/grade
      const na = parseFloat(va), nb = parseFloat(vb);
      const cmp = (!isNaN(na) && !isNaN(nb))
        ? na - nb
        : va.localeCompare(vb);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, kind, mfr, search, sortCol, sortDir]);

  // Spalten-Klick: gleiche Spalte = Richtung umkehren, neue = asc
  function handleSort(col) {
    if (!col.sortable) return;
    if (sortCol === col.key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col.key); setSortDir('asc'); }
  }

  const SortIcon = ({ col }) => sortCol === col.key
    ? <span className="ml-1 opacity-70">{sortDir === 'asc' ? '↑' : '↓'}</span>
    : <span className="ml-1 opacity-25">↕</span>;

  const cacheAge = data?._cached_at ? timeAgo(data._cached_at) : null;

  return (
    <div>
      {/* Quelle + Cache-Info */}
      <div className="glass mb-4 px-4 py-2.5 flex items-center gap-3 text-[12px] text-white/45">
        <span>Quelle: <a href="https://api.star-citizen.wiki" target="_blank" rel="noopener noreferrer"
          className="text-white/65 hover:text-white underline">api.star-citizen.wiki</a> · Spieldaten 4.x</span>
        {cacheAge && <span className="text-white/25">· Cache: {cacheAge}</span>}
      </div>

      {/* ── Filter-Leiste ──────────────────────────────────────────────── */}
      <div className="glass mb-4 px-4 py-3 flex flex-wrap gap-3 items-end">

        {/* Volltextsuche */}
        <div className="flex-1 min-w-[200px] max-w-[280px]">
          <div className="cap mb-1.5">Suche</div>
          <div className="relative">
            <Icon.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Name, Hersteller, Klasse…"
              className="field w-full pl-9 !py-2 !text-[13px]" />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white text-sm">✕</button>
            )}
          </div>
        </div>

        {/* Typ-Filter */}
        <div className="min-w-[160px]">
          <div className="cap mb-1.5">Typ</div>
          <select value={kind} onChange={e => setKind(e.target.value)}
            className="field w-full !py-2 !text-[13px]">
            {kinds.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        {/* Hersteller-Filter */}
        <div className="min-w-[160px]">
          <div className="cap mb-1.5">Hersteller</div>
          <select value={mfr} onChange={e => setMfr(e.target.value)}
            className="field w-full !py-2 !text-[13px]">
            {mfrs.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Filter zurücksetzen */}
        {(search || kind !== 'Alle' || mfr !== 'Alle') && (
          <button onClick={() => { setSearch(''); setKind('Alle'); setMfr('Alle'); }}
            className="btn !py-2 !text-[12px]">
            Filter zurücksetzen
          </button>
        )}

        {/* Treffer-Zahl */}
        <div className="ml-auto text-[12px] text-white/40 self-center">
          {!loading && `${rows.length.toLocaleString('de-DE')} Items`}
        </div>
      </div>

      {/* ── Zustände ───────────────────────────────────────────────────── */}
      {loading && (
        <div className="glass text-center py-12 text-white/40 text-[13px]">
          <Icon.Refresh className="w-5 h-5 mx-auto mb-2 opacity-40 animate-spin" />
          Lade Item-Datenbank…
        </div>
      )}
      {error && !loading && (
        <div className="glass border border-red-500/20 bg-red-500/5 p-5 text-[13px] text-red-300/80 rounded-xl">
          <div className="font-semibold mb-1">Fehler beim Laden</div>
          {error}
          <div className="mt-2 text-[12px] text-white/40">
            GitHub → Actions → Update Items Cache → Run workflow
          </div>
        </div>
      )}
      {!loading && !error && data?._count === 0 && (
        <div className="glass text-center py-12 text-white/40 text-[13px]">
          <div className="mb-1 font-medium">Noch keine Daten vorhanden</div>
          <div className="text-[12px]">GitHub → Actions → Update Items Cache → Run workflow</div>
        </div>
      )}

      {/* ── Tabelle ────────────────────────────────────────────────────── */}
      {!loading && !error && rows.length > 0 && (
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] border-collapse">

              {/* Tabellen-Header */}
              <thead>
                <tr className="border-b border-white/[0.08]">
                  {COLUMNS.map(col => (
                    <th key={col.key}
                        onClick={() => handleSort(col)}
                        className={`cap text-left px-4 py-3 whitespace-nowrap select-none
                          ${col.sortable ? 'cursor-pointer hover:text-white/70' : ''}`}>
                      {col.label}
                      {col.sortable && <SortIcon col={col} />}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Tabellen-Body */}
              <tbody>
                {rows.map((item, i) => (
                  <tr key={item.id || i}
                      onClick={() => setSelectedItem(item)}
                      className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer">

                    {/* Name mit Kategorie-Farbpunkt */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-5 rounded-full flex-none"
                             style={{ background: KIND_COLORS[item.kind] || '#6b7280' }} />
                        <span className="font-medium text-white/90 truncate max-w-[220px]">
                          {item.name}
                        </span>
                      </div>
                    </td>

                    {/* Typ */}
                    <td className="px-3 py-2.5">
                      <span className="chip" style={{
                        background: (KIND_COLORS[item.kind] || '#6b7280') + '22',
                        color:       KIND_COLORS[item.kind] || '#9ca3af',
                        border:     `1px solid ${(KIND_COLORS[item.kind] || '#6b7280')}44`,
                      }}>
                        {item.kind || '—'}
                      </span>
                    </td>

                    {/* Hersteller */}
                    <td className="px-3 py-2.5 text-white/65 truncate max-w-[140px]">
                      {item.manufacturer || '—'}
                    </td>

                    {/* Größe */}
                    <td className="px-3 py-2.5 text-center">
                      {item.size ? (
                        <span className="font-mono text-[12px] text-white/70">{item.size}</span>
                      ) : <span className="text-white/25">—</span>}
                    </td>

                    {/* Grade */}
                    <td className="px-3 py-2.5 text-center">
                      {item.grade ? (
                        <span className="font-mono text-[12px] text-white/70">{item.grade}</span>
                      ) : <span className="text-white/25">—</span>}
                    </td>

                    {/* Link */}
                    <td className="px-4 py-2.5 text-right">
                      <a href={item.wiki_url || `https://api.star-citizen.wiki/items/${encodeURIComponent(item.class_name || '')}`}
                         target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-1.5 text-[11.5px] text-white/35 hover:text-white transition-colors">
                        <Icon.External className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tabellen-Footer */}
          <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between text-[11.5px] text-white/35">
            <span>{rows.length.toLocaleString('de-DE')} von {data?._count?.toLocaleString('de-DE')} Items</span>
            <span>api.star-citizen.wiki · {cacheAge ? `Cache: ${cacheAge}` : ''}</span>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}

// Farben pro Kategorie für Farbpunkte und Badges
const KIND_COLORS = {
  'FPS Waffe':       '#ef4444',
  'Rüstung':         '#3b82f6',
  'Kleidung':        '#8b5cf6',
  'Waffenaufsatz':   '#f97316',
  'Medizin':         '#22c55e',
  'Schiffswaffe':    '#f97316',
  'Schild':          '#14b8a6',
  'Kühler':          '#06b6d4',
  'Reaktor':         '#f59e0b',
  'Quantum-Antrieb': '#a855f7',
  'Flugregler':      '#64748b',
  'Rakete':          '#f43f5e',
  'Mining-Laser':    '#84cc16',
  'Gerät':           '#94a3b8',
};


// Daten sind direkt hier eingebettet (keine externe API nötig).
// Neue Links hinzufügen: einfach ein Objekt in LINK_CATS ergänzen.
// ══════════════════════════════════════════════════════════════════════════════

// Alle Link-Kategorien mit ihren Kacheln
const LINK_CATS = [
  {
    id: 'ships', label: 'Ships & Loadouts',
    // CSS-Gradient als Kachel-Hintergrund (kein externes Bild nötig)
    bg: 'linear-gradient(135deg,#0d2a4a 0%,#0a1f3a 100%)',
    accent: '#3b82f6', icon: '🚀',
    links: [
      { name: 'Erkul.games',       url: 'https://www.erkul.games',                              desc: 'Loadout-Optimizer & DPS-Rechner',           badge: 'Top' },
      { name: 'FleetYards',        url: 'https://fleetyards.net',                               desc: 'Schiffsdatenbank & Vergleichstool'                        },
      { name: 'Ship Perf. Viewer', url: 'https://www.spviewer.eu',                              desc: 'Ausrüstungsstatistiken & Specs'                          },
      { name: 'RSI Pledge Store',  url: 'https://robertsspaceindustries.com/pledge/ships',      desc: 'Offizieller Schiffs-Shop'                                },
    ],
  },
  {
    id: 'trade', label: 'Trading & Economy',
    bg: 'linear-gradient(135deg,#0d3321 0%,#0a2518 100%)',
    accent: '#22c55e', icon: '📈',
    links: [
      { name: 'SC Trade Tools',    url: 'https://sc-trade.tools',                               desc: 'Beste Handelsrouten & Profit',              badge: 'Top' },
      { name: 'UEX Corp',          url: 'https://uexcorp.space',                                desc: 'Live-Marktpreise & Commodity-Daten',        badge: 'Live'},
      { name: 'Gallog',            url: 'https://gallog.co',                                    desc: 'Cargo-Tracking & Reiselogbuch'                           },
      { name: 'SC Market',         url: 'https://sc-market.space',                             desc: 'Spieler-Marktplatz für Items & Schiffe'                  },
    ],
  },
  {
    id: 'maps', label: 'Maps & Navigation',
    bg: 'linear-gradient(135deg,#1e0d4a 0%,#160838 100%)',
    accent: '#a855f7', icon: '🗺️',
    links: [
      { name: 'RSI Starmap',       url: 'https://starmap.robertsspaceindustries.com',           desc: 'Offizielle interaktive Sternenkarte'                     },
      { name: 'Knightfall Map',    url: 'https://sc.knightfall.space',                          desc: 'Planeten, Monde & POIs',                    badge: 'Gut' },
      { name: 'Wiki: Locations',   url: 'https://starcitizen.tools/Locations',                  desc: 'Landezonen, Shops & Outposts'                            },
      { name: 'Mission-Übersicht', url: 'https://starcitizen.tools/List_of_missions',           desc: 'Alle Missions-Typen & Rewards'                          },
    ],
  },
  {
    id: 'patch', label: 'Patch & Roadmap',
    bg: 'linear-gradient(135deg,#2d1a00 0%,#1f1200 100%)',
    accent: '#f59e0b', icon: '📋',
    links: [
      { name: 'Release Roadmap',   url: 'https://robertsspaceindustries.com/roadmap/release-view',          desc: 'Was kommt in welchem Patch?'                },
      { name: 'Progress Tracker',  url: 'https://robertsspaceindustries.com/roadmap/progress-tracker',      desc: 'Feature-Fortschritt aller Teams'            },
      { name: 'Patchnotes',        url: 'https://robertsspaceindustries.com/patch-notes',                   desc: 'Live & PTU Release Notes'                   },
      { name: 'isthisscup.com',    url: 'https://isthisscup.com',                                           desc: 'Server Up? Sofortcheck',    badge: 'Fun'    },
    ],
  },
  {
    id: 'community', label: 'Community & News',
    bg: 'linear-gradient(135deg,#2d1400 0%,#1f0e00 100%)',
    accent: '#f97316', icon: '💬',
    links: [
      { name: 'RSI Spectrum',      url: 'https://robertsspaceindustries.com/spectrum/community/SC',         desc: 'Offizielles Forum & Dev-Kommunikation'      },
      { name: 'r/starcitizen',     url: 'https://www.reddit.com/r/starcitizen',                             desc: 'Reddit: News, Clips & Diskussionen'         },
      { name: 'Comm-Link',         url: 'https://robertsspaceindustries.com/comm-link/',                    desc: 'Offizielle CIG-Ankündigungen & Lore'        },
      { name: 'CIG YouTube',       url: 'https://www.youtube.com/@CIGCommunity',                            desc: 'Offizieller Entwickler-Kanal'               },
    ],
  },
  {
    id: 'tools', label: 'Tools & Account',
    bg: 'linear-gradient(135deg,#0a2a2a 0%,#071e1e 100%)',
    accent: '#14b8a6', icon: '⚙️',
    links: [
      { name: 'Star Citizen Wiki',  url: 'https://starcitizen.tools',                                       desc: 'Vollständiges Spiel-Lexikon',  badge: 'Ref' },
      { name: 'RSI Account',        url: 'https://robertsspaceindustries.com/account',                      desc: 'Hangar & Kontoverwaltung'                   },
      { name: 'RSI Launcher',       url: 'https://robertsspaceindustries.com/launcher',                     desc: 'Game-Client & PTU Download'                 },
      { name: 'RSI Support',        url: 'https://support.robertsspaceindustries.com',                      desc: 'Bug-Reports & Ticket-System'                },
    ],
  },
];

// Badge-Farben
const BADGE_COLORS = {
  Top:  { bg: 'rgba(59,130,246,0.25)',  color: '#93c5fd' },
  Live: { bg: 'rgba(34,197,94,0.25)',   color: '#86efac' },
  Gut:  { bg: 'rgba(168,85,247,0.25)',  color: '#d8b4fe' },
  Fun:  { bg: 'rgba(245,158,11,0.25)',  color: '#fcd34d' },
  Ref:  { bg: 'rgba(20,184,166,0.25)',  color: '#5eead4' },
};

function QuickLinks() {
  const [search, setSearch] = useState('');

  // Suche: filtert über alle Kategorien und Links
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return LINK_CATS;
    return LINK_CATS
      .map(cat => ({
        ...cat,
        links: cat.links.filter(l =>
          l.name.toLowerCase().includes(q) ||
          l.desc.toLowerCase().includes(q) ||
          cat.label.toLowerCase().includes(q)
        ),
      }))
      .filter(cat => cat.links.length > 0);
  }, [search]);

  return (
    <div>
      {/* Suchfeld */}
      <div className="relative mb-6 max-w-[360px]">
        <Icon.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Suchen... (z.B. Erkul, Trade, Map)"
          className="field w-full pl-9 !py-2.5"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white text-sm">✕</button>
        )}
      </div>

      {/* Kacheln-Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(cat => (
          <LinkCard key={cat.id} cat={cat} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-white/35 text-[13px]">
          <Icon.Search className="w-6 h-6 mx-auto mb-2 opacity-40" />
          Keine Ergebnisse für &ldquo;{search}&rdquo;
        </div>
      )}
    </div>
  );
}

// Einzelne Kachel-Karte für eine Kategorie
function LinkCard({ cat }) {
  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.08]"
         style={{ background: cat.bg }}>

      {/* Kachel-Header mit Kategorie-Icon und Titel */}
      <div className="px-5 py-4 flex items-center gap-3"
           style={{ borderBottom: `1px solid ${cat.accent}22` }}>
        <span className="text-2xl">{cat.icon}</span>
        <div>
          <div className="text-[13px] font-semibold text-white/90">{cat.label}</div>
          <div className="text-[11px]" style={{ color: cat.accent + 'aa' }}>
            {cat.links.length} Links
          </div>
        </div>
        {/* Farbiger Akzent-Punkt */}
        <div className="ml-auto w-2 h-2 rounded-full flex-none"
             style={{ background: cat.accent, boxShadow: `0 0 8px ${cat.accent}` }} />
      </div>

      {/* Link-Liste */}
      <div className="p-2">
        {cat.links.map((link, i) => (
          <LinkRow key={i} link={link} accent={cat.accent} />
        ))}
      </div>
    </div>
  );
}

// Eine Link-Zeile innerhalb einer Kachel
function LinkRow({ link, accent }) {
  const [hovered, setHovered] = useState(false);
  const badge = link.badge ? BADGE_COLORS[link.badge] : null;

  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer"
       className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
       style={{ background: hovered ? 'rgba(255,255,255,0.07)' : 'transparent' }}
       onMouseEnter={() => setHovered(true)}
       onMouseLeave={() => setHovered(false)}>

      {/* Aktiv-Balken links beim Hover */}
      <div className="w-0.5 h-6 rounded-full flex-none transition-all"
           style={{ background: hovered ? accent : 'transparent' }} />

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-white/90 truncate"
             style={{ color: hovered ? accent : undefined }}>
          {link.name}
        </div>
        <div className="text-[11px] text-white/40 truncate">{link.desc}</div>
      </div>

      {/* Badge */}
      {badge && (
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-none"
              style={{ background: badge.bg, color: badge.color }}>
          {link.badge}
        </span>
      )}

      {/* Pfeil */}
      <span className="text-[12px] flex-none transition-transform"
            style={{ color: accent + '80', transform: hovered ? 'translateX(2px)' : 'none' }}>
        →
      </span>
    </a>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════════════════════════════

// TopBar — sticky Header mit Logo und Suche
function TopBar({ query, setQuery }) {
  return (
    <header className="glass-strong px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-7-7 18-2-9z"/></svg>
        </div>
        <div className="leading-tight">
          <div className="text-[14px] font-semibold tracking-tight">SC Navigator</div>
          <div className="text-[11.5px] text-white/45">Citizen Command Hub</div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full lg:w-auto">
        <div className="relative flex-1 lg:flex-none">
          <Icon.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Schnell suchen…" className="field w-full lg:w-[260px] pl-9 !py-2" />
        </div>
        <button className="btn !p-2"><Icon.Bell className="w-4 h-4" /></button>
        <button className="btn !p-2"><Icon.Comms className="w-4 h-4" /></button>
        <div className="w-8 h-8 rounded-lg flex-none border border-white/10 bg-white/[0.04] flex items-center justify-center text-[11.5px] font-semibold">LT</div>
      </div>
    </header>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// NOTES
// ══════════════════════════════════════════════════════════════════════════════

const NOTES_KEY = 'sc-nav.notes';

function loadNotes() {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY)) || []; } catch { return []; }
}
function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function renderMarkdown(md) {
  if (!md) return '';
  // fenced code blocks first (preserve content)
  const blocks = [];
  let html = md.replace(/```([\w]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = blocks.length;
    blocks.push(`<pre><code>${code.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>`);
    return `\x00BLOCK${idx}\x00`;
  });
  html = html
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
    .replace(/^> (.+)$/gm,   '<blockquote>$1</blockquote>')
    .replace(/^---+$/gm, '<hr>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,  '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*\*([^*\n]+)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*([^*\n]+)\*\*/g,     '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g,         '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm,      '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm,  '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/\n\n+/g, '\n\n')
    .split('\n\n').map(p => {
      if (/^<(h[1-3]|hr|ul|blockquote|pre|\x00BLOCK)/.test(p.trim())) return p;
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');
  blocks.forEach((b, i) => { html = html.replace(`\x00BLOCK${i}\x00`, b); });
  return html;
}

function NotesPanel() {
  const [notes, setNotes]       = useState(() => loadNotes());
  const [activeId, setActiveId] = useState(() => { const n = loadNotes(); return n.length ? n[0].id : null; });
  const [preview, setPreview]   = useState(false);
  const [serverUrl, setServerUrl] = useState(() => localStorage.getItem('sc-nav.notes-server') || '');
  const [serverInput, setServerInput] = useState('');
  const [showConfig, setShowConfig]   = useState(false);
  const [syncing, setSyncing]   = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // 'ok' | 'err' | null
  const syncTimer = useRef(null);

  const active = notes.find(n => n.id === activeId) || null;

  // On mount: pull notes from server if URL is configured
  useEffect(() => {
    if (!serverUrl) return;
    pullServer(serverUrl, true);
  }, []);

  // Debounced auto-push to server on every notes change
  useEffect(() => {
    if (!serverUrl || !notes.length) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => pushServer(serverUrl), 3000);
    return () => clearTimeout(syncTimer.current);
  }, [notes, serverUrl]);

  async function pullServer(url, silent = false) {
    if (!silent) setSyncing(true);
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      const serverNotes = Array.isArray(j.notes) ? j.notes : [];
      const local = loadNotes();
      const merged = [...serverNotes];
      local.forEach(loc => { if (!merged.find(s => s.id === loc.id)) merged.push(loc); });
      merged.sort((a, b) => (b.updated || 0) - (a.updated || 0));
      setNotes(merged);
      saveNotes(merged);
      if (merged.length && !activeId) setActiveId(merged[0].id);
      if (!silent) setSyncStatus('ok');
    } catch { if (!silent) setSyncStatus('err'); }
    finally { if (!silent) setSyncing(false); }
  }

  async function pushServer(url) {
    const current = loadNotes();
    if (!current.length) return;
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: current }),
      });
      if (!r.ok) throw new Error();
      setSyncStatus('ok');
    } catch { setSyncStatus('err'); }
  }

  function saveServer(url) {
    const u = url.trim();
    localStorage.setItem('sc-nav.notes-server', u);
    setServerUrl(u);
    setShowConfig(false);
    if (u) pullServer(u, false);
  }

  function persist(updated) {
    setNotes(updated);
    saveNotes(updated);
  }

  function setContent(text) {
    persist(notes.map(n => n.id === activeId ? { ...n, content: text, updated: Date.now() } : n));
  }

  function createNote() {
    const title = prompt('Titel der neuen Notiz:');
    if (!title) return;
    const note = { id: Date.now().toString(), title: title.trim(), content: `# ${title.trim()}\n\n`, created: Date.now(), updated: Date.now() };
    const updated = [note, ...notes];
    persist(updated);
    setActiveId(note.id);
    setPreview(false);
  }

  function deleteNote() {
    if (!active) return;
    if (!confirm(`Notiz "${active.title}" löschen?`)) return;
    const updated = notes.filter(n => n.id !== activeId);
    persist(updated);
    setActiveId(updated.length ? updated[0].id : null);
  }

  function renameNote() {
    if (!active) return;
    const title = prompt('Neuer Titel:', active.title);
    if (!title || title === active.title) return;
    persist(notes.map(n => n.id === activeId ? { ...n, title: title.trim() } : n));
  }

  function exportNotes() {
    const json = JSON.stringify(notes, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `sc-notizen-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importNotes(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (!Array.isArray(imported)) throw new Error();
        const merged = [...imported];
        notes.forEach(existing => {
          if (!merged.find(m => m.id === existing.id)) merged.push(existing);
        });
        merged.sort((a, b) => (b.updated || 0) - (a.updated || 0));
        persist(merged);
        if (merged.length) setActiveId(merged[0].id);
      } catch { alert('Ungültige Backup-Datei.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  if (notes.length === 0 && !active) return (
    <div className="flex flex-col items-center gap-5 py-16 text-center">
      <Icon.Note className="w-14 h-14 text-white/15" />
      <div>
        <p className="text-[14px] text-white/70 mb-1 font-medium">Noch keine Notizen</p>
        <p className="cap">Erstelle deine erste Notiz im Markdown-Format.</p>
      </div>
      <div className="flex gap-2">
        <button className="btn btn-accent" onClick={createNote}>
          <Icon.Plus className="w-4 h-4" />
          Neue Notiz
        </button>
        <label className="btn cursor-pointer" title="Backup importieren">
          <Icon.Refresh className="w-4 h-4" />
          Backup laden
          <input type="file" accept=".json" className="hidden" onChange={importNotes} />
        </label>
      </div>
    </div>
  );

  return (
    <div className="flex gap-4" style={{ height: 'calc(100vh - 180px)', minHeight: '480px' }}>
      {/* Note list */}
      <div className="glass w-[200px] flex-none flex flex-col">
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.06]">
          <span className="text-[12px] font-semibold text-white/80">Notizen</span>
          <div className="flex gap-1">
            <button className="btn !p-1" title="Neue Notiz" onClick={createNote}>
              <Icon.Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {notes.map(n => (
            <button key={n.id} onClick={() => { setActiveId(n.id); setPreview(false); }}
              className={`w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] transition-colors hover:bg-white/[0.04] ${n.id === activeId ? 'bg-white/[0.07] text-white' : 'text-white/60'}`}>
              <Icon.Doc className="w-3.5 h-3.5 flex-none opacity-50" />
              <span className="truncate">{n.title}</span>
            </button>
          ))}
        </div>
        <div className="border-t border-white/[0.06] p-2 flex gap-1.5">
          <button className="btn !p-1.5 flex-1 justify-center text-[11px] text-white/50 hover:text-white/80 gap-1.5" onClick={exportNotes} title="Alle Notizen als JSON-Datei sichern">
            <Icon.External className="w-3 h-3" />
            Export
          </button>
          <label className="btn !p-1.5 flex-1 justify-center text-[11px] text-white/50 hover:text-white/80 gap-1.5 cursor-pointer" title="Backup-Datei importieren">
            <Icon.Refresh className="w-3 h-3" />
            Import
            <input type="file" accept=".json" className="hidden" onChange={importNotes} />
          </label>
        </div>

        {/* Server-Config */}
        <div className="border-t border-white/[0.06] p-2">
          {showConfig ? (
            <div className="flex flex-col gap-1.5">
              <input
                className="field !py-1 !text-[11px] font-mono"
                placeholder="https://dein-server.de/notes-api.php"
                value={serverInput}
                onChange={e => setServerInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveServer(serverInput)}
              />
              <div className="flex gap-1">
                <button className="btn btn-accent !py-1 !text-[11px] flex-1" onClick={() => saveServer(serverInput)}>Speichern</button>
                <button className="btn !py-1 !text-[11px]" onClick={() => setShowConfig(false)}>✕</button>
              </div>
              {serverUrl && <button className="text-[10px] text-white/30 hover:text-red-400 text-left px-1" onClick={() => saveServer('')}>Server trennen</button>}
            </div>
          ) : (
            <button
              onClick={() => { setServerInput(serverUrl); setShowConfig(true); }}
              className="btn !p-1.5 w-full justify-center gap-1.5 text-[11px] text-white/35 hover:text-white/70">
              {serverUrl
                ? <><span className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'ok' ? 'bg-green-400' : syncStatus === 'err' ? 'bg-red-400' : 'bg-white/30'}`}/>
                    {syncing ? 'Sync…' : 'Server verbunden'}</>
                : <><Icon.Globe className="w-3 h-3"/>Server verbinden</>}
            </button>
          )}
        </div>
      </div>

      {/* Editor / Preview */}
      <div className="glass flex-1 flex flex-col min-w-0">
        {active && (
          <>
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/[0.06] flex-none">
              <button className="text-[13px] font-semibold flex-1 truncate text-left hover:text-white/70 transition-colors" onClick={renameNote} title="Umbenennen">
                {active.title}
              </button>
              <button className={`btn !p-1.5 ${preview ? 'btn-accent' : ''}`} onClick={() => setPreview(v => !v)} title={preview ? 'Editor' : 'Vorschau'}>
                <Icon.Eye className="w-3.5 h-3.5" />
              </button>
              <button className="btn !p-1.5 hover:text-red-400" onClick={deleteNote} title="Löschen">
                <Icon.Trash className="w-3.5 h-3.5" />
              </button>
            </div>
            {preview ? (
              <div className="flex-1 overflow-y-auto px-7 py-5 prose-notes"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(active.content) }} />
            ) : (
              <textarea
                className="flex-1 w-full bg-transparent resize-none px-7 py-5 text-[13px] font-mono text-white/85 focus:outline-none leading-relaxed"
                value={active.content}
                spellCheck={false}
                placeholder="Markdown eingeben…"
                onChange={e => setContent(e.target.value)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Sidebar — linke Navigation
// Aktiv: Übersicht. Andere Items sind vorbereitet aber noch ausgegraut.
function Sidebar({ section, setSection }) {
  const items = [
    { id: 'status',  label: 'Übersicht',  icon: 'Status',  active: true  },
    { id: 'links',   label: 'Quick Links',icon: 'Book',    active: true  },
    { id: 'items',   label: 'Item-DB',    icon: 'Cube',    active: true  },
    { id: 'notes',   label: 'Notizen',    icon: 'Note',    active: true  },
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

          {/* ── Tab: Übersicht ─────────────────────────────────────────── */}
          {section === 'status' && (
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
          )}

          {/* ── Tab: Quick Links ───────────────────────────────────────── */}
          {section === 'links' && (
            <div id="links">
              <div className="mb-6">
                <div className="text-[12px] text-white/45 mb-2">Community Tools</div>
                <h1 className="text-[28px] leading-[1.1] font-semibold tracking-tight">Quick Links</h1>
                <p className="text-white/55 text-[14px] mt-2">
                  Alle wichtigen Star Citizen Tools auf einen Blick.
                </p>
              </div>
              <QuickLinks />
            </div>
          )}

          {/* ── Tab: Item-Datenbank ───────────────────────────────────── */}
          {section === 'items' && (
            <div id="items">
              <div className="mb-6">
                <div className="text-[12px] text-white/45 mb-2">Star Citizen Wiki</div>
                <h1 className="text-[28px] leading-[1.1] font-semibold tracking-tight">Item-Datenbank</h1>
                <p className="text-white/55 text-[14px] mt-2">
                  Waffen, Rüstungen, Schiffskomponenten — direkt aus der SC Wiki.
                </p>
              </div>
              <ItemDatabase />
            </div>
          )}

          {/* ── Tab: Notizen ──────────────────────────────────────────── */}
          {section === 'notes' && (
            <div id="notes">
              <div className="mb-6">
                <div className="text-[12px] text-white/45 mb-2">Persönliche Notizen</div>
                <h1 className="text-[28px] leading-[1.1] font-semibold tracking-tight">Notizen</h1>
                <p className="text-white/55 text-[14px] mt-2">
                  Markdown-Notizen mit Bildunterstützung — lokal gespeichert im <code className="font-mono text-[13px]">Notes/</code>-Ordner.
                </p>
              </div>
              <NotesPanel />
            </div>
          )}

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
