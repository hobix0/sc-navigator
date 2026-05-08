# 🚀 SC Navigator

Ein Community-Dashboard für Star Citizen – gebaut für Spieler, die ihre Infos nicht über 10 verschiedene Tabs verteilen wollen.

## Features

- 📡 **Live Server Status** – RSI-Serverstatus direkt im Dashboard
- 💰 **Commodity Tracker** – Live-Preise via UEX Corp API, filterbar & sortierbar
- 🚀 **Fleet Manager** – Eigene Flotte verwalten, wird zentral gespeichert (shared für alle)
- 🗺️ **Quick Links** – Alle wichtigen Tools kategorisiert auf einen Blick
- 🔄 **Data Sync** – Backend speichert Flotten-/Notizendaten für alle Freunde gemeinsam

---

## Tech Stack

| Layer     | Technologie              |
|-----------|--------------------------|
| Frontend  | React 18 + Vite          |
| Styling   | CSS Variables + Orbitron |
| Backend   | Node.js + Express        |
| Storage   | JSON (file-based)        |
| APIs      | UEX Corp v2, RSI Status  |

---

## Schnellstart

### Voraussetzungen
- Node.js >= 18
- npm >= 9

### 1. Repository klonen
```bash
git clone https://github.com/DEIN_USER/sc-navigator.git
cd sc-navigator
```

### 2. Backend starten
```bash
cd backend
npm install
npm start
# Läuft auf http://localhost:3001
```

### 3. Frontend starten
```bash
cd frontend
npm install
npm run dev
# Öffnet auf http://localhost:5173
```

---

## Deployment (für alle Freunde erreichbar)

### Option A: Lokal im Netzwerk
Backend auf einem PC im Heimnetz starten, `VITE_API_URL` in `frontend/.env` auf die lokale IP setzen:
```
VITE_API_URL=http://192.168.1.xxx:3001
```

### Option B: Render.com (kostenlos)
1. Backend deployen auf [render.com](https://render.com) als Web Service
2. Frontend deployen als Static Site (Vite Build)
3. `VITE_API_URL` auf die Render-URL setzen

### Option C: GitHub Pages (nur Frontend)
```bash
cd frontend
npm run build
# dist/ Ordner auf GitHub Pages deployen
```
Im reinen Frontend-Modus wird localStorage verwendet (keine Synchronisation).

---

## API-Quellen

- **UEX Corp API**: https://uexcorp.space/api.html — Community-betriebene SC-Wirtschaftsdaten
- **RSI Status**: https://status.robertsspaceindustries.com — Offizielle Serverstatus-Seite

---

## Projektstruktur

```
sc-navigator/
├── frontend/               # React + Vite App
│   ├── src/
│   │   ├── api/            # API-Calls (UEX Corp, RSI)
│   │   ├── components/     # React-Komponenten
│   │   ├── hooks/          # Custom Hooks
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
├── backend/                # Express API-Server
│   ├── data/               # fleet.json (auto-generiert)
│   ├── server.js
│   └── package.json
└── README.md
```

---

## Mitmachen

Pull Requests willkommen! Neue Features, Bugfixes oder weitere API-Integrationen — einfach Fork + PR.

---

*Made for the SC community. This project is not affiliated with Cloud Imperium Games.*
