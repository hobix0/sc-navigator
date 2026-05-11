// Static data for the SC Navigator dashboard.
// Tools list, ship inventory, trade routes, refinery jobs, bounties, watchlist.
// ⚠️ DEMO-DATEN AUSKOMMENTIERT — Diese Stück für Stück mit echten Daten ersetzen

/*
const TOOLS = [
  { id: 'erkul',    name: 'Erkul Games',           cat: 'Schiffe',     url: 'https://www.erkul.games/',                desc: 'Loadout-Editor & DPS-Rechner für jedes Schiff.',         icon: 'Wrench',    tag: 'Loadout',     color: '#00B4FF', popularity: 98 },
  { id: 'uex',      name: 'UEXcorp',               cat: 'Trade',       url: 'https://uexcorp.space/',                  desc: 'Live-Commodity-Preise, Routen, Mining-Daten.',           icon: 'Coin',      tag: 'Trade',       color: '#FFB020', popularity: 96 },
  { id: 'sctrade',  name: 'SC Trade Tools',        cat: 'Trade',       url: 'https://sc-trade.tools/',                 desc: 'Profit-Routenberechnung mit Cargo-Optimierung.',         icon: 'Trade',     tag: 'Trade',       color: '#FFB020', popularity: 89 },
  { id: 'regolith', name: 'Regolith Co.',          cat: 'Mining',      url: 'https://regolith.rocks/',                 desc: 'Mining-Session-Tracker, Refinery-Calc, Yield-Logs.',     icon: 'Mining',    tag: 'Mining',      color: '#00D17A', popularity: 84 },
  { id: 'starmap',  name: 'StarMap',               cat: 'Navigation',  url: 'https://robertsspaceindustries.com/starmap', desc: 'Offizielle 3D-Karte des Stanton- und Pyro-Systems.',  icon: 'Map',       tag: 'Navigation',  color: '#3DC2FF', popularity: 90 },
  { id: 'verse',    name: 'Verse',                 cat: 'Navigation',  url: 'https://www.spviewer.eu/',                desc: 'POI-Browser, Quantum-Routen, Outpost-Datenbank.',        icon: 'Globe',     tag: 'Navigation',  color: '#3DC2FF', popularity: 82 },
  { id: 'gallog',   name: 'Gallog',                cat: 'Combat',      url: 'https://gallog.co/',                      desc: 'Bounty- und Combat-Logs, KD-Tracking.',                  icon: 'Bounty',    tag: 'Combat',      color: '#FF4D4D', popularity: 76 },
  { id: 'dpscalc',  name: 'DPS Calculator',        cat: 'Schiffe',     url: 'https://www.starcitizendb.com/',          desc: 'Waffen-DPS-Vergleich, Schadens-Profile.',                icon: 'Crosshair', tag: 'DPS',         color: '#FF4D4D', popularity: 81 },
  { id: 'spectrum', name: 'Spectrum',              cat: 'Community',   url: 'https://robertsspaceindustries.com/spectrum/community/SC', desc: 'Offizielles Forum, Org-Chats, Patch-Threads.', icon: 'Chat',      tag: 'Forum',       color: '#7C7CFF', popularity: 92 },
  { id: 'pledge',   name: 'RSI Pledge Store',      cat: 'Shop',        url: 'https://robertsspaceindustries.com/pledge/ships', desc: 'Offizieller Schiffs-Store von Cloud Imperium Games.', icon: 'Cart',  tag: 'Shop',        color: '#FFB020', popularity: 88 },
  { id: 'starhang', name: 'Star Hangar',           cat: 'Shop',        url: 'https://www.star-hangar.com/',            desc: 'Grey-Market: Schiffe gebraucht kaufen & verkaufen.',     icon: 'Ship',      tag: 'Grey Market', color: '#FFB020', popularity: 71 },
  { id: 'wiki',     name: 'StarCitizen.tools Wiki',cat: 'Wissen',      url: 'https://starcitizen.tools/',              desc: 'Community-Wiki: Schiffe, Items, Lore, Mechaniken.',      icon: 'Book',      tag: 'Wiki',        color: '#3DC2FF', popularity: 87 },
  { id: 'galact',   name: 'Galactapedia',          cat: 'Wissen',      url: 'https://robertsspaceindustries.com/galactapedia', desc: 'Offizielles In-Universe-Lexikon (Lore, Systeme).', icon: 'Book',      tag: 'Lore',        color: '#3DC2FF', popularity: 64 },
  { id: 'cornerstone', name: 'Cornerstone',        cat: 'Org',         url: 'https://cornerstonebase.space/',          desc: 'Org-Management: Events, Roster, Logistik.',              icon: 'Org',       tag: 'Org-Tool',    color: '#7C7CFF', popularity: 58 },
  { id: 'issue',    name: 'Issue Council',         cat: 'Support',     url: 'https://issue-council.robertsspaceindustries.com/', desc: 'Bugs reproduzieren, Reports einreichen, voten.', icon: 'Bug',       tag: 'Bug Report',  color: '#FF4D4D', popularity: 55 },
  { id: 'status',   name: 'RSI Status Page',       cat: 'Support',     url: 'https://status.robertsspaceindustries.com/', desc: 'Server-Status: PU, PTU, Tech-Preview, Auth.',         icon: 'Status',    tag: 'Status',      color: '#00D17A', popularity: 73 },
  { id: 'patch',    name: 'Patch Notes & Roadmap', cat: 'Wissen',      url: 'https://robertsspaceindustries.com/roadmap/release-view', desc: 'Release-View, Build-Logs, Patch-Notes Archiv.', icon: 'Doc',  tag: 'Patch',       color: '#3DC2FF', popularity: 79 },
];
*/
const TOOLS = [];

/*
const TOOL_CATS = ['Alle', 'Schiffe', 'Trade', 'Mining', 'Navigation', 'Combat', 'Community', 'Shop', 'Wissen', 'Org', 'Support'];
*/
const TOOL_CATS = ['Alle'];

/*
const SHIPS = [
  { id: 'avenger',  name: 'Avenger Titan',     mfr: 'Aegis',     role: 'Light Freight',     status: 'Bereit',      hp: 100, fuel: 86, shields: 100 },
  { id: 'cutlass',  name: 'Cutlass Black',     mfr: 'Drake',     role: 'Multi-Crew',        status: 'Bereit',      hp: 92,  fuel: 64, shields: 88  },
  { id: 'c2',       name: 'C2 Hercules',       mfr: 'Crusader',  role: 'Heavy Cargo',      status: 'In Wartung', hp: 64,  fuel: 12, shields: 70  },
  { id: 'prospect', name: 'Prospector',        mfr: 'MISC',      role: 'Solo Mining',       status: 'Bereit',      hp: 100, fuel: 92, shields: 100 },
  { id: 'arrow',    name: 'Arrow',             mfr: 'Anvil',     role: 'Interceptor',       status: 'Bereit',      hp: 100, fuel: 78, shields: 100 },
  { id: 'connie',   name: 'Constellation Andromeda', mfr: 'RSI', role: 'Multi-Role',       status: 'Hangar',      hp: 100, fuel: 100, shields: 100 },
];
*/
const SHIPS = [];

/*
const TRADE_ROUTES = [
  { commodity: 'Laranite',     from: 'ARC-L1',           to: 'CRU-L1',           buy: 2792, sell: 3098, profit: 306, scu: 696, risk: 'low'  },
  { commodity: 'Medical Sup.', from: 'GrimHEX',          to: 'Port Olisar',      buy: 18.0, sell: 19.7, profit:  1.7, scu: 696, risk: 'med'  },
  { commodity: 'Agricium',     from: 'HUR-L2',           to: 'ARC-L1',           buy: 2546, sell: 2750, profit: 204, scu: 696, risk: 'low'  },
  { commodity: 'Quantanium',   from: 'Lyria (Daymar)',   to: 'CRU-L1',           buy: 8800, sell: 9410, profit: 610, scu: 64,  risk: 'high' },
  { commodity: 'Stims',        from: 'Port Olisar',      to: 'GrimHEX',          buy:  3.8, sell:  4.4, profit:  0.6, scu: 696, risk: 'med'  },
  { commodity: 'Titanium',     from: 'Magnus (ARC-L1)',  to: 'Microtech',        buy:  2.4, sell:  2.6, profit:  0.2, scu: 696, risk: 'low'  },
];
*/
const TRADE_ROUTES = [];

/*
const REFINERY = [
  { id: 'r1', station: 'ArcCorp Mining Area 045', method: 'Cormack',     ore: 'Laranite',  inputScu: 32, outputScu: 22, costAuec: 11420, eta: 1000 * 60 * 47, started: Date.now() - 1000 * 60 * 18 },
  { id: 'r2', station: 'HUR-L2 Refinery',         method: 'Dinyx Solventation', ore: 'Quantanium', inputScu: 16, outputScu: 13, costAuec: 28860, eta: 1000 * 60 * 92, started: Date.now() - 1000 * 60 * 71 },
  { id: 'r3', station: 'CRU-L1 Refinery',         method: 'XCR-Reaction',ore: 'Agricium',  inputScu: 64, outputScu: 41, costAuec: 22100, eta: 1000 * 60 * 30, started: Date.now() - 1000 * 60 * 28 },
];
*/
const REFINERY = [];

/*
const BOUNTIES = [
  { id: 'b1', target: 'Olef Trapeznikov', faction: 'Nine Tails',     loc: 'Yela Asteroid Belt',     reward: 18750, tier: 'V', diff: 'hard'   },
  { id: 'b2', target: 'Dax Skinflint',     faction: 'Outlaw',         loc: 'Daymar (Shubin Mining)', reward:  9450, tier: 'III', diff: 'med'   },
  { id: 'b3', target: 'Patrol Sweep',      faction: 'Crusader Sec.',  loc: 'Crusader Orbit',         reward:  3800, tier: 'II',  diff: 'easy'  },
  { id: 'b4', target: 'Vaughn Marlowe',    faction: 'Headhunters',    loc: 'Lyria Surface',          reward: 22300, tier: 'V',   diff: 'hard'  },
];
*/
const BOUNTIES = [];

/*
const WATCHLIST = [
  { ship: 'Drake Corsair',          mfr: 'Drake',     price: 280, change: -15, alert: true  },
  { ship: 'Aegis Redeemer',         mfr: 'Aegis',     price: 305, change:  +0, alert: false },
  { ship: 'Anvil Carrack Expedition', mfr: 'Anvil', price: 685, change: +25, alert: true  },
  { ship: 'RSI Polaris',            mfr: 'RSI',       price: 825, change:  -5, alert: false },
];
*/
const WATCHLIST = [];

/*
const SERVERS = [
  { region: 'EU Central',  ping: 24,  load: 0.62, status: 'ok',   build: '4.0.1-LIVE.9384127' },
  { region: 'EU West',     ping: 38,  load: 0.78, status: 'ok',   build: '4.0.1-LIVE.9384127' },
  { region: 'US East',     ping: 112, load: 0.84, status: 'warn', build: '4.0.1-LIVE.9384127' },
  { region: 'US West',     ping: 168, load: 0.71, status: 'ok',   build: '4.0.1-LIVE.9384127' },
  { region: 'APAC',        ping: 244, load: 0.55, status: 'ok',   build: '4.0.1-LIVE.9384127' },
  { region: 'PTU EU',      ping: 28,  load: 0.92, status: 'crit', build: '4.1.0-PTU.9410523' },
];
*/
const SERVERS = [];

/*
const PATCH = {
  version: '4.0.1',  branch: 'LIVE',  build: '9384127',
  released: 'vor 3 Tagen',
  highlights: [
    'Pyro-Jumppoint Stabilität verbessert',
    'Mining-Yield Balancing (Quantanium +8%)',
    'Schiffs-Komponenten Tier-2 Update',
    'Server Meshing Replication Layer Fix',
  ],
};
*/
const PATCH = {};

/*
const EVENTS = [
  { name: 'XenoThreat', loc: 'Pyro System', endsIn: '4d 12h', severity: 'high'  },
  { name: 'Jumptown 2.0', loc: 'Yela',     endsIn: '1d 06h', severity: 'med'   },
  { name: 'Siege of Orison', loc: 'Crusader', endsIn: '2d 22h', severity: 'high' },
];
*/
const EVENTS = [];

window.SCData = { TOOLS, TOOL_CATS, SHIPS, TRADE_ROUTES, REFINERY, BOUNTIES, WATCHLIST, SERVERS, PATCH, EVENTS };
