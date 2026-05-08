const LINKS = [
  { cat: '🚀 Ships & Loadouts', items: [
    { name: 'Erkul.games',        url: 'https://www.erkul.games',       desc: 'Loadout-Optimizer & DPS-Rechner', badge: 'Top' },
    { name: 'FleetYards',         url: 'https://fleetyards.net',         desc: 'Schiffsdatenbank & Vergleich' },
    { name: 'Ship Performance',   url: 'https://www.spviewer.eu',        desc: 'Ausrüstungsstatistiken & Specs' },
    { name: 'RSI Pledge Store',   url: 'https://robertsspaceindustries.com/pledge/ships', desc: 'Offizieller Schiffs-Shop' },
  ]},
  { cat: '💰 Trading & Economy', items: [
    { name: 'SC Trade Tools',     url: 'https://sc-trade.tools',         desc: 'Beste Handelsrouten & Profit', badge: 'Top' },
    { name: 'UEX Corp',           url: 'https://uexcorp.space',          desc: 'Live-Marktpreise & Commodities' },
    { name: 'Gallog',             url: 'https://gallog.co',              desc: 'Cargo-Tracking & Logbuch' },
    { name: 'SC Market',          url: 'https://sc-market.space',        desc: 'Spieler-Marktplatz für Items', badge: 'P2P' },
  ]},
  { cat: '🗺️ Maps & Navigation', items: [
    { name: 'RSI Starmap',        url: 'https://starmap.robertsspaceindustries.com', desc: 'Offizieller Sternenkarte' },
    { name: 'Knightfall Map',     url: 'https://sc.knightfall.space',    desc: 'Planeten, Moons & POIs', badge: 'Gut' },
    { name: 'Wiki: Locations',    url: 'https://starcitizen.tools/Locations', desc: 'Landezonen, Shops & Outposts' },
    { name: 'Mission-Übersicht',  url: 'https://starcitizen.tools/List_of_missions', desc: 'Alle Mission-Typen & Rewards' },
  ]},
  { cat: '📋 Patch & Roadmap', items: [
    { name: 'Release Roadmap',    url: 'https://robertsspaceindustries.com/roadmap/release-view', desc: 'Was kommt in welchem Patch?', badge: 'Roadmap' },
    { name: 'Progress Tracker',   url: 'https://robertsspaceindustries.com/roadmap/progress-tracker', desc: 'Feature-Fortschritt' },
    { name: 'Patchnotes',         url: 'https://robertsspaceindustries.com/patch-notes', desc: 'Live & PTU Release Notes' },
    { name: 'isthisscup.com',     url: 'https://isthisscup.com',         desc: 'Sofortcheck: Ist SC up?', badge: 'Fun' },
  ]},
  { cat: '👥 Community', items: [
    { name: 'RSI Spectrum',       url: 'https://robertsspaceindustries.com/spectrum/community/SC', desc: 'Offizielles Forum' },
    { name: 'r/starcitizen',      url: 'https://www.reddit.com/r/starcitizen', desc: 'Reddit Community' },
    { name: 'Comm-Link',          url: 'https://robertsspaceindustries.com/comm-link/', desc: 'CIG-Ankündigungen & Lore' },
    { name: 'CIG YouTube',        url: 'https://www.youtube.com/@CIGCommunity', desc: 'Offizieller Dev-Kanal' },
  ]},
  { cat: '⚙️ Tools & Account', items: [
    { name: 'Star Citizen Wiki',  url: 'https://starcitizen.tools',      desc: 'Vollständiges Spiel-Lexikon', badge: 'Ref' },
    { name: 'RSI Account',        url: 'https://robertsspaceindustries.com/account', desc: 'Hangar & Kontoverwaltung' },
    { name: 'RSI Launcher',       url: 'https://robertsspaceindustries.com/launcher', desc: 'Game-Client & PTU Download' },
    { name: 'RSI Support',        url: 'https://support.robertsspaceindustries.com', desc: 'Bug-Reports & Tickets' },
  ]},
]

export default function QuickLinks() {
  return (
    <div className="page-content">
      <div className="grid-2" style={{ gap: '1rem' }}>
        {LINKS.map(section => (
          <div className="card" key={section.cat}>
            <div className="card-title">{section.cat}</div>
            <div>
              {section.items.map((item, i) => (
                <div key={i}>
                  {i > 0 && <div style={{ height: '1px', background: 'var(--border)', opacity: .4, margin: '3px 0' }} />}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px', borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none', transition: 'background .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--accent)' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.desc}</div>
                    </div>
                    {item.badge && <span className={`badge ${item.badge === 'Top' ? 'badge-green' : item.badge === 'Fun' ? 'badge-amber' : 'badge-blue'}`}>{item.badge}</span>}
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>→</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
