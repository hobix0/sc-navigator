import { useState, useEffect } from 'react'
import { fetchRSIStatus } from '../api/index.js'

const TABS = [
  { id: 'dashboard',    label: 'Dashboard'   },
  { id: 'starmap',      label: 'Sternenkarte' },
  { id: 'commodities',  label: 'Commodities' },
  { id: 'fleet',        label: 'Fleet'       },
  { id: 'links',        label: 'Quick Links' },
]

const styles = {
  header: {
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    height: '56px',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--accent)',
    letterSpacing: '.1em',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoIcon: {
    width: '26px',
    height: '26px',
    background: 'var(--accent-dim)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
  },
  nav: { display: 'flex', gap: '4px', flex: 1 },
  tab: (active) => ({
    padding: '6px 14px',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-display)',
    fontSize: '9px',
    fontWeight: '500',
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    border: 'none',
    background: active ? 'var(--accent-glow)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-muted)',
    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
    transition: 'all .15s',
  }),
  right: { display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' },
  clock: {
    fontFamily: 'var(--font-display)',
    fontSize: '11px',
    color: 'var(--text-muted)',
    letterSpacing: '.06em',
  },
  statusBadge: (ok) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '10px',
    fontFamily: 'var(--font-display)',
    letterSpacing: '.06em',
    fontWeight: '500',
    background: ok ? 'var(--green-bg)' : 'var(--red-bg)',
    color: ok ? 'var(--green)' : 'var(--red)',
    border: `1px solid ${ok ? 'rgba(77,208,138,.25)' : 'rgba(240,80,96,.25)'}`,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  }),
  dot: (ok) => ({
    width: '6px', height: '6px', borderRadius: '50%',
    background: ok ? 'var(--green)' : 'var(--red)',
  }),
}

export default function Header({ activeTab, setActiveTab }) {
  const [time, setTime] = useState('')
  const [serverStatus, setServerStatus] = useState({ ok: true, label: 'CHECKING...', loading: true })

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      const pad = n => String(n).padStart(2, '0')
      setTime(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await fetchRSIStatus()
        // RSI status API: indicator = "none" means all good
        const indicator = data?.status?.indicator ?? 'none'
        const ok = indicator === 'none' || indicator === 'operational'
        setServerStatus({ ok, label: ok ? 'SERVERS UP' : 'DEGRADED', loading: false })
      } catch {
        setServerStatus({ ok: false, label: 'STATUS N/A', loading: false })
      }
    }
    checkStatus()
    const id = setInterval(checkStatus, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>◈</div>
          SC NAVIGATOR
        </div>

        <nav style={styles.nav}>
          {TABS.map(t => (
            <button
              key={t.id}
              style={styles.tab(activeTab === t.id)}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div style={styles.right}>
          <span style={styles.clock}>{time}</span>
          <a
            href="https://status.robertsspaceindustries.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.statusBadge(serverStatus.ok)}
          >
            <span style={styles.dot(serverStatus.ok)} />
            {serverStatus.loading ? 'CHECKING...' : serverStatus.label}
          </a>
        </div>
      </div>
    </header>
  )
}
