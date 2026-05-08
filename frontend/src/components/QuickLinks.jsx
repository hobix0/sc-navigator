// ──────────────────────────────────────────────────────────────────────────────
// QuickLinks Komponente
//
// Zeigt alle Link-Kategorien aus /data/links.js als Glassmorphismus-Karten an.
//
// Features:
//   - Suchfunktion filtert live über alle Links
//   - Hover-Effekte: Glow, Icon-Animation, Slide-Arrow
//   - Responsive 2-3 Spalten Grid
//   - Kategorie-spezifische Akzentfarben
//   - Einblende-Animation beim ersten Laden
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react'
import { LINK_CATEGORIES, BADGE_CONFIG } from '../data/links.js'

export default function QuickLinks() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')  // Suchfeld-Wert

  // ── Gefilterte Kategorien ─────────────────────────────────────────────────
  // useMemo verhindert unnötige Neuberechnungen bei anderen Re-Renders
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return LINK_CATEGORIES // Keine Suche → alles anzeigen

    // Filtert: Kategorie bleibt wenn mindestens ein Link matched
    return LINK_CATEGORIES
      .map(cat => ({
        ...cat,
        items: cat.items.filter(
          item =>
            item.name.toLowerCase().includes(q) ||
            item.desc.toLowerCase().includes(q) ||
            cat.label.toLowerCase().includes(q)
        ),
      }))
      .filter(cat => cat.items.length > 0)
  }, [search])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-content">

      {/* ── Seiten-Header ──────────────────────────────────────────────────── */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Schnellzugriff</h1>
          <p style={styles.pageSubtitle}>
            Die wichtigsten Star Citizen Tools & Community-Ressourcen auf einen Blick
          </p>
        </div>

        {/* Suchfeld */}
        <div style={styles.searchWrapper}>
          <SearchIcon />
          <input
            className="input"
            style={styles.searchInput}
            placeholder="Suchen... (z.B. Trade, Erkul, Wiki)"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {/* X-Button um Suche zu löschen */}
          {search && (
            <button
              style={styles.clearBtn}
              onClick={() => setSearch('')}
              aria-label="Suche löschen"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Link-Karten Grid ───────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        // Keine Treffer
        <div style={styles.emptyState}>
          <span style={{ fontSize: '32px' }}>🔭</span>
          <span>Keine Ergebnisse für &quot;{search}&quot;</span>
        </div>
      ) : (
        <div className="grid-cards">
          {filtered.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
            />
          ))}
        </div>
      )}

    </div>
  )
}

// ── CategoryCard: Eine Kategorie-Karte mit allen Links ──────────────────────
function CategoryCard({ category }) {
  // Akzentfarbe für diese Kategorie bestimmen
  const accent = ACCENT_COLORS[category.accent] || ACCENT_COLORS.cyan

  return (
    <div
      className="glass animate-in"
      style={{
        ...styles.card,
        // Oberer Rand in der Kategorie-Akzentfarbe
        borderTop: `1.5px solid ${accent.border}`,
      }}
    >
      {/* Karten-Header: Icon + Kategoriename */}
      <div style={styles.cardHeader}>
        <span style={styles.cardIcon}>{category.icon}</span>
        <span
          className="label-text"
          style={{ color: accent.text }}
        >
          {category.label}
        </span>
      </div>

      {/* Link-Liste */}
      <div style={styles.linkList}>
        {category.items.map((item, index) => (
          <LinkRow
            key={item.id}
            item={item}
            accent={accent}
            isLast={index === category.items.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

// ── LinkRow: Eine einzelne Link-Zeile ────────────────────────────────────────
function LinkRow({ item, accent, isLast }) {
  const [hovered, setHovered] = useState(false)

  // Badge-Konfiguration aus BADGE_CONFIG laden
  const badge = item.badge ? BADGE_CONFIG[item.badge] : null

  return (
    <>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        style={styles.linkRow(hovered)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Linke Seite: Name + Beschreibung */}
        <div style={styles.linkContent}>
          <span
            style={{
              ...styles.linkName,
              // Hover: Akzentfarbe
              color: hovered ? accent.text : 'var(--text-primary)',
            }}
          >
            {item.name}
          </span>
          <span style={styles.linkDesc}>{item.desc}</span>
        </div>

        {/* Rechte Seite: Badge + Arrow */}
        <div style={styles.linkRight}>
          {badge && (
            <span className={`badge badge-${badge.style}`}>
              {badge.label}
            </span>
          )}
          {/* Arrow-Icon: bewegt sich beim Hover nach rechts */}
          <span
            style={{
              ...styles.arrow,
              transform: hovered ? 'translateX(3px)' : 'translateX(0)',
              color: hovered ? accent.text : 'var(--text-dim)',
            }}
          >
            →
          </span>
        </div>

        {/* Hover-Glow Effekt (subtile farbige Linie links) */}
        {hovered && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '20%',
              bottom: '20%',
              width: '2px',
              borderRadius: '2px',
              background: accent.text,
              boxShadow: `0 0 8px ${accent.glow}`,
            }}
          />
        )}
      </a>

      {/* Trennlinie zwischen Links (außer nach dem letzten) */}
      {!isLast && <div className="divider" />}
    </>
  )
}

// ── Such-Icon SVG ─────────────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg
      style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      width="15" height="15" viewBox="0 0 15 15" fill="none"
    >
      <circle cx="6.5" cy="6.5" r="5" stroke="rgba(100,140,180,0.5)" strokeWidth="1.3" />
      <line x1="10" y1="10" x2="13.5" y2="13.5" stroke="rgba(100,140,180,0.5)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

// ── Akzentfarben-Map ──────────────────────────────────────────────────────────
// Jede Kategorie bekommt eine Farbe aus diesem Objekt
const ACCENT_COLORS = {
  cyan: {
    text:   '#00d4ff',
    border: 'rgba(0, 212, 255, 0.4)',
    glow:   'rgba(0, 212, 255, 0.3)',
    bg:     'rgba(0, 212, 255, 0.05)',
  },
  purple: {
    text:   '#a78bfa',
    border: 'rgba(167, 139, 250, 0.4)',
    glow:   'rgba(124, 58, 237, 0.3)',
    bg:     'rgba(124, 58, 237, 0.05)',
  },
  green: {
    text:   '#10e890',
    border: 'rgba(16, 232, 144, 0.4)',
    glow:   'rgba(16, 232, 144, 0.25)',
    bg:     'rgba(16, 232, 144, 0.05)',
  },
  amber: {
    text:   '#f59e0b',
    border: 'rgba(245, 158, 11, 0.4)',
    glow:   'rgba(245, 158, 11, 0.25)',
    bg:     'rgba(245, 158, 11, 0.05)',
  },
}

// ── Inline Styles ─────────────────────────────────────────────────────────────
const styles = {
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1.5rem',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
  },

  pageTitle: {
    fontFamily: "'Orbitron', monospace",
    fontSize: '22px',
    fontWeight: '600',
    color: '#e8f4fd',
    letterSpacing: '0.04em',
    marginBottom: '6px',
  },

  pageSubtitle: {
    fontSize: '14px',
    color: 'rgba(148, 180, 210, 0.7)',
    maxWidth: '420px',
  },

  searchWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '360px',
    flexShrink: 0,
  },

  searchInput: {
    paddingLeft: '38px',   // Platz für Such-Icon
    paddingRight: '36px',  // Platz für X-Button
  },

  clearBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'rgba(148, 180, 210, 0.5)',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '2px 4px',
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '4rem',
    color: 'rgba(148, 180, 210, 0.5)',
    fontSize: '14px',
  },

  card: {
    padding: '1.1rem 1.2rem',
    overflow: 'hidden',
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },

  cardIcon: {
    fontSize: '16px',
    lineHeight: 1,
  },

  linkList: {
    display: 'flex',
    flexDirection: 'column',
  },

  linkRow: (hovered) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '9px 8px',
    borderRadius: '8px',
    textDecoration: 'none',
    background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
    transition: 'background 0.15s ease',
    overflow: 'hidden',
  }),

  linkContent: {
    flex: 1,
    minWidth: 0,
  },

  linkName: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '2px',
    transition: 'color 0.15s ease',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  linkDesc: {
    display: 'block',
    fontSize: '11px',
    color: 'rgba(100, 140, 180, 0.7)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  linkRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },

  arrow: {
    fontSize: '14px',
    transition: 'transform 0.15s ease, color 0.15s ease',
  },
}
