import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// ── Data file setup ─────────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data')
const FLEET_FILE = path.join(DATA_DIR, 'fleet.json')
const NOTES_FILE = path.join(DATA_DIR, 'notes.json')

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
if (!fs.existsSync(FLEET_FILE))  fs.writeFileSync(FLEET_FILE,  JSON.stringify({ ships: [] }, null, 2))
if (!fs.existsSync(NOTES_FILE))  fs.writeFileSync(NOTES_FILE,  JSON.stringify({ notes: [] }, null, 2))

const readJSON  = (file)        => JSON.parse(fs.readFileSync(file, 'utf-8'))
const writeJSON = (file, data)  => fs.writeFileSync(file, JSON.stringify(data, null, 2))

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors())
app.use(express.json())

// ── Proxy: UEX Corp API ──────────────────────────────────────────────────────
// Solves browser CORS restrictions for the UEX Corp data API
app.get('/proxy/uex/*', async (req, res) => {
  const endpoint = req.params[0]
  const query    = new URLSearchParams(req.query).toString()
  const url      = `https://api.uexcorp.space/2.0/${endpoint}${query ? '?' + query : ''}`
  try {
    const { default: fetch } = await import('node-fetch')
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!response.ok) return res.status(response.status).json({ error: 'UEX API error', status: response.status })
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', message: err.message })
  }
})

// ── Proxy: RSI Server Status ─────────────────────────────────────────────────
app.get('/proxy/rsi-status', async (req, res) => {
  try {
    const { default: fetch } = await import('node-fetch')
    const response = await fetch('https://status.robertsspaceindustries.com/api/v2/summary.json')
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'RSI Status error', message: err.message })
  }
})

// ── Fleet API ────────────────────────────────────────────────────────────────

// GET  /api/fleet            → alle Schiffe
app.get('/api/fleet', (_req, res) => {
  res.json(readJSON(FLEET_FILE))
})

// POST /api/fleet/ships      → Schiff hinzufügen
app.post('/api/fleet/ships', (req, res) => {
  const { name, manufacturer, role, owner, notes } = req.body
  if (!name) return res.status(400).json({ error: 'Ship name required' })
  const data = readJSON(FLEET_FILE)
  const ship = { id: Date.now(), name, manufacturer: manufacturer || '', role: role || 'Multi-role', owner: owner || 'Unknown', notes: notes || '', addedAt: new Date().toISOString() }
  data.ships.push(ship)
  writeJSON(FLEET_FILE, data)
  res.status(201).json(ship)
})

// PUT  /api/fleet/ships/:id  → Schiff aktualisieren
app.put('/api/fleet/ships/:id', (req, res) => {
  const data = readJSON(FLEET_FILE)
  const idx = data.ships.findIndex(s => s.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Ship not found' })
  data.ships[idx] = { ...data.ships[idx], ...req.body }
  writeJSON(FLEET_FILE, data)
  res.json(data.ships[idx])
})

// DELETE /api/fleet/ships/:id → Schiff entfernen
app.delete('/api/fleet/ships/:id', (req, res) => {
  const data = readJSON(FLEET_FILE)
  data.ships = data.ships.filter(s => s.id !== parseInt(req.params.id))
  writeJSON(FLEET_FILE, data)
  res.json({ success: true })
})

// ── Notes API ────────────────────────────────────────────────────────────────

app.get('/api/notes', (_req, res) => {
  res.json(readJSON(NOTES_FILE))
})

app.post('/api/notes', (req, res) => {
  const { text, author } = req.body
  if (!text) return res.status(400).json({ error: 'Note text required' })
  const data = readJSON(NOTES_FILE)
  const note = { id: Date.now(), text, author: author || 'Anonymous', createdAt: new Date().toISOString() }
  data.notes.push(note)
  writeJSON(NOTES_FILE, data)
  res.status(201).json(note)
})

app.delete('/api/notes/:id', (req, res) => {
  const data = readJSON(NOTES_FILE)
  data.notes = data.notes.filter(n => n.id !== parseInt(req.params.id))
  writeJSON(NOTES_FILE, data)
  res.json({ success: true })
})

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() })
})

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 SC Navigator Backend`)
  console.log(`   Running on: http://localhost:${PORT}`)
  console.log(`   Fleet data: ${FLEET_FILE}`)
  console.log(`   Press Ctrl+C to stop\n`)
})
