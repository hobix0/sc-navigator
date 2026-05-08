import { useState, useEffect, useCallback } from 'react'
import { fetchCommodities, fetchCommodityPrices } from '../api/index.js'

const ROLES = ['All', 'Mineral', 'Gas', 'Agricultural', 'Metal', 'Chemical', 'Medical', 'Food', 'Scrap']

function formatAUEC(val) {
  if (!val) return '—'
  return Number(val).toLocaleString('de-DE') + ' aUEC'
}

export default function CommodityTracker() {
  const [commodities, setCommodities]   = useState([])
  const [prices, setPrices]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [search, setSearch]             = useState('')
  const [roleFilter, setRoleFilter]     = useState('All')
  const [sortBy, setSortBy]             = useState('name')
  const [sortDir, setSortDir]           = useState('asc')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [comms, pdata] = await Promise.all([fetchCommodities(), fetchCommodityPrices()])
      setCommodities(Array.isArray(comms) ? comms : [])
      setPrices(Array.isArray(pdata) ? pdata : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Build merged commodity+price rows
  const rows = commodities.map(c => {
    const related = prices.filter(p => p.id_commodity === c.id)
    const buyPrices  = related.filter(p => p.price_buy  > 0).map(p => p.price_buy)
    const sellPrices = related.filter(p => p.price_sell > 0).map(p => p.price_sell)
    return {
      id:       c.id,
      name:     c.name ?? c.code ?? '—',
      code:     c.code ?? '',
      kind:     c.kind ?? '',
      buyMin:   buyPrices.length  ? Math.min(...buyPrices)  : 0,
      buyMax:   buyPrices.length  ? Math.max(...buyPrices)  : 0,
      sellMax:  sellPrices.length ? Math.max(...sellPrices) : 0,
      sellMin:  sellPrices.length ? Math.min(...sellPrices) : 0,
      terminals: related.length,
    }
  })

  const filtered = rows
    .filter(r => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'All' || r.kind?.toLowerCase().includes(roleFilter.toLowerCase())
      return matchSearch && matchRole
    })
    .sort((a, b) => {
      let va = a[sortBy] ?? ''
      let vb = b[sortBy] ?? ''
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  function toggleSort(col) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  const SortIcon = ({ col }) => sortBy === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'

  return (
    <div className="page-content">
      {/* Controls */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="input"
            style={{ maxWidth: '280px' }}
            placeholder="Suche nach Commodity oder Code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="select" style={{ width: 'auto' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
          <button className="btn btn-sm" onClick={load} style={{ marginLeft: 'auto' }}>
            ↻ Aktualisieren
          </button>
          {!loading && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{filtered.length} Commodities</span>}
        </div>
      </div>

      {/* Data source note */}
      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '.75rem' }}>
        Daten von <a href="https://uexcorp.space" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-dim)' }}>UEX Corp API v2</a> — Community-betriebene Preisdaten
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading && <div className="state-box">⏳ Lade Commodity-Daten von UEX Corp...</div>}

        {error && (
          <div className="state-box" style={{ flexDirection: 'column', gap: '8px' }}>
            <span style={{ color: 'var(--red)' }}>⚠ API nicht erreichbar</span>
            <span style={{ fontSize: '12px' }}>Stelle sicher, dass das Backend läuft oder prüfe deine Internetverbindung.</span>
            <button className="btn btn-sm" onClick={load}>Nochmal versuchen</button>
          </div>
        )}

        {!loading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table className="sc-table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('name')}>Name<SortIcon col="name" /></th>
                  <th>Code</th>
                  <th>Typ</th>
                  <th style={{ cursor: 'pointer', textAlign: 'right' }} onClick={() => toggleSort('buyMin')}>Kaufpreis min<SortIcon col="buyMin" /></th>
                  <th style={{ cursor: 'pointer', textAlign: 'right' }} onClick={() => toggleSort('sellMax')}>Verkaufspreis max<SortIcon col="sellMax" /></th>
                  <th style={{ cursor: 'pointer', textAlign: 'right' }} onClick={() => toggleSort('terminals')}>Terminals<SortIcon col="terminals" /></th>
                  <th style={{ textAlign: 'right' }}>Spread</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>Keine Ergebnisse</td></tr>
                )}
                {filtered.map(r => {
                  const spread = r.sellMax > 0 && r.buyMin > 0 ? r.sellMax - r.buyMin : null
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.name}</td>
                      <td><code style={{ fontSize: '11px', color: 'var(--accent)', background: 'var(--accent-glow)', padding: '2px 6px', borderRadius: '4px' }}>{r.code}</code></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{r.kind || '—'}</td>
                      <td style={{ textAlign: 'right', color: r.buyMin ? 'var(--text-primary)' : 'var(--text-dim)' }}>{formatAUEC(r.buyMin)}</td>
                      <td style={{ textAlign: 'right', color: r.sellMax ? 'var(--green)' : 'var(--text-dim)', fontWeight: r.sellMax ? 500 : 400 }}>{formatAUEC(r.sellMax)}</td>
                      <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{r.terminals}</td>
                      <td style={{ textAlign: 'right' }}>
                        {spread != null
                          ? <span className={`badge ${spread > 0 ? 'badge-green' : 'badge-amber'}`}>{spread > 0 ? '+' : ''}{Number(spread).toLocaleString('de-DE')}</span>
                          : <span style={{ color: 'var(--text-dim)' }}>—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
