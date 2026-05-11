# Item Database Popup Feature

## Überblick

Wenn Sie in der **Item-Datenbank (Item-DB)** auf einen Item-Eintrag klicken, wird ein **Popup-Modal** angezeigt, das alle Details zum Item enthält. Der Modal ruft zusätzliche Daten von der **Star Citizen Wiki API** ab.

## Features

### ✅ Implementiert
- **Popup-Modal** öffnet sich beim Klick auf ein Item in der Tabelle
- **Basis-Informationen** des Items (Typ, Hersteller, Größe, Grade, Status)
- **Wiki-API Integration** - versucht, zusätzliche Daten von `https://api.star-citizen.wiki/items/{class_name}` zu laden
- **Fehlerbehandlung** - zeigt freundliche Fehlermeldungen bei API-Problemen
- **Modal-Navigation**:
  - `X`-Button (rechts oben) zum Schließen
  - "Schließen"-Button am unteren Ende
  - Klick außerhalb des Modals schließt es

### 📋 Item-Details im Modal

Das Modal zeigt folgende Informationen:

```
┌─────────────────────────────────────┐
│ Item Name                        [X]│  ← Click to close
│ class_name                          │
├─────────────────────────────────────┤
│ Typ          │ Hersteller          │
│ [Badge]      │ Name                │
│              │                     │
│ Größe        │ Grade               │
│ [Size]       │ [Grade]             │
│              │                     │
│ Subtyp       │ Status              │
│ [Type]       │ [Legal/Illegal]     │
├─────────────────────────────────────┤
│ Wiki-Daten (wird geladen)...        │
├─────────────────────────────────────┤
│ [Wiki Link]              [Schließen]│
└─────────────────────────────────────┘
```

## API Integration

### Star Citizen Wiki API Endpoint

```
GET https://api.star-citizen.wiki/items/{class_name}
```

**Beispiel:**
- Item: "Sledge III Mass Driver Cannon"
- Class Name: `KLWE_MassDriver_S3`
- API URL: `https://api.star-citizen.wiki/items/KLWE_MassDriver_S3`

### Wiki-Daten die angezeigt werden

- **Description**: Ausführliche Beschreibung des Items
- **Manufacturer Info**: Hersteller-Details
- **Tags**: Kategorisierungs-Tags

Falls die API keine Daten liefert, wird eine freundliche Meldung angezeigt:
> "Keine zusätzlichen Wiki-Daten verfügbar"

## Technische Details

### Komponenten

#### `ItemDetailModal({ item, onClose })`
- **Eingaben**: Item-Objekt, onClose Callback
- **Zustand**:
  - `wikiData`: Daten von der Wiki API
  - `loading`: Lade-Status (true/false)
  - `error`: Fehlermeldung (falls vorhanden)
- **Funktion**: Rendert das Modal und verwaltet API-Requests

#### `ItemDatabase()`
- Verwaltet den `selectedItem`-State
- Rendert `<ItemDetailModal>` wenn `selectedItem` gesetzt ist
- Click-Handler auf Tabellen-Zeilen setzen das Item

### CORS & Browser-Einschränkungen

**CORS-Fehler bei Lokal-Tests (file://)**

Wenn Sie die Seite lokal öffnen (`file://`), gibt es möglicherweise CORS-Fehler:
```
"Error: Failed to fetch" oder "Unexpected token '<'..."
```

Dies ist normal und **kein Bug**, da:
- Browser blockieren Cross-Origin Requests für `file://` URLs
- Die Wiki API hat keine CORS-Header für `file://` konfiguriert

**Lösung**: Die App funktioniert problemlos wenn sie über **HTTP(S)** served wird (z.B. GitHub Pages, lokaler Server):
```bash
npx serve . -l 8000
```

Dann öffnen Sie: `http://localhost:8000`

## Farb-Codierung

Items werden nach Typ farblich gekennzeichnet:

| Typ | Farbe |
|-----|-------|
| FPS Waffe | 🔴 Rot |
| Rüstung | 🔵 Blau |
| Kleidung | 🟣 Violett |
| Waffenaufsatz | 🟠 Orange |
| Medizin | 🟢 Grün |
| Schiffswaffe | 🟠 Orange |
| Schild | 🔵 Cyan |
| Kühler | 🔵 Cyan |
| Reaktor | 🟡 Gelb |
| Quantum-Antrieb | 🟣 Violett |
| Rakete | 🔴 Rosa |
| Mining-Laser | 🟢 Lime |

Diese Farben werden auch im Modal angewendet.

## Benutzer-Workflow

1. **Navigiere zur Item-DB** → Klick auf "Item-DB" Tab
2. **Such- & Filter-optionen verwenden** (optional)
   - Suchfeld für Namen/Hersteller/Klasse
   - Typ-Dropdown für Kategorisierung
   - Hersteller-Dropdown
3. **Klick auf ein Item** in der Tabelle → Modal öffnet sich
4. **Lese die Details**
   - Basis-Infos aus der lokalen Datenbank
   - Wiki-Daten (wenn verfügbar)
5. **Wiki-Seite öffnen** → Klick auf "Auf Wiki anschauen"
6. **Modal schließen**
   - X-Button oben rechts
   - Schließen-Button unten
   - Klick außerhalb des Modals

## Zukünftige Erweiterungen (Optional)

Mögliche Verbesserungen:

- [ ] Keyboard-Navigation (Arrow Keys, ESC zum Schließen)
- [ ] Vor/Zurück-Buttons zwischen Items
- [ ] Favoriten-Funktion (💝 Icon)
- [ ] Item-Vergleich (mehrere Items gleichzeitig)
- [ ] Export zu JSON/CSV
- [ ] Preise und Handelswerte (von UEXcorp API)
- [ ] Item-Reviews und Ratings
- [ ] Trade-Routen Filter (nach Item-Type)

## Fehlerbehebung

### Problem: Modal öffnet sich nicht
- Stellen Sie sicher, dass die Datei `data-items.json` geladen wird
- Überprüfen Sie die Browser-Console auf Fehler

### Problem: Wiki-Daten laden nicht
- Das ist normal bei `file://` URLs (CORS)
- Nutzen Sie einen lokalen HTTP-Server statt `file://`
- Oder deployem Sie auf GitHub Pages / Netlify

### Problem: Items werden nicht angezeigt
- Warten Sie, bis `data-items.json` geladen ist
- Prüfen Sie die Filter und Suchfelder
- Überprüfen Sie, ob die JSON-Datei gültig ist

## Datei-Änderungen

### Modifiziert:
- **app-bundle.jsx** 
  - Neue `ItemDetailModal` Komponente
  - Modal-State in `ItemDatabase` hinzugefügt
  - Click-Handler auf Tabellen-Zeilen

- **icons.jsx**
  - Neues `Icon.X` (Close-Button Icon)

### Nicht modifiziert:
- `data-items.json` (Datenquelle)
- Andere Komponenten

## API-Quelle

**Star Citizen Wiki API**
- Website: https://api.star-citizen.wiki
- Dokumentation: https://star-citizen.wiki
- Items Endpoint: `/items/{class_name}`
- Response: JSON mit `data` Property

Beispiel-Response:
```json
{
  "data": {
    "id": "...",
    "name": "Item Name",
    "description": "...",
    "manufacturer": "...",
    "tags": ["tag1", "tag2"],
    "class_name": "..."
  }
}
```
