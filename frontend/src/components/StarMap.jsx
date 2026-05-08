import { useState, useMemo } from 'react'
import { STANTON_DATA, flattenLocations } from '../data/starmap.js'

const DEG = Math.PI / 180
const toXY = (angle, r) => ({ x: r * Math.cos(angle * DEG), y: r * Math.sin(angle * DEG) })

const SERVICES = {
  landing:  { icon: '🛬', label: 'Landezone'  },
  trade:    { icon: '💰', label: 'Handel'      },
  repair:   { icon: '🔧', label: 'Reparatur'  },
  refuel:   { icon: '⛽', label: 'Betankung'  },
  medical:  { icon: '🏥', label: 'Medizin'    },
  shopping: { icon: '🛍️', label: 'Shopping'  },
  missions: { icon: '📋', label: 'Missionen'  },
}

// Fixed star positions so they don't change on each render
const STARS = [
  [120,-178],[-195,105],[248,198],[-148,-218],[288,-82],[-277,153],
  [182,258],[-58,242],[308,128],[-238,-98],[82,-258],[-298,-48],
  [142,202],[-78,182],[218,-198],[-170,60],[50,270],[-310,220],
  [260,-240],[-30,-150],[330,-170],[160,-300],[-260,280],[95,310],
].map(([x,y]) => ({ x, y, r: Math.abs(x * y) % 3 > 1 ? 1.2 : 0.7, o: 0.2 + (Math.abs(x+y) % 5) * 0.06 }))

// ── Planet detail SVG ─────────────────────────────────────────────────────────
function PlanetView({ planet, selected, onSelect }) {
  const children = [...(planet.moons || []), ...(planet.stations || [])]
  return (
    <svg viewBox="-220 -200 440 400" width="100%" height="100%" style={{ display: 'block' }}>
      <rect x="-220" y="-200" width="440" height="400" fill="#020810" />
      {STARS.slice(0, 12).map((s, i) => (
        <circle key={i} cx={s.x * 0.6} cy={s.y * 0.6} r={s.r * 0.8} fill="white" opacity={s.o} />
      ))}

      {/* Moon orbit rings */}
      {[45, 62].map(r => (
        <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="rgba(79,195,247,0.07)" strokeWidth="0.5" strokeDasharray="3 8" />
      ))}

      {/* Planet glow */}
      <circle cx="0" cy="0" r={planet.radius * 2.8} fill={planet.glowColor || planet.color} opacity="0.07" />
      <circle cx="0" cy="0" r={planet.radius * 1.8} fill={planet.glowColor || planet.color} opacity="0.12" />

      {/* Planet */}
      <circle cx="0" cy="0" r={planet.radius}
        fill={planet.color}
        stroke={selected?.id === planet.id ? '#4FC3F7' : 'rgba(255,255,255,0.25)'}
        strokeWidth={selected?.id === planet.id ? 2 : 0.5}
        style={{ cursor: 'pointer' }}
        onClick={() => onSelect(planet)}
      />
      <text x="0" y={planet.radius + 13} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="8" fontFamily="'Orbitron',monospace">{planet.name}</text>

      {/* Moons & stations */}
      {children.map(item => {
        const { x, y } = toXY(item.angle, item.orbitRadius)
        const isSel = selected?.id === item.id
        return (
          <g key={item.id} onClick={() => onSelect(item)} style={{ cursor: 'pointer' }}>
            <circle cx={x} cy={y} r={12} fill="transparent" />
            {item.type === 'station' ? (
              <rect x={x - 4.5} y={y - 4.5} width={9} height={9}
                fill={isSel ? '#4FC3F7' : 'rgba(79,195,247,0.6)'}
                transform={`rotate(45,${x},${y})`}
                stroke={isSel ? 'white' : 'rgba(255,255,255,0.3)'}
                strokeWidth={isSel ? 1 : 0.5}
              />
            ) : (
              <circle cx={x} cy={y} r={item.radius}
                fill={item.color}
                stroke={isSel ? '#4FC3F7' : 'rgba(255,255,255,0.2)'}
                strokeWidth={isSel ? 1.5 : 0.5}
              />
            )}
            <text x={x} y={y + item.radius + 10} textAnchor="middle" fill={isSel ? '#4FC3F7' : 'rgba(255,255,255,0.55)'} fontSize="7">{item.name}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── System SVG ────────────────────────────────────────────────────────────────
function SystemView({ data, selected, onSelectPlanet }) {
  return (
    <svg viewBox="-320 -290 640 580" width="100%" height="100%" style={{ display: 'block' }}>
      <rect x="-320" y="-290" width="640" height="580" fill="#020810" />

      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o} />
      ))}

      {/* Orbital rings */}
      {data.planets.map(p => (
        <circle key={p.id + '_r'} cx="0" cy="0" r={p.orbitRadius}
          fill="none" stroke="rgba(79,195,247,0.06)" strokeWidth="0.5" strokeDasharray="4 8" />
      ))}
      <circle cx="0" cy="0" r={305} fill="none" stroke="rgba(79,195,247,0.04)" strokeWidth="0.5" />

      {/* Sun glow */}
      <circle cx="0" cy="0" r="48" fill="#FF8C00" opacity="0.05" />
      <circle cx="0" cy="0" r="30" fill="#FFA500" opacity="0.10" />
      <circle cx="0" cy="0" r="18" fill="#FFD700" opacity="0.18" />
      <circle cx="0" cy="0" r="11" fill="#FFF5E0" />
      <text x="0" y="23" textAnchor="middle" fill="rgba(255,220,100,0.65)" fontSize="6.5" fontFamily="'Orbitron',monospace">STANTON</text>

      {/* Jump points */}
      {data.jumpPoints?.map(jp => {
        const { x, y } = toXY(jp.angle, jp.orbitRadius)
        return (
          <g key={jp.id} style={{ cursor: 'pointer' }} onClick={() => onSelectPlanet(jp)}>
            <polygon points={`${x},${y - 7} ${x + 6},${y + 5} ${x - 6},${y + 5}`}
              fill="none" stroke="rgba(100,180,255,0.35)" strokeWidth="1"
            />
            <text x={x} y={y + 17} textAnchor="middle" fill="rgba(100,180,255,0.45)" fontSize="6">
              {jp.name.replace('Sprungpunkt ', '')}
            </text>
          </g>
        )
      })}

      {/* Planets */}
      {data.planets.map(p => {
        const { x, y } = toXY(p.angle, p.orbitRadius)
        const isSel = selected?.id === p.id
        const stPos = p.stations?.[0] ? toXY(p.angle + 22, p.orbitRadius + 14) : null
        return (
          <g key={p.id} onClick={() => onSelectPlanet(p)} style={{ cursor: 'pointer' }}>
            <circle cx={x} cy={y} r={p.radius + 16} fill="transparent" />
            <circle cx={x} cy={y} r={p.radius + 9} fill={p.glowColor || p.color} opacity="0.07" />
            <circle cx={x} cy={y} r={p.radius + 5} fill={p.glowColor || p.color} opacity="0.11" />
            <circle cx={x} cy={y} r={p.radius}
              fill={p.color}
              stroke={isSel ? '#4FC3F7' : 'rgba(255,255,255,0.2)'}
              strokeWidth={isSel ? 2 : 0.5}
            />
            {stPos && (
              <rect cx={stPos.x} cy={stPos.y} x={stPos.x - 2.5} y={stPos.y - 2.5} width={5} height={5}
                fill="rgba(79,195,247,0.6)" transform={`rotate(45,${stPos.x},${stPos.y})`} />
            )}
            <text x={x} y={y + p.radius + 12} textAnchor="middle"
              fill={isSel ? '#4FC3F7' : 'rgba(255,255,255,0.78)'}
              fontSize="8.5" fontFamily="'Orbitron',monospace"
            >{p.name}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Info Panel ────────────────────────────────────────────────────────────────
function InfoPanel({ item, data, onClose, onSelectChild, onOpenPlanet }) {
  if (!item) return null

  const parent = item.parentPlanet ? data.planets.find(p => p.id === item.parentPlanet) : null
  const children = item.type === 'planet' ? [...(item.moons || []), ...(item.stations || [])] : []

  const Stat = ({ label, value }) => (
    <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '6px 10px' }}>
      <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '.07em', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{value}</div>
    </div>
  )

  return (
    <div className="card" style={{ padding: '1.1rem', overflow: 'auto', maxHeight: 'calc(100vh - 160px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          {parent && (
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '3px', cursor: 'pointer' }}
              onClick={() => onOpenPlanet(parent)}>
              ← {parent.name}
            </div>
          )}
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 500, color: 'var(--accent)', letterSpacing: '.06em' }}>{item.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'capitalize' }}>
            {item.type === 'planet' ? '🌍' : item.type === 'moon' ? '🌑' : item.type === 'station' ? '🛸' : '🌀'} {item.type}
            {item.faction && <span style={{ marginLeft: '6px', color: 'var(--text-dim)' }}>· {item.faction}</span>}
          </div>
        </div>
        <button style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }} onClick={onClose}>✕</button>
      </div>

      {/* Description */}
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '12px' }}>{item.description}</p>

      {/* Stats grid */}
      {(item.atmosphere || item.gravity || item.landingZones) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
          {item.atmosphere && <Stat label="ATMOSPHÄRE" value={item.atmosphere} />}
          {item.gravity && <Stat label="GRAVITATION" value={item.gravity} />}
          {item.landingZones && <div style={{ gridColumn: '1/-1' }}><Stat label="LANDEZONE" value={item.landingZones.join(', ')} /></div>}
        </div>
      )}

      {/* Services */}
      {item.services?.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '.08em', marginBottom: '6px' }}>VERFÜGBARE SERVICES</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {item.services.map(s => SERVICES[s] && (
              <span key={s} style={{ fontSize: '10px', padding: '3px 8px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}>
                {SERVICES[s].icon} {SERVICES[s].label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Trade */}
      {(item.buyHighlight?.length || item.sellHighlight?.length) && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '.08em', marginBottom: '6px' }}>HANDEL (Highlights)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {item.buyHighlight?.length > 0 && (
              <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '7px 10px' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '5px' }}>KAUFEN</div>
                {item.buyHighlight.map(c => <div key={c} style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '1px 0' }}>· {c}</div>)}
              </div>
            )}
            {item.sellHighlight?.length > 0 && (
              <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '7px 10px' }}>
                <div style={{ fontSize: '9px', color: 'var(--green)', marginBottom: '5px' }}>VERKAUFEN</div>
                {item.sellHighlight.map(c => <div key={c} style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '1px 0' }}>· {c}</div>)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Children (moons/stations for planets) */}
      {children.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '.08em', marginBottom: '6px' }}>IN DER UMLAUFBAHN</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {children.map(c => (
              <span key={c.id}
                style={{ fontSize: '11px', padding: '4px 10px', background: 'var(--accent-glow)', border: '1px solid var(--accent-dim)', borderRadius: 'var(--radius-sm)', color: 'var(--accent)', cursor: 'pointer' }}
                onClick={() => onSelectChild(c)}
              >
                {c.type === 'station' ? '◈' : '●'} {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Wiki link */}
      {item.wikiUrl && (
        <a href={item.wikiUrl} target="_blank" rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
          style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
        >
          📖 Im SC Wiki öffnen →
        </a>
      )}
    </div>
  )
}

// ── Main StarMap ──────────────────────────────────────────────────────────────
export default function StarMap() {
  const [selected, setSelected]         = useState(null)
  const [focusPlanet, setFocusPlanet]   = useState(null)
  const [search, setSearch]             = useState('')

  const allLocations = useMemo(() => flattenLocations(STANTON_DATA), [])

  const searchResults = useMemo(() => {
    if (search.trim().length < 2) return []
    const q = search.toLowerCase()
    return allLocations.filter(l => l.name.toLowerCase().includes(q)).slice(0, 8)
  }, [search, allLocations])

  function handleSelectPlanet(loc) {
    setSelected(loc)
    if (loc.type === 'planet') setFocusPlanet(loc)
  }

  function handleSelectChild(child) {
    setSelected(child)
    const parent = STANTON_DATA.planets.find(p => p.id === child.parentPlanet)
    if (parent) setFocusPlanet(parent)
  }

  function handleBack() {
    setFocusPlanet(null)
    setSelected(null)
  }

  function handleSearchPick(loc) {
    setSearch('')
    if (loc.parentPlanet) {
      const p = STANTON_DATA.planets.find(p => p.id === loc.parentPlanet)
      setFocusPlanet(p)
    } else if (loc.type === 'planet') {
      setFocusPlanet(loc)
    }
    setSelected(loc)
  }

  return (
    <div className="page-content">

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
          <input
            className="input"
            placeholder="Standort suchen... (Planet, Mond, Station)"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginTop: '4px', overflow: 'hidden' }}>
              {searchResults.map(r => (
                <div key={r.id}
                  style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: '13px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => handleSearchPick(r)}
                >
                  <span style={{ color: 'var(--accent)' }}>{r.name}</span>
                  <span style={{ color: 'var(--text-dim)', marginLeft: '8px', fontSize: '11px' }}>{r.systemPath}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {focusPlanet
          ? <button className="btn btn-sm" onClick={handleBack}>← System</button>
          : <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Klick auf einen Planeten zum Reinzoomen</span>
        }

        <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-display)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '.1em' }}>
          {focusPlanet ? focusPlanet.name.toUpperCase() + ' SYSTEM' : 'STANTON SYSTEM'}
        </div>
      </div>

      {/* Map + Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: '12px', alignItems: 'start' }}>

        {/* SVG map */}
        <div style={{
          background: '#020810',
          border: '1px solid var(--border-hi)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          aspectRatio: '16/9',
        }}>
          {focusPlanet
            ? <PlanetView planet={focusPlanet} selected={selected} onSelect={setSelected} />
            : <SystemView data={STANTON_DATA} selected={selected} onSelectPlanet={handleSelectPlanet} />
          }
        </div>

        {/* Info panel */}
        {selected && (
          <InfoPanel
            item={selected}
            data={STANTON_DATA}
            onClose={() => setSelected(null)}
            onSelectChild={handleSelectChild}
            onOpenPlanet={p => { setFocusPlanet(p); setSelected(p) }}
          />
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '11px', color: 'var(--text-dim)' }}>
        <span><span style={{ display:'inline-block',width:'8px',height:'8px',borderRadius:'50%',background:'#888',marginRight:'5px',verticalAlign:'middle'}}></span>Planet</span>
        <span><span style={{ display:'inline-block',width:'6px',height:'6px',borderRadius:'50%',background:'#aaa',marginRight:'5px',verticalAlign:'middle'}}></span>Mond</span>
        <span><span style={{ display:'inline-block',width:'7px',height:'7px',background:'rgba(79,195,247,0.6)',marginRight:'5px',verticalAlign:'middle',transform:'rotate(45deg)'}}></span>Station</span>
        <span><span style={{ display:'inline-block',width:'0',height:'0',borderLeft:'5px solid transparent',borderRight:'5px solid transparent',borderBottom:'8px solid rgba(100,180,255,0.4)',marginRight:'5px',verticalAlign:'middle'}}></span>Sprungpunkt</span>
      </div>
    </div>
  )
}
