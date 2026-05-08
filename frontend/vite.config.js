// ──────────────────────────────────────────────────────────────────────────────
// Vite Konfiguration
//
// Wichtig: VITE_BASE_URL wird vom GitHub Actions Workflow gesetzt,
// z.B. /SC-Navigator/ — lokal bleibt der Wert '/' damit alles normal läuft.
// ──────────────────────────────────────────────────────────────────────────────

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.VITE_BASE_URL || '/'

export default defineConfig({
  plugins: [react()],

  // Base-URL für alle Asset-Pfade
  base,

  // Dev-Server: Proxied /api und /proxy Anfragen ans Backend
  server: {
    port: 5173,
    proxy: {
      '/api':   { target: 'http://localhost:3001', changeOrigin: true },
      '/proxy': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
})
