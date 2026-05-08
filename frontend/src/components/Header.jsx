// ──────────────────────────────────────────────────────────────────────────────
// Header.jsx — Navigationsleiste im VORTEX-Stil
//
// Layout (exakt wie VORTEX):
//   [Logo links] ── [Tab-Navigation Mitte] ── [Uhr + Status rechts]
//
// Der aktive Tab wird mit orangem Hintergrund hervorgehoben.
// Inaktive/geplante Tabs werden ausgegraut mit "SOON" Badge angezeigt.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'

// ── Tab-Konfiguration ─────────────────────────────────────────────────────────
// Neue Tabs hinzufügen: active: true setzen wenn die Komponente bereit ist
const TABS = [
  { id: 'quicklinks',  label: 'Schnellzugriff', available: true  },
  { id: 'starmap',     label: 'Sternenkarte',   available: false },
  { id: 'items',       label: 'Item-DB',         available: false },
  { id: 'calculator',  label: 'Calculators',     available: false },
  { id: 'fleet',       label: 'Flotte',          available: false },
]

export default function Header({ activeTab, setActiveTab }) {
  const [time, setTime]       = useState('')
  const [serverOk, setServer] = useState(null) // null = lädt noch

  // Live-Uhr: aktualisiert jede Sekunde
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      const p = n => String(n).padStart(2, '0')
      setTime(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Server-Status: prüft RSI Status-API alle 60 Sekunden
  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch('/proxy/rsi-status')
        const d = await r.json()
        const ind = d?.status?.indicator ?? 'none'
        setServer(ind === 'none' || ind === 'operational')
      } catch {
        setServer(true) // Kein Backend = ignorieren
      }
    }
    check()
    const id = setInterval(check, 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <header style={S.wrap}>
      <div style={S.inner}>

        {/* ── Logo (wie "VORTEX" im Design) ────────────────────────────── */}
        <div style={S.logo}>
          {/* Kleines Ring-Icon */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9.5" stroke="#FF6B2B" strokeWidth="1.2" opacity="0.7"/>
            <circle cx="11" cy="11" r="5"   stroke="#FF6B2B" strokeWidth="1" opacity="0.9"/>
            <circle cx="11" cy="11" r="2"   fill="#FF6B2B"/>
            <line x1="1.5" y1="11" x2="5.5"  y2="11" stroke="#FF6B2B" strokeWidth="0.9" opacity="0.5"/>
            <line x1="16.5" y1="11" x2="20.5" y2="11" stroke="#FF6B2B" strokeWidth="0.9" opacity="0.5"/>
          </svg>
          <span style={S.logoText}>SC NAVIGATOR</span>
        </div>

        {/* ── Tab-Navigation ───────────────────────────────────────────── */}
        <nav style={S.nav}>
          {TABS.map(tab => {
            const isActive   = activeTab === tab.id
            const isDisabled = !tab.available

            return (
              <button
                key={tab.id}
                style={S.tab(isActive, isDisabled)}
                onClick={() => tab.available && setActiveTab(tab.id)}
                title={isDisabled ? 'In Entwicklung' : tab.label}
              >
                {tab.label}
                {/* "SOON" Badge für geplante Features */}
                {isDisabled && (
                  <span style={S.soonBadge}>SOON</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* ── Rechts: Uhr + Server Status ──────────────────────────────── */}
        <div style={S.right}>

          {/* Live-Uhrzeit */}
          {time && (
            <span style={S.clock}>{time}</span>
          )}

          {/* Server Status Pill — klickbar → RSI Status Seite */}
          <a
            href="https://status.robertsspaceindustries.com"
            target="_blank"
            rel="noopener noreferrer"
            style={S.status(serverOk)}
          >
            <span style={S.statusDot(serverOk)} />
            {serverOk === null ? 'CHECKING' : serverOk ? 'SERVERS UP' : 'DEGRADED'}
          </a>

        </div>
      </div>
    </header>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  wrap: {
    position: 'sticky',
    top: 0,
    zIndex: 200,
    background: 'rgba(5, 10, 14, 0.96)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },

  inner: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    padding: '0 1.5rem',
    height: '56px',
    maxWidth: '1600px',
    margin: '0 auto',
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },

  logoText: {
    fontFamily: "'Orbitron', monospace",
    fontSize: '13px',
    fontWeight: '700',
    color: '#eef3f5',
    letterSpacing: '0.12em',
  },

  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    flex: 1,
  },

  // Gibt Tab-Style zurück abhängig von Zustand
  tab: (isActive, isDisabled) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '6px 16px',
    borderRadius: '6px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: isActive ? '600' : '400',
    cursor: isDisabled ? 'default' : 'pointer',
    border: 'none',
    // Aktiver Tab: orange (wie im VORTEX "Mods" Tab)
    background: isActive
      ? '#FF6B2B'
      : 'transparent',
    color: isActive
      ? '#fff'
      : isDisabled
        ? 'rgba(130, 160, 175, 0.35)'
        : 'rgba(185, 205, 215, 0.7)',
    transition: 'all 0.15s ease',
  }),

  soonBadge: {
    fontSize: '8px',
    padding: '1px 5px',
    borderRadius: '3px',
    background: 'rgba(255,255,255,0.07)',
    color: 'rgba(130, 160, 175, 0.45)',
    fontFamily: "'Orbitron', monospace",
    letterSpacing: '0.06em',
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
    fontSize: '11px',
    color: 'rgba(130, 160, 175, 0.55)',
    letterSpacing: '0.06em',
  },

  status: (ok) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '4px 12px',
    borderRadius: '20px',
    fontFamily: "'Orbitron', monospace",
    fontSize: '9px',
    fontWeight: '500',
    letterSpacing: '0.1em',
    textDecoration: 'none',
    background: ok === false
      ? 'rgba(255, 69, 69, 0.1)'
      : 'rgba(46, 232, 160, 0.08)',
    color: ok === false ? '#FF4545' : '#2EE8A0',
    border: `1px solid ${ok === false ? 'rgba(255,69,69,0.25)' : 'rgba(46,232,160,0.22)'}`,
  }),

  statusDot: (ok) => ({
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: ok === false ? '#FF4545' : '#2EE8A0',
    animation: 'pulse 2s ease-in-out infinite',
    flexShrink: 0,
  }),
}
