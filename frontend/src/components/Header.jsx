// ──────────────────────────────────────────────────────────────────────────────
// Header Komponente
//
// Zeigt:
//   - SC Navigator Logo (links)
//   - Tab-Navigation (Mitte) — derzeit nur "Schnellzugriff" aktiv
//   - Live-Uhr + Server-Status Badge (rechts)
//
// Props:
//   activeTab    (string)   → ID des aktuell aktiven Tabs
//   setActiveTab (function) → Callback um Tab zu wechseln
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'

// ── Tab-Definitionen ──────────────────────────────────────────────────────────
// Tabs mit 'comingSoon: true' werden als deaktiviert angezeigt (Roadmap-Vorschau)
const TABS = [
  { id: 'quicklinks',  label: 'Schnellzugriff', active: true },
  { id: 'starmap',     label: 'Sternenkarte',   active: false, comingSoon: true },
  { id: 'items',       label: 'Item-DB',         active: false, comingSoon: true },
  { id: 'calculator',  label: 'Calculators',     active: false, comingSoon: true },
  { id: 'fleet',       label: 'Flotte',          active: false, comingSoon: true },
]

export default function Header({ activeTab, setActiveTab }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [time, setTime] = useState('')            // Aktuelle Uhrzeit als String
  const [serverOk, setServerOk] = useState(true)  // RSI Server Status

  // ── Live-Uhr ───────────────────────────────────────────────────────────────
  // Aktualisiert jede Sekunde, wird beim Unmount aufgeräumt
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      const pad = n => String(n).padStart(2, '0')
      setTime(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id) // Cleanup beim Unmount
  }, [])

  // ── Server Status Check ────────────────────────────────────────────────────
  // Prüft den RSI-Server-Status einmal beim Mount und dann alle 60 Sekunden
  useEffect(() => {
    const check = async () => {
      try {
        // Versucht Backend-Proxy, fällt auf direkten Call zurück
        const res = await fetch('/proxy/rsi-status')
        if (!res.ok) throw new Error()
        const data = await res.json()
        const indicator = data?.status?.indicator ?? 'none'
        setServerOk(indicator === 'none' || indicator === 'operational')
      } catch {
        // Bei Fehler (z.B. kein Backend) Status unbekannt → gilt als "ok"
        setServerOk(true)
      }
    }
    check()
    const id = setInterval(check, 60_000)
    return () => clearInterval(id)
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <header style={styles.header}>
      {/* Innerer Container mit max. Breite */}
      <div style={styles.inner}>

        {/* Logo ────────────────────────────────────────────────────────────── */}
        <div style={styles.logo}>
          {/* Kleines Emblem-Icon */}
          <div style={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="#00d4ff" strokeWidth="1.2" opacity="0.6"/>
              <circle cx="9" cy="9" r="4" stroke="#00d4ff" strokeWidth="1" opacity="0.8"/>
              <circle cx="9" cy="9" r="1.5" fill="#00d4ff"/>
              {/* Kleine Linie links */}
              <line x1="1" y1="9" x2="4.5" y2="9" stroke="#00d4ff" strokeWidth="0.8" opacity="0.5"/>
              {/* Kleine Linie rechts */}
              <line x1="13.5" y1="9" x2="17" y2="9" stroke="#00d4ff" strokeWidth="0.8" opacity="0.5"/>
            </svg>
          </div>
          <span style={styles.logoText}>SC Navigator</span>
        </div>

        {/* Tab-Navigation ──────────────────────────────────────────────────── */}
        <nav style={styles.nav}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              style={styles.tab(activeTab === tab.id, tab.comingSoon)}
              onClick={() => !tab.comingSoon && setActiveTab(tab.id)}
              title={tab.comingSoon ? 'Coming Soon' : tab.label}
            >
              {tab.label}
              {/* "Soon" Badge für geplante Tabs */}
              {tab.comingSoon && (
                <span style={styles.soonBadge}>soon</span>
              )}
            </button>
          ))}
        </nav>

        {/* Rechte Seite: Uhr + Server Status ──────────────────────────────── */}
        <div style={styles.right}>
          {/* Live-Uhr */}
          <span style={styles.clock}>{time}</span>

          {/* Server Status Badge — klickbar → öffnet RSI Status-Seite */}
          <a
            href="https://status.robertsspaceindustries.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.statusBadge(serverOk)}
          >
            {/* Pulsierender Dot */}
            <span style={styles.statusDot(serverOk)} />
            {serverOk ? 'SERVERS UP' : 'DEGRADED'}
          </a>
        </div>

      </div>
    </header>
  )
}

// ── Inline Styles ─────────────────────────────────────────────────────────────
// Inline Styles hier wegen fehlender CSS-Datei für Komponenten-spezifische Styles
const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(2, 8, 18, 0.85)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },

  inner: {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '0 1.5rem',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },

  logoIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(0, 212, 255, 0.08)',
    border: '1px solid rgba(0, 212, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoText: {
    fontFamily: "'Orbitron', monospace",
    fontSize: '14px',
    fontWeight: '600',
    color: '#e8f4fd',
    letterSpacing: '0.06em',
  },

  nav: {
    display: 'flex',
    gap: '2px',
    flex: 1,
  },

  // Gibt Style zurück basierend auf active/disabled Zustand
  tab: (isActive, isDisabled) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '8px',
    fontFamily: "'Orbitron', monospace",
    fontSize: '9px',
    fontWeight: '500',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: isDisabled ? 'default' : 'pointer',
    border: 'none',
    background: isActive
      ? 'rgba(0, 212, 255, 0.1)'
      : 'transparent',
    color: isActive
      ? '#00d4ff'
      : isDisabled
        ? 'rgba(100, 140, 180, 0.35)'
        : 'rgba(148, 180, 210, 0.7)',
    borderBottom: isActive
      ? '2px solid #00d4ff'
      : '2px solid transparent',
    transition: 'all 0.2s ease',
  }),

  soonBadge: {
    fontSize: '8px',
    padding: '1px 5px',
    borderRadius: '4px',
    background: 'rgba(124, 58, 237, 0.2)',
    color: '#a78bfa',
    border: '1px solid rgba(124,58,237,0.3)',
    fontFamily: "'Orbitron', monospace",
    letterSpacing: '0.05em',
  },

  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginLeft: 'auto',
    flexShrink: 0,
  },

  clock: {
    fontFamily: "'Orbitron', monospace",
    fontSize: '12px',
    color: 'rgba(148, 180, 210, 0.6)',
    letterSpacing: '0.06em',
  },

  statusBadge: (ok) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '5px 12px',
    borderRadius: '20px',
    fontFamily: "'Orbitron', monospace",
    fontSize: '9px',
    fontWeight: '500',
    letterSpacing: '0.1em',
    textDecoration: 'none',
    background: ok
      ? 'rgba(16, 232, 144, 0.08)'
      : 'rgba(239, 68, 68, 0.1)',
    color: ok ? '#10e890' : '#ef4444',
    border: `1px solid ${ok ? 'rgba(16,232,144,0.25)' : 'rgba(239,68,68,0.3)'}`,
  }),

  statusDot: (ok) => ({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: ok ? '#10e890' : '#ef4444',
    animation: 'pulse-glow 2s ease-in-out infinite',
    flexShrink: 0,
  }),
}
