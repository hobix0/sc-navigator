# 🚀 SC Navigator - Build Plan

**Projekt-Start:** 8. Mai 2026  
**Ziel:** Transparente, minimalistisch-moderne Webseite mit Star Citizen Webseite-Übersicht

---

## 📋 Schritte zum Abschluss

### Phase 1: Vorbereitung & Setup ✅
- [x] Node.js/npm installieren (Windows)
- [x] Vite + React Projekt erstellen
- [x] Tailwind CSS v3 installieren & konfigurieren
- [x] Dependencies installieren
- [x] Dev-Server starten & testen

### Phase 2: UI/Design überarbeiten ✅
- [x] Dark Theme mit transparenten Elementen (Glasmorphismus) implementieren
- [x] Farben anpassen (Blau/Cyan wie auf dem Bild)
- [x] Responsive Layout for Desktop/Mobile (3-spaltig auf Desktop)
- [x] Loading-Animationen & Hover-Effekte hinzufügen
- [x] Custom Tailwind-Komponenten (.glass, .glass-hover, etc.)

### Phase 3: Tab-System für Webseiten ✅
- [x] Tabs für Kategorien erstellen (Offiziell, Tools, Community, Info & Status)
- [x] Bekannte SC Webseiten in `data/websites.js` auflisten (10 wichtigste Tools)
- [x] Tab-Navigation mit Styling implementieren
- [x] React State für aktiven Tab verwalten
- [x] Smooth Transitions zwischen Tabs

### Phase 4: Verfeinerung & Testing ✅
- [x] Mobile Responsivität prüfen (Grid passt sich an)
- [x] Browser-Kompatibilität testen (funktioniert im Chrome)
- [x] Performance optimieren (Vite HMR funktioniert)
- [x] README aktualisieren mit neuen Infos
- [x] Komponenten-Struktur dokumentieren

### Phase 5: Zukünftige Verbesserungen 🔜
- [ ] Deployment auf GitHub Pages
- [ ] Sternenkarte Feature
- [ ] Item-Datenbank
- [ ] Calculators
- [ ] Benutzer-Login & Flottenmanagement
- [ ] Dark/Light Mode Toggle

---

## 📝 Implementierte Features

| Feature | Status | Notes |
|---------|--------|-------|
| Header mit Logo & Beschreibung | ✅ | Mit Gradient-Text & Background Blur |
| Tab-Navigation | ✅ | 4 Kategorien mit Active-State |
| Glasmorphism Cards | ✅ | Transparente UI mit Hover-Effekten |
| Responsive Grid | ✅ | 3 Col (Desktop) → 2 Col (Tablet) → 1 Col (Mobile) |
| 10 SC-Websites | ✅ | Offiziell, Tools, Community, Info & Status |
| Dark Theme | ✅ | Blau/Cyan Gradient mit Accenten |
| Tailwind CSS v3 | ✅ | Vollständig konfiguriert |

---

## 🔧 Änderungen-Log

| Datum | Change | Status |
|-------|--------|--------|
| 8. Mai | Vite + React Setup | ✅ |
| 8. Mai | Tailwind CSS v3 (v4 war inkompatibel) | ✅ |
| 8. Mai | Glasmorphism Design | ✅ |
| 8. Mai | Tab-System implementiert | ✅ |
| 8. Mai | 10 SC-Webseiten hinzugefügt | ✅ |
| 8. Mai | README & BUILD_PLAN aktualisiert | ✅ |

---

## 🎨 Design-Spezifikationen

- **Hintergrund:** `bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900`
- **Glasmorphism:** `bg-white/10 backdrop-blur-md border-white/20 rounded-lg`
- **Active Tab:** `bg-gradient-to-r from-blue-500 to-cyan-500`
- **Icons:** Große Emojis für einfache Erkennbarkeit
- **Fonts:** 
  - Heading: Orbitron (Bold, Futuristic)
  - Body: Outfit (Modern, Clean)
- **Grid Layout:**
  - Desktop: 3 Spalten (`lg:grid-cols-3`)
  - Tablet: 2 Spalten (`md:grid-cols-2`)
  - Mobile: 1 Spalte (`grid-cols-1`)
- **Animationen:**
  - Smooth Transitions (300ms)
  - Hover Scale & Shadow Effects
  - Icon Float Animation (zukünftig)

---

## 📂 Projektstruktur

```
SC Navigator/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx          # Header mit Logo
│   │   │   ├── TabNav.jsx          # Tab-Navigation
│   │   │   └── WebsiteCard.jsx     # Website-Card Komponente
│   │   ├── data/
│   │   │   └── websites.js         # Alle SC-Websites
│   │   ├── App.jsx                 # Hauptkomponente
│   │   ├── index.css               # Tailwind + Custom Styles
│   │   └── main.jsx                # Entry Point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js          # Tailwind Konfiguration
│   ├── vite.config.js              # Vite Konfiguration
│   └── README.md
├── README.md                        # Projekt-README
└── BUILD_PLAN.md                    # Dieser Plan
```

---

## 🚀 Nächste Schritte (Optional)

1. **GitHub Pages Deployment** - Action setup
2. **Sternenkarte Feature** - 3D Map mit POIs
3. **Item-Datenbank** - Mit Search & Filter
4. **Flottenverwaltung** - Mit LocalStorage
5. **Dark/Light Mode** - Theme Toggle
6. **Performance** - Image Optimization, Code Splitting

