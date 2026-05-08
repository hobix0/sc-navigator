import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE_URL wird automatisch vom GitHub Actions Workflow gesetzt,
// z.B. /sc-navigator/ – lokal bleibt es '/'
const base = process.env.VITE_BASE_URL || '/'

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: 5173,
    proxy: {
      // In dev mode, proxy /proxy/* calls to the backend
      '/proxy': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
