# ◈ SC Navigator

Community-Dashboard für Star Citizen — alle wichtigen Tools auf einen Blick.

**Live:** https://hobix0.github.io/SC-Navigator/

---

## ✨ Features

### 🎨 Design
- **Glasmorphism UI** — Transparente, moderne Benutzeroberfläche
- **Dark Theme** — Dunkler Hintergrund mit Blau/Cyan Accenten
- **Responsive Layout** — Optimiert für Desktop & Mobile
- **Smooth Animations** — Hover-Effekte und sanfte Übergänge

### 📑 Tab-System
Die wichtigsten Star Citizen Ressourcen sind in 4 Kategorien organisiert:

| Tab | Inhalt |
|-----|--------|
| 🌐 **Offiziell** | Roberts Space Industries, Spectrum Forum |
| 🛠️ **Tools** | Starcitizen.tools, FleetYards, SC Cargo |
| 👥 **Community** | Wiki, Reddit, Discord |
| 📋 **Info & Status** | Server Status, Roadmap, Crowdfunding |

### 🔜 Geplante Features
- **Sternenkarte** — Interaktive 3D Star Map mit Planet-POIs
- **Item-Datenbank** — Gegenstände, Waffen, Ausrüstung mit APIs
- **Calculators** — Fracht, Routen, Blueprints, Schiffsteile
- **Flottenverwaltung** — Eigene Schiffe, Loadouts, Crew
- **Notizen-System** — Zu Locations, Items, Planeten

---

## 🚀 Lokale Entwicklung

```bash
# 1. Klonen
git clone https://github.com/Hobix0/SC-Navigator.git
cd SC-Navigator

# 2. Frontend starten
cd frontend
npm install
npm run dev
# → http://localhost:5174 (oder ähnlich)
```

---

## 🔗 Neue Website hinzufügen

In `frontend/src/data/websites.js` einfach zu einem der Kategorien-Arrays hinzufügen:

```js
{
  id: 'eindeutige-id',
  name: 'Website Name',
  url: 'https://...',
  desc: 'Kurze Beschreibung',
  icon: '🎯'  // Emoji-Icon
}
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS v3 mit Custom Glasmorphism-Komponenten
- **Fonts:** Orbitron + Outfit (Google Fonts)
- **Design Pattern:** Glasmorphism mit backdrop-blur & transparency
- **Deploy:** GitHub Actions → GitHub Pages

---

## 📝 Projektstruktur

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Header mit Logo
│   │   ├── TabNav.jsx          # Tab-Navigation
│   │   └── WebsiteCard.jsx     # Einzelne Website-Card
│   ├── data/
│   │   └── websites.js         # Alle SC-Websites
│   ├── App.jsx                 # Hauptkomponente
│   ├── index.css               # Tailwind + Custom Styles
│   └── main.jsx                # Entry Point
├── package.json
├── tailwind.config.js          # Tailwind Konfiguration
└── vite.config.js              # Vite Konfiguration
```

---

*Not affiliated with Cloud Imperium Games — Community Project*
