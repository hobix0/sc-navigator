// ──────────────────────────────────────────────────────────────────────────────
// SC Navigator · Quick Links Daten
//
// Struktur:
//   - Jede Kategorie hat: id, label, icon, accent (Farbe), items[]
//   - Jeder Link hat: id, name, url, desc, badge (optional)
//
// Badge-Typen: 'top' | 'new' | 'p2p' | 'fun' | 'ref' | 'live'
// Accent-Farben: 'cyan' | 'purple' | 'green' | 'amber'
//
// Um einen neuen Link hinzuzufügen:
//   1. Passende Kategorie suchen
//   2. Neues Objekt in das items[] Array einfügen
//   3. Fertig — wird automatisch angezeigt
// ──────────────────────────────────────────────────────────────────────────────

export const LINK_CATEGORIES = [
  // ── Schiffe & Ausrüstung ────────────────────────────────────────────────────
  {
    id: 'ships',
    label: 'Ships & Loadouts',
    icon: '🚀',
    accent: 'cyan',
    items: [
      {
        id: 'erkul',
        name: 'Erkul.games',
        url: 'https://www.erkul.games',
        desc: 'Loadout-Optimizer, DPS-Rechner & Ausrüstungsvergleich',
        badge: 'top',
      },
      {
        id: 'fleetyards',
        name: 'FleetYards.net',
        url: 'https://fleetyards.net',
        desc: 'Komplette Schiffsdatenbank mit Filterfunktion & Vergleich',
      },
      {
        id: 'spviewer',
        name: 'Ship Performance Viewer',
        url: 'https://www.spviewer.eu',
        desc: 'Detaillierte Ausrüstungsstatistiken & Itemvergleich',
      },
      {
        id: 'rsi-pledge',
        name: 'RSI Pledge Store',
        url: 'https://robertsspaceindustries.com/pledge/ships',
        desc: 'Offizieller Schiffs-Shop von Cloud Imperium Games',
      },
    ],
  },

  // ── Handel & Wirtschaft ────────────────────────────────────────────────────
  {
    id: 'trading',
    label: 'Trading & Economy',
    icon: '📈',
    accent: 'green',
    items: [
      {
        id: 'sc-trade',
        name: 'SC Trade Tools',
        url: 'https://sc-trade.tools',
        desc: 'Optimale Handelsrouten, Profit-Kalkulator & Marktübersicht',
        badge: 'top',
      },
      {
        id: 'uexcorp',
        name: 'UEX Corp',
        url: 'https://uexcorp.space',
        desc: 'Live-Marktpreise, Commodity-Daten & öffentliche API',
        badge: 'live',
      },
      {
        id: 'gallog',
        name: 'Gallog',
        url: 'https://gallog.co',
        desc: 'Persönliches Cargo-Tracking & Reiselogbuch',
      },
      {
        id: 'sc-market',
        name: 'SC Market',
        url: 'https://sc-market.space',
        desc: 'Spieler-zu-Spieler Marktplatz für Items & Schiffe',
        badge: 'p2p',
      },
    ],
  },

  // ── Karten & Navigation ────────────────────────────────────────────────────
  {
    id: 'maps',
    label: 'Maps & Navigation',
    icon: '🗺️',
    accent: 'purple',
    items: [
      {
        id: 'starmap',
        name: 'RSI Starmap',
        url: 'https://starmap.robertsspaceindustries.com',
        desc: 'Offizieller interaktiver Sternenkarte von CIG',
      },
      {
        id: 'knightfall',
        name: 'Knightfall Planetmap',
        url: 'https://sc.knightfall.space',
        desc: 'Detaillierte Planeten, Monde & Points of Interest',
        badge: 'top',
      },
      {
        id: 'wiki-locations',
        name: 'Wiki: Alle Locations',
        url: 'https://starcitizen.tools/Locations',
        desc: 'Landezonen, Shops, Outposts & Bunker im Überblick',
      },
      {
        id: 'wiki-missions',
        name: 'Mission-Übersicht',
        url: 'https://starcitizen.tools/List_of_missions',
        desc: 'Alle Mission-Typen, Auftraggeber & Belohnungen',
      },
    ],
  },

  // ── Patch & Roadmap ─────────────────────────────────────────────────────────
  {
    id: 'roadmap',
    label: 'Patch & Roadmap',
    icon: '📋',
    accent: 'amber',
    items: [
      {
        id: 'roadmap-release',
        name: 'Release Roadmap',
        url: 'https://robertsspaceindustries.com/roadmap/release-view',
        desc: 'Welche Features kommen in welchem Patch?',
      },
      {
        id: 'progress-tracker',
        name: 'Progress Tracker',
        url: 'https://robertsspaceindustries.com/roadmap/progress-tracker',
        desc: 'Fortschritt aller Features & Entwicklungsteams',
      },
      {
        id: 'patchnotes',
        name: 'Offizielle Patchnotes',
        url: 'https://robertsspaceindustries.com/patch-notes',
        desc: 'Live & PTU Release Notes direkt von CIG',
      },
      {
        id: 'isthisscup',
        name: 'isthisscup.com',
        url: 'https://isthisscup.com',
        desc: 'Schnellcheck: Sind die Server gerade erreichbar?',
        badge: 'fun',
      },
    ],
  },

  // ── Community & News ────────────────────────────────────────────────────────
  {
    id: 'community',
    label: 'Community & News',
    icon: '💬',
    accent: 'cyan',
    items: [
      {
        id: 'spectrum',
        name: 'RSI Spectrum',
        url: 'https://robertsspaceindustries.com/spectrum/community/SC',
        desc: 'Offizielles Forum, Dev-Kommunikation & Gilden',
      },
      {
        id: 'reddit',
        name: 'r/starcitizen',
        url: 'https://www.reddit.com/r/starcitizen',
        desc: 'Reddit Community: News, Clips, Bugs & Diskussionen',
      },
      {
        id: 'comm-link',
        name: 'Comm-Link',
        url: 'https://robertsspaceindustries.com/comm-link/',
        desc: 'Offizielle CIG-Ankündigungen, Lore & Ship-Reveals',
      },
      {
        id: 'cig-youtube',
        name: 'CIG YouTube',
        url: 'https://www.youtube.com/@CIGCommunity',
        desc: 'Offizielle Entwickler-Videos, ISC & CitizenCon',
      },
    ],
  },

  // ── Tools & Account ─────────────────────────────────────────────────────────
  {
    id: 'tools',
    label: 'Tools & Account',
    icon: '⚙️',
    accent: 'purple',
    items: [
      {
        id: 'sc-wiki',
        name: 'Star Citizen Wiki',
        url: 'https://starcitizen.tools',
        desc: 'Vollständiges Community-Lexikon für alles im Spiel',
        badge: 'ref',
      },
      {
        id: 'rsi-account',
        name: 'RSI Account / Hangar',
        url: 'https://robertsspaceindustries.com/account',
        desc: 'Eigene Flotte, Referrals & Kontoverwaltung',
      },
      {
        id: 'rsi-launcher',
        name: 'RSI Launcher',
        url: 'https://robertsspaceindustries.com/launcher',
        desc: 'Game-Client Download & PTU Zugang',
      },
      {
        id: 'rsi-support',
        name: 'RSI Support',
        url: 'https://support.robertsspaceindustries.com',
        desc: 'Bug-Reports, Account-Probleme & Ticket-System',
      },
    ],
  },
]

// ── Badge-Konfig (Label + Farbe) ────────────────────────────────────────────
// Wird in der QuickLinks-Komponente für das Rendering genutzt
export const BADGE_CONFIG = {
  top:  { label: 'TOP',  style: 'cyan'   },
  live: { label: 'LIVE', style: 'green'  },
  new:  { label: 'NEW',  style: 'purple' },
  p2p:  { label: 'P2P',  style: 'amber'  },
  fun:  { label: 'FUN',  style: 'amber'  },
  ref:  { label: 'REF',  style: 'purple' },
}
