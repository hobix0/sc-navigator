# SC Navigator — Datei-Architektur & Daten-Integration

## 📁 Projektstruktur & Verantwortlichkeiten

### Core-Dateien

| Datei | Zweck | Rolle | Änderungen/Daten |
|-------|-------|-------|------------------|
| **index.html** | Einstiegspunkt | Lädt alle Scripts und definiert die grundlegende HTML-Struktur | Nur bei Änderungen an Meta-Tags, Fonts oder globalen CSS-Variablen |
| **data.jsx** | 📊 Datenspeicher | Enthält alle statischen/dynamischen Daten | ✏️ **HIER neue Daten einfügen** |
| **app-bundle.jsx** | 🎨 UI-Komponenten | React-Komponenten für alle Panels und Widgets | Nur bei Layout/Styling-Änderungen |
| **icons.jsx** | 🎯 Icon-Set | Alle SVG-Icons als React-Komponenten | Neue Icons hinzufügen wenn nötig |
| **tools.jsx** | 🛠️ Tool-Grid | Suchbar-/Filterbares Tool-Verzeichnis | Bereits in `app-bundle.jsx` integriert |
| **tweaks-panel.jsx** | ⚙️ Einstellungen | Theme-Switching, Blur-Einstellungen, Hintergründe | Nur bei neuen Einstellungs-Optionen |
| **widgets.jsx** | 📦 Widget-Library | Reusable UI-Komponenten (deprecated/integriert) | Nicht verwendet |
| **starfield.js** | 🌟 Hintergrund | Starfield-Animation (deaktiviert in CSS) | Nicht verwendet |

---

## 🎯 Daten-Verwaltung in `data.jsx`

### Aktuelle Struktur (auskommentiert):

```javascript
// window.SCData exportiert folgende Objekte:
{
  TOOLS,           // Array: Community-Tools & externe Services
  TOOL_CATS,       // Array: Kategorien für Tool-Filter
  SHIPS,           // Array: Spieler-Schiffe im Hangar
  TRADE_ROUTES,    // Array: Top-Profit-Handelrouten
  REFINERY,        // Array: Laufende Mining-Refinery-Jobs
  BOUNTIES,        // Array: Verfügbare Bounty-Missionen
  WATCHLIST,       // Array: Beobachtete Schiffe (Preise)
  SERVERS,         // Array: Server-Status (Ping, Load, Build)
  PATCH,           // Object: Patch-Version & Highlights
  EVENTS           // Array: Aktuelle Events (XenoThreat, etc.)
}
```

---

## 📝 Wie man Daten einpflegt

### 1️⃣ **TOOLS** (Community-Tools)

**Datei:** `data.jsx` (Zeile ~4-20)

**Format:**
```javascript
const TOOLS = [
  { 
    id: 'unique-id',
    name: 'Tool Name',
    cat: 'Schiffe|Trade|Mining|Navigation|Combat|Community|Shop|Wissen|Org|Support',
    url: 'https://example.com',
    desc: 'Kurzbeschreibung (max 80 Zeichen)',
    icon: 'Wrench|Coin|Trade|Mining|Map|Globe|Bounty|Chat|Cart|Ship|Crosshair|Book',
    tag: 'Loadout|Trade|Mining|DPS|Forum|Shop|Wiki|Org-Tool|Bug Report|Status|Patch',
    color: '#00B4FF',
    popularity: 85
  }
];
```

**Wo ändern:** `data.jsx` Zeile 5-22 (uncomment TOOLS Array)

---

### 2️⃣ **SHIPS** (Hangar-Flotte)

**Datei:** `data.jsx` (Zeile ~24-30)

**Format:**
```javascript
const SHIPS = [
  { 
    id: 'ship-id',
    name: 'Schiff-Name',
    mfr: 'Manufacturer (Aegis|Drake|Crusader|MISC|Anvil|RSI)',
    role: 'Light Freight|Multi-Crew|Heavy Cargo|Solo Mining|Interceptor|Multi-Role',
    status: 'Bereit|In Wartung|Hangar',
    hp: 100,         // 0-100 (Hull Points %)
    fuel: 86,        // 0-100 (Quantum Fuel %)
    shields: 100     // 0-100 (Shield Integrity %)
  }
];
```

**Wo ändern:** `data.jsx` Zeile 25-31 (uncomment SHIPS Array)
**UI-Komponente:** `HangarPanel()` in `app-bundle.jsx` (Zeile 69-112)

---

### 3️⃣ **TRADE_ROUTES** (Handelrouten)

**Datei:** `data.jsx` (Zeile ~32-38)

**Format:**
```javascript
const TRADE_ROUTES = [
  { 
    commodity: 'Commodity Name',
    from: 'Start-Ort',
    to: 'Ziel-Ort',
    buy: 2792,       // Kaufpreis pro SCU
    sell: 3098,      // Verkaufspreis pro SCU
    profit: 306,     // profit = sell - buy
    scu: 696,        // verfügbare Menge
    risk: 'low|med|high'
  }
];
```

**Wo ändern:** `data.jsx` Zeile 33-39 (uncomment TRADE_ROUTES Array)
**UI-Komponente:** `TradeRoutes()` in `app-bundle.jsx` (Zeile 128-197)

---

### 4️⃣ **REFINERY** (Mining-Raffinerie-Jobs)

**Datei:** `data.jsx` (Zeile ~40-43)

**Format:**
```javascript
const REFINERY = [
  { 
    id: 'job-id',
    station: 'Station Name',
    method: 'Cormack|Dinyx Solventation|XCR-Reaction',
    ore: 'Laranite|Quantanium|Agricium',
    inputScu: 32,           // Eingabe Menge
    outputScu: 22,          // Output Menge
    costAuec: 11420,        // Kosten in aUEC
    eta: 1000 * 60 * 47,    // Millisekunden bis fertig
    started: Date.now() - 1000 * 60 * 18  // Startzeitpunkt
  }
];
```

**Wo ändern:** `data.jsx` Zeile 41-44 (uncomment REFINERY Array)
**UI-Komponente:** `RefineryTimer()` in `app-bundle.jsx` (Zeile 211-251)

---

### 5️⃣ **BOUNTIES** (Kopfgeldjäger-Missionen)

**Datei:** `data.jsx` (Zeile ~45-49)

**Format:**
```javascript
const BOUNTIES = [
  { 
    id: 'bounty-id',
    target: 'Ziel-Name',
    faction: 'Nine Tails|Outlaw|Crusader Sec.|Headhunters',
    loc: 'Location/System',
    reward: 18750,        // Belohnung in aUEC
    tier: 'V|IV|III|II|I',
    diff: 'hard|med|easy'
  }
];
```

**Wo ändern:** `data.jsx` Zeile 46-50 (uncomment BOUNTIES Array)
**UI-Komponente:** `BountyTracker()` in `app-bundle.jsx` (Zeile 257-309)

---

### 6️⃣ **WATCHLIST** (Schiff-Preisbeobachtung)

**Datei:** `data.jsx` (Zeile ~51-55)

**Format:**
```javascript
const WATCHLIST = [
  { 
    ship: 'Schiff-Name',
    mfr: 'Hersteller',
    price: 280,           // Preis in USD/aUEC
    change: -15,          // Preisänderung (%)
    alert: true|false     // Alert aktiv?
  }
];
```

**Wo ändern:** `data.jsx` Zeile 52-56 (uncomment WATCHLIST Array)
**UI-Komponente:** `Watchlist()` in `app-bundle.jsx` (Zeile 315-348)

---

### 7️⃣ **SERVERS** (Server-Status)

**Datei:** `data.jsx` (Zeile ~57-63)

**Format:**
```javascript
const SERVERS = [
  { 
    region: 'EU Central|EU West|US East|US West|APAC|PTU EU',
    ping: 24,              // Millisekunden
    load: 0.62,            // 0.0-1.0 (Auslastung)
    status: 'ok|warn|crit',
    build: '4.0.1-LIVE.9384127'
  }
];
```

**Wo ändern:** `data.jsx` Zeile 58-64 (uncomment SERVERS Array)
**UI-Komponente:** `ServerStatus()` in `app-bundle.jsx` (Zeile 36-66)

---

### 8️⃣ **PATCH** (Patch-Version & Highlights)

**Datei:** `data.jsx` (Zeile ~65-72)

**Format:**
```javascript
const PATCH = {
  version: '4.0.1',
  branch: 'LIVE|PTU|Tech-Preview',
  build: '9384127',
  released: 'vor 3 Tagen',
  highlights: [
    'Change 1',
    'Change 2',
    'Change 3'
  ]
};
```

**Wo ändern:** `data.jsx` Zeile 66-73 (uncomment PATCH Object)
**UI-Komponente:** `EventsPanel()` in `app-bundle.jsx` (Zeile 354-398)

---

### 9️⃣ **EVENTS** (Aktuelle Events)

**Datei:** `data.jsx` (Zeile ~74-78)

**Format:**
```javascript
const EVENTS = [
  { 
    name: 'Event Name (XenoThreat, Jumptown, etc)',
    loc: 'Location/System',
    endsIn: '4d 12h',        // Zeitformat
    severity: 'high|med|low'
  }
];
```

**Wo ändern:** `data.jsx` Zeile 75-79 (uncomment EVENTS Array)
**UI-Komponente:** `EventsPanel()` in `app-bundle.jsx` (Zeile 354-398)

---

## 🔗 Komponenten-Referenz

### `app-bundle.jsx` Komponenten:

| Komponente | Zeile | Input-Daten | Output |
|-----------|-------|------------|--------|
| `ServerStatus()` | 36 | `SERVERS`, `PATCH` | Server-Status Panel |
| `HangarPanel()` | 69 | `SHIPS` | Schiff-Übersicht |
| `TradeRoutes()` | 128 | `TRADE_ROUTES` | Top-Routen Liste |
| `RefineryTimer()` | 211 | `REFINERY` | Raffinerie-Jobs mit Timer |
| `BountyTracker()` | 257 | `BOUNTIES` | Bounty-Mission Tracker |
| `Watchlist()` | 315 | `WATCHLIST` | Preis-Beobachtung |
| `EventsPanel()` | 354 | `EVENTS`, `PATCH` | Events & Patch-Notes |
| `ToolGrid()` | tools.jsx | `TOOLS`, `TOOL_CATS` | Tool-Verzeichnis |

---

## 🚀 Schritt-für-Schritt: Neue Daten hinzufügen

### Beispiel: Tools hinzufügen

1. Öffne `data.jsx`
2. Finde Zeile 5-22 mit auskommentierten TOOLS
3. Uncomment: `/* const TOOLS = [ ... */` → `const TOOLS = [`
4. Füge neue Tools hinzu oder ersetze alte
5. Uncomment: `... */` → Nur `];`
6. Speichern, Browser neuladen

```javascript
const TOOLS = [
  // Bestehende Tools...
  { id: 'mein-tool', name: 'Mein Tool', cat: 'Trade', url: '...', ... }
];
```

---

## 📡 API-Integration (Zukünftig)

Wenn du echte Live-Daten laden möchtest:

```javascript
// Am Ende von data.jsx vor window.SCData Export
async function loadLiveData() {
  try {
    const [servers, routes] = await Promise.all([
      fetch('https://status.robertsspaceindustries.com/api/v1/summary').then(r => r.json()),
      fetch('https://uexcorp.space/api/v2/trading-routes').then(r => r.json()),
    ]);
    return { servers, routes };
  } catch (e) {
    console.error('API Fehler:', e);
    return { servers: [], routes: [] };
  }
}

// Später in den Komponenten verwenden
// const [data, setData] = useState(null);
// useEffect(() => { loadLiveData().then(setData); }, []);
```

---

## 🛠️ Wichtige Keyboard-Shortcuts

- **F12** = DevTools öffnen
- **Ctrl+Shift+J** = Console
- **Ctrl+Shift+C** = Element Inspector

---

## ⚡ Performance-Tipps

1. **Vorsicht bei großen Arrays** → Bei >1000 Items Virtualisierung prüfen
2. **Icons cachen** → Icons sind SVG-Komponenten, werden automatisch gecacht
3. **CSS-Klassen sparsam** → Verwende Tailwind-Klassen aus index.html
4. **localStorage nutzen** → Für Favoriten bereits integriert (`sc-nav.favs`)

---

## 📞 Häufig gestellte Fragen

### Q: Wie ändere ich Farben?
A: CSS-Variablen in `index.html` (Zeile 30-45):
```css
:root {
  --accent: #3B82F6;  /* Blau */
  --text: #E4E4E7;    /* Text-Farbe */
}
```

### Q: Wie füge ich ein neues Icon hinzu?
A: Definiere in `icons.jsx`:
```javascript
MeinIcon: (p) => <svg viewBox="0 0 24 24" {...p}>...</svg>,
```

### Q: Wie speichere ich lokale Einstellungen?
A: Nutze `localStorage`:
```javascript
localStorage.setItem('mein-key', JSON.stringify(data));
JSON.parse(localStorage.getItem('mein-key'));
```

---

## 📋 Checkliste für neue Daten

- [ ] Daten in `data.jsx` hinzugefügt
- [ ] Richtige Feld-Namen nach Schema
- [ ] Array/Object-Struktur korrekt
- [ ] `window.SCData` Export geprüft
- [ ] Im Browser F12 → Console → `window.SCData` testen
- [ ] Komponente prüft auf leere Arrays (`?.length`)
- [ ] Fallback-UI wird angezeigt wenn leer

---

**Viel Erfolg beim Befüllen der Daten! 🚀**
