# Contributing

Danke für dein Interesse! 

## Setup

```bash
git clone https://github.com/<user>/sc-navigator.git
cd sc-navigator
npm start          # oder: python3 -m http.server 8000
```

## Coding-Stil

- **Keine Build-Tools**: alles läuft direkt im Browser via Babel Standalone & Tailwind CDN.
- Komponenten in `app-bundle.jsx` (gebündelt um Babel-Race-Conditions zu vermeiden).
- Daten in `data.jsx`. Icons in `icons.jsx`.
- Glassmorphism über die Klassen `.glass` / `.glass-strong` (in `index.html`).
- Akzentfarbe: `--accent` (CSS-Variable in `index.html`).

## Branches

- `main` — stable
- `feature/<name>` — neue Features
- `fix/<name>` — Bugfixes

## Pull Requests

1. Issue erstellen oder bestehendes referenzieren
2. Branch von `main` abzweigen
3. Änderungen + kurzen Screenshot in den PR
4. Conventional Commits bevorzugt (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`)
