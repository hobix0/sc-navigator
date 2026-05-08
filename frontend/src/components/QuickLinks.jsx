// ──────────────────────────────────────────────────────────────────────────────
// QuickLinks.jsx — Schnellzugriff Tab
//
// Layout exakt wie VORTEX "Vessel Command Hub":
//
//   ┌─────────────────────────────────────────────────────┐
//   │  Seiten-Titel + Untertitel (links oben)             │
//   ├──────────────────┬──────────────────────────────────┤
//   │  LEFT SIDEBAR    │  HAUPT-PANEL                     │
//   │                  │                                  │
//   │  [🚀 Ships]      │  [Panel-Titel der Kategorie]     │
//   │  [📈 Trading]    │                                  │
//   │  [🗺️ Maps]      │  Row: Name ──── desc ──── →      │
//   │  [📋 Patch]      │  ─────────────────────────────── │
//   │  [💬 Community]  │  Row: Name ──── desc ──── →      │
//   │  [⚙️ Tools]      │  ...                             │
//   │                  │                                  │
//   └──────────────────┴──────────────────────────────────┘
//
// Die Sidebar entspricht dem linken Navigations-Panel in VORTEX
// (Defense, Energy, Time Log, Targeting, Cargo, Systems).
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react'
import { LINK_CATEGORIES, BADGE_CONFIG } from '../data/links.js'

// ── Badge-Mapping auf CSS-Klassen ─────────────────────────────────────────────
// 'top' → orange outline, 'live' → grün, rest → gedämpft
const BADGE_CLASS = {
  top:  'badge-outline',
  live: 'badge-green',
  new:  'badge-outline',
  p2p:  'badge-muted',
  fun:  'badge-muted',
  ref:  'badge-muted',
}

export default function QuickLinks() {
  // ── State ──────────────────────────────────────────────────────────────────
  // ID der aktiv ausgewählten Kategorie (Standard: erste Kategorie)
  const [activeCat, setActiveCat]   = useState(LINK_CATEGORIES[0].id)
  const [search, setSearch]         = useState('')

  // ── Aktive Kategorie-Daten ─────────────────────────────────────────────────
  const category = useMemo(
    () => LINK_CATEGORIES.find(c => c.id === activeCat) || LINK_CATEGORIES[0],
    [activeCat]
  )

  // ── Gefilterte Links ────────────────────────────────────────────────────────
  // Filtert Links der aktiven Kategorie nach dem Suchbegriff
  const links = useMemo(() => {
    if (!search.trim()) return category.items
    const q = search.toLowerCase()
    return category.items.filter(
      item => item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
    )
  }, [category, search])

  // ── Globale Suche: welche Kategorien haben Treffer? ────────────────────────
  const globalMatches = useMemo(() => {
    if (!search.trim()) return {}
    const q = search.toLowerCase()
    const counts = {}
    LINK_CATEGORIES.forEach(cat => {
      const n = cat.items.filter(
        i => i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)
      ).length
      if (n > 0) counts[cat.id] = n
    })
    return counts
  }, [search])

  return (
    <div style={S.page}>

      {/* ── Seiten-Header (wie "Vessel Command Hub" im VORTEX) ────────── */}
      <div style={S.pageHeader}>
        <div>
          <h1 style={S.pageTitle}>SC Navigator</h1>
          <p style={S.pageSubtitle}>Alle wichtigen Star Citizen Tools auf einen Blick</p>
        </div>

        {/* Suchfeld (rechts im Header-Bereich) */}
        <div style={S.searchWrap}>
          {/* Such-Icon */}
          <svg style={S.searchIcon} width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4.2" stroke="rgba(130,160,175,0.5)" strokeWidth="1.2"/>
            <line x1="8.5" y1="8.5" x2="12" y2="12" stroke="rgba(130,160,175,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <input
            className="input"
            style={S.searchInput}
            placeholder="Suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button style={S.clearBtn} onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* ── Haupt-Layout: Sidebar + Content ───────────────────────────── */}
      <div style={S.layout}>

        {/* ── LEFT SIDEBAR — entspricht VORTEX Links-Navigation ───────── */}
        <aside style={S.sidebar}>
          {LINK_CATEGORIES.map(cat => {
            const isActive  = cat.id === activeCat
            // Zeigt Anzahl Suchergebnisse als Badge wenn Suche aktiv
            const matchCount = globalMatches[cat.id]

            return (
              <button
                key={cat.id}
                style={S.sidebarItem(isActive)}
                onClick={() => setActiveCat(cat.id)}
              >
                {/* Kategorie-Icon */}
                <span style={S.sidebarIcon}>{cat.icon}</span>

                {/* Kategorie-Label */}
                <span style={S.sidebarLabel(isActive)}>{cat.label}</span>

                {/* Suchergebnis-Count Badge (nur wenn Suche aktiv) */}
                {search && matchCount !== undefined && (
                  <span style={S.matchBadge}>{matchCount}</span>
                )}

                {/* Aktiv-Markierung: orangener linker Balken */}
                {isActive && <span style={S.activeBar} />}
              </button>
            )
          })}
        </aside>

        {/* ── HAUPT-PANEL — entspricht VORTEX Center/Right Panels ─────── */}
        <main style={S.content}>
          <div className="panel" style={S.mainPanel}>

            {/* Panel-Titel (wie "Ship Statistics" im VORTEX Design) */}
            <div className="panel-title" style={S.panelHeader}>
              <span>{category.icon} {category.label}</span>
              <span className="label" style={{ marginLeft: 'auto' }}>
                {links.length} TOOLS
              </span>
            </div>

            {/* ── Link-Zeilen ─────────────────────────────────────────── */}
            <div>
              {links.length === 0 ? (
                // Keine Ergebnisse
                <div style={S.empty}>
                  <span>🔭</span>
                  <span>Keine Ergebnisse für &quot;{search}&quot;</span>
                </div>
              ) : (
                links.map((item, i) => (
                  <LinkRow
                    key={item.id}
                    item={item}
                    isLast={i === links.length - 1}
                  />
                ))
              )}
            </div>

          </div>

          {/* ── Hinweis-Panel (wie "Ship Overview" im VORTEX) ─────────── */}
          <InfoPanel />

        </main>

      </div>
    </div>
  )
}

// ── LinkRow ───────────────────────────────────────────────────────────────────
// Eine einzelne Link-Zeile im VORTEX-Panel-Stil:
// [Name] ──────────── [Beschreibung] ──── [Badge] [→]
function LinkRow({ item, isLast }) {
  const [hovered, setHovered] = useState(false)
  const badgeClass = item.badge ? BADGE_CLASS[item.badge] : null
  const badgeCfg   = item.badge ? BADGE_CONFIG[item.badge] : null

  return (
    <>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        style={S.linkRow(hovered)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Name */}
        <span style={S.linkName(hovered)}>{item.name}</span>

        {/* Trennpunkte (VORTEX "Dots" zwischen Label und Wert) */}
        <span style={S.dots} aria-hidden="true" />

        {/* Beschreibung */}
        <span style={S.linkDesc}>{item.desc}</span>

        {/* Badge + Pfeil */}
        <div style={S.linkRight}>
          {badgeCfg && (
            <span className={`badge ${badgeClass}`}>{badgeCfg.label}</span>
          )}
          <span style={S.arrow(hovered)}>→</span>
        </div>
      </a>
      {!isLast && <div className="divider" />}
    </>
  )
}

// ── InfoPanel ─────────────────────────────────────────────────────────────────
// Kleines rechtes Panel mit Kurzinfos (wie "Ship Overview" im VORTEX Design)
function InfoPanel() {
  const stats = [
    { label: 'Gesamt Tools',  value: LINK_CATEGORIES.reduce((a, c) => a + c.items.length, 0) },
    { label: 'Kategorien',    value: LINK_CATEGORIES.length },
    { label: 'Version',       value: 'SC Alpha 4.x' },
    { label: 'Datenstand',    value: 'Stanton' },
  ]

  return (
    <aside className="panel" style={S.infoPanel}>
      <div className="panel-title">System Info</div>
      <div style={{ padding: '4px 0' }}>
        {stats.map(({ label, value }, i) => (
          <div key={i} style={S.statRow}>
            <span className="label">{label}</span>
            <span style={S.statValue}>{value}</span>
          </div>
        ))}
      </div>

      {/* Trennlinie */}
      <div className="divider" style={{ margin: '8px 0' }} />

      {/* Roadmap-Vorschau */}
      <div style={{ padding: '8px 16px 14px' }}>
        <div className="label" style={{ marginBottom: '8px', display: 'block' }}>Roadmap</div>
        {[
          { label: 'Sternenkarte',  status: 'planned' },
          { label: 'Item-Datenbank', status: 'planned' },
          { label: 'Calculators',   status: 'planned' },
          { label: 'Flotte',        status: 'planned' },
        ].map(item => (
          <div key={item.label} style={S.roadmapRow}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.label}</span>
            <span className="badge badge-muted">SOON</span>
          </div>
        ))}
      </div>
    </aside>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: 'calc(100vh - 56px)',
    padding: '1.5rem 1.5rem 2rem',
    maxWidth: '1600px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },

  pageHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap',
  },

  pageTitle: {
    fontFamily: "'Orbitron', monospace",
    fontSize: '20px',
    fontWeight: '600',
    color: '#eef3f5',
    letterSpacing: '0.05em',
    marginBottom: '3px',
  },

  pageSubtitle: {
    fontSize: '13px',
    color: 'rgba(185, 205, 215, 0.55)',
  },

  searchWrap: {
    position: 'relative',
    width: '240px',
    flexShrink: 0,
  },

  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },

  searchInput: {
    paddingLeft: '34px',
    paddingRight: '32px',
    fontSize: '12px',
    height: '36px',
  },

  clearBtn: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'rgba(130,160,175,0.5)',
    cursor: 'pointer',
    fontSize: '11px',
    padding: '2px',
  },

  // Haupt-Layout: Sidebar + Content nebeneinander
  layout: {
    display: 'flex',
    gap: '1rem',
    flex: 1,
    alignItems: 'flex-start',
    minHeight: 0,
  },

  // ── Sidebar (entspricht VORTEX linkes Nav-Panel) ──────────────────────
  sidebar: {
    width: '200px',
    flexShrink: 0,
    background: 'rgba(8, 14, 18, 0.97)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: '72px', // Klebt unterhalb des Headers
  },

  sidebarItem: (isActive) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '13px 16px',
    background: isActive ? 'rgba(255, 107, 43, 0.08)' : 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'background 0.15s ease',
    overflow: 'hidden',
  }),

  sidebarIcon: {
    fontSize: '15px',
    flexShrink: 0,
    lineHeight: 1,
    width: '20px',
    textAlign: 'center',
  },

  sidebarLabel: (isActive) => ({
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: isActive ? '600' : '400',
    color: isActive ? '#FF8C55' : 'rgba(185, 205, 215, 0.65)',
    flex: 1,
    transition: 'color 0.15s ease',
  }),

  matchBadge: {
    fontSize: '10px',
    padding: '1px 6px',
    borderRadius: '10px',
    background: 'rgba(255,107,43,0.15)',
    color: '#FF8C55',
    fontWeight: '600',
    border: '1px solid rgba(255,107,43,0.3)',
  },

  // Oranger Balken links bei aktivem Item (wie VORTEX aktiv-Markierung)
  activeBar: {
    position: 'absolute',
    left: 0,
    top: '15%',
    bottom: '15%',
    width: '2.5px',
    borderRadius: '2px',
    background: '#FF6B2B',
    boxShadow: '0 0 8px rgba(255,107,43,0.5)',
  },

  // ── Content ────────────────────────────────────────────────────────────
  content: {
    flex: 1,
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
    minWidth: 0,
  },

  mainPanel: {
    flex: 1,
    minWidth: 0,
  },

  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
  },

  // ── Link-Zeile ──────────────────────────────────────────────────────────
  linkRow: (hovered) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    textDecoration: 'none',
    background: hovered ? 'rgba(255,107,43,0.04)' : 'transparent',
    transition: 'background 0.15s ease',
    minWidth: 0,
  }),

  linkName: (hovered) => ({
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    fontWeight: '500',
    color: hovered ? '#FF8C55' : '#eef3f5',
    flexShrink: 0,
    minWidth: '140px',
    transition: 'color 0.15s ease',
  }),

  // Gepunktete Linie zwischen Name und Beschreibung (VORTEX-Stil)
  dots: {
    flex: 1,
    height: '1px',
    background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 2px, transparent 2px, transparent 7px)',
    minWidth: '20px',
    flexShrink: 1,
  },

  linkDesc: {
    fontSize: '11px',
    color: 'rgba(130, 160, 175, 0.55)',
    flexShrink: 0,
    maxWidth: '280px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  linkRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
    marginLeft: '8px',
  },

  arrow: (hovered) => ({
    fontSize: '14px',
    color: hovered ? '#FF6B2B' : 'rgba(130,160,175,0.35)',
    transition: 'color 0.15s ease, transform 0.15s ease',
    transform: hovered ? 'translateX(2px)' : 'translateX(0)',
  }),

  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    padding: '3rem',
    color: 'rgba(130,160,175,0.45)',
    fontSize: '13px',
  },

  // ── Info-Panel (rechts, wie "Ship Overview" in VORTEX) ─────────────────
  infoPanel: {
    width: '200px',
    flexShrink: 0,
  },

  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '9px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },

  statValue: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#eef3f5',
    fontFamily: "'Outfit', sans-serif",
  },

  roadmapRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '7px',
  },
}
