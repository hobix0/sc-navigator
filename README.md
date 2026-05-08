# ◈ SC Navigator

Community-Dashboard für Star Citizen — alle wichtigen Tools auf einen Blick.

**Live:** https://hobix0.github.io/SC-Navigator/

---

## Roadmap

| Status | Feature |
|--------|---------|
| ✅ | **Quick Links** — Alle wichtigen SC-Tools kategorisiert |
| 🔜 | **Sternenkarte** — Interaktive 3D Star Map mit Planet-POIs |
| 🔜 | **Item-Datenbank** — Gegenstände, Waffen, Ausrüstung mit APIs |
| 🔜 | **Calculators** — Fracht, Routen, Blueprints, Schiffsteile |
| 🔜 | **Flottenverwaltung** — Eigene Schiffe, Loadouts, Crew |
| 🔜 | **Notizen-System** — Zu Locations, Items, Planeten |

---

## Lokale Entwicklung

```bash
# 1. Klonen
git clone https://github.com/Hobix0/SC-Navigator.git
cd SC-Navigator

# 2. Frontend starten
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Neuen Link hinzufügen

In `frontend/src/data/links.js` einfach ein neues Objekt eintragen:

```js
{
  id: 'mein-link',
  name: 'Tool Name',
  url: 'https://...',
  desc: 'Kurze Beschreibung',
  badge: 'new',  // optional: 'top' | 'new' | 'live' | 'p2p' | 'fun' | 'ref'
}
```

---

## Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Pure CSS mit Glassmorphismus-Design
- **Fonts:** Orbitron + Outfit (Google Fonts)
- **Deploy:** GitHub Actions → GitHub Pages

---

*Not affiliated with Cloud Imperium Games.*
