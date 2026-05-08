// ──────────────────────────────────────────────────────────────────────────────
// main.jsx — Einstiegspunkt der React-Anwendung
//
// Lädt globale Styles und mounted die App in den #root div aus index.html
// ──────────────────────────────────────────────────────────────────────────────

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
