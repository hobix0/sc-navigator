import { useState, useEffect } from 'react'
import { fetchRSIStatus, fetchCommodities } from '../api/index.js'

const TOP_LINKS = [
  { label: 'Erkul.games',     url: 'https://www.erkul.games',     icon: '⚡', desc: 'Loadout & DPS' },
  { label: 'SC Trade Tools',  url: 'https://sc-trade.tools',      icon: '💹', desc: 'Handelsrouten' },
  { label: 'Roadmap',         url: 'https://robertsspaceindustries.com/roadmap/release-view', icon: '🗺️', desc: 'Patch-Planung' },
  { label: 'RSI Spectrum',    url: 'https://robertsspaceindustries.com/spectrum/community/SC', icon: '💬', desc: 'Forum' },
  { label: 'SC Wiki',         url: 'https://starcitizen.tools',   icon: '📖', desc: 'Lexikon' },
  { label: 'isthisscup.com',  url: 'https://isthisscup.com',      icon: '📡', desc: 'Server-Schnellcheck' },
]

const PATCH_NOTES_URL = 'https://robertsspaceindustries.com/patch-notes'

export default function Dashboard({ setActiveTab }) {
  const [commCount, setCommCount] = useState('...')
  const [serverInfo, setServerInfo] = useState({ label: '...', ok: true })

  useEffect(() => {
    fetchCommodities()
      .then(d => setCommCount(Array.isArray(d) ? d.length : '?'))
      .catch(() => setCommCount('?'))

    fetchRSIStatus()
      .then(d => {
        const ind = d?.status?.indicator ?? 'none'
        const ok = ind === 'none' || ind === 'operational'
        setServerInfo({ label: ok ? 'Operationell' : 'Beeinträchtigt', ok })
      })
      .catch(() => setServerInfo({ label: 'Nicht erreichbar', ok: false }))
  }, [])

  const StatCard = ({ value, label, color }) => (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: color || 'var(--accent)', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '.06em', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>{label}</div>
    </div>
  )

  return (
    <div className="page-content">

      {/* Welcome banner */}
      <div className="card" style={{ marginBottom: '1.25rem', borderTop: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '.06em', marginBottom: '4px' }}>
            SC Navigator
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Alle wichtigen Star Citizen Tools & Daten auf einen Blick – für dich und deine Crew.
          </div>
        </div>
        <a href={PATCH_NOTES_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          📋 Aktuelle Patchnotes →
        </a>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '1.25rem' }}>
        <StatCard value={commCount} label="Commodities geladen" />
        <StatCard value={serverInfo.label} label="Server Status" color={serverInfo.ok ? 'var(--green)' : 'var(--red)'} />
        <StatCard value="Alpha 4.x" label="Aktuelle Version" color="var(--amber)" />
        <StatCard value="3 Module" label="Dashboard-Tabs" />
      </div>

      {/* Quick access */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-title">⚡ Schnellzugriff</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
          {TOP_LINKS.map(link => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                textDecoration: 'none', transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-hi)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <span style={{ fontSize: '20px' }}>{link.icon}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{link.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{link.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Navigation hints */}
      <div className="grid-2" style={{ gap: '10px' }}>
        <div className="card" style={{ cursor: 'pointer', borderTop: '2px solid var(--accent-dim)' }}
             onClick={() => setActiveTab('commodities')}>
          <div style={{ fontSize: '20px', marginBottom: '6px' }}>💰</div>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>Commodity Tracker</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Live-Marktpreise für alle Waren – gefiltert, sortierbar, direkt von UEX Corp.</div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--accent)' }}>→ Zum Tracker</div>
        </div>
        <div className="card" style={{ cursor: 'pointer', borderTop: '2px solid var(--accent-dim)' }}
             onClick={() => setActiveTab('fleet')}>
          <div style={{ fontSize: '20px', marginBottom: '6px' }}>🚀</div>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>Fleet Manager</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Flotte verwalten, Gruppen-Notizen posten – synchronisiert über das gemeinsame Backend.</div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--accent)' }}>→ Zur Flotte</div>
        </div>
        <div className="card" style={{ cursor: 'pointer', borderTop: '2px solid var(--accent-dim)' }}
             onClick={() => setActiveTab('links')}>
          <div style={{ fontSize: '20px', marginBottom: '6px' }}>🔗</div>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>Quick Links</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Alle wichtigen SC-Tools & Community-Seiten kategorisiert auf einen Blick.</div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--accent)' }}>→ Zu den Links</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--border)' }}>
          <div style={{ fontSize: '20px', marginBottom: '6px' }}>📡</div>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>Nützliche Ressourcen</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
            {[
              ['FleetYards',     'https://fleetyards.net'],
              ['SC Trade Tools', 'https://sc-trade.tools'],
              ['Progress Tracker','https://robertsspaceindustries.com/roadmap/progress-tracker'],
            ].map(([label, url]) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--accent)' }}>{label} →</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
