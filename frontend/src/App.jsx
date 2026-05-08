// ──────────────────────────────────────────────────────────────────────────────
// App.jsx — Root-Komponente des SC Navigators
//
// Verantwortlich für:
//   - Tab-State (welcher Tab ist aktiv)
//   - Rendering von Header + aktiver Tab-Komponente
//
// Neue Tabs hinzufügen:
//   1. Komponente in /components/ erstellen
//   2. Hier importieren
//   3. Tab-ID in Header.jsx hinzufügen (comingSoon: false setzen)
//   4. Rendering-Bedingung unten hinzufügen
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import Header from './components/Header.jsx'
import QuickLinks from './components/QuickLinks.jsx'

export default function App() {
  // Aktiver Tab — Standard: Schnellzugriff
  const [activeTab, setActiveTab] = useState('quicklinks')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Sticky Navigation Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Haupt-Inhalt — rendert je nach aktivem Tab */}
      <main style={{ flex: 1 }}>
        {activeTab === 'quicklinks' && <QuickLinks />}

        {/*
          Hier kommen neue Tabs rein, z.B.:
          {activeTab === 'starmap'    && <StarMap />}
          {activeTab === 'items'      && <ItemDatabase />}
          {activeTab === 'calculator' && <Calculator />}
          {activeTab === 'fleet'      && <FleetManager />}
        */}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '1rem',
        fontSize: '11px',
        color: 'rgba(80, 110, 150, 0.4)',
        fontFamily: "'Orbitron', monospace",
        letterSpacing: '0.08em',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        SC NAVIGATOR · NOT AFFILIATED WITH CLOUD IMPERIUM GAMES
      </footer>
    </div>
  )
}
