// ── SC Navigator · API Layer ─────────────────────────────────────────────────
// Tries backend proxy first, falls back to direct API call (may fail due to CORS)

const BACKEND = import.meta.env.VITE_API_URL || ''

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── RSI Server Status ─────────────────────────────────────────────────────────
export async function fetchRSIStatus() {
  try {
    return await fetchJSON(`${BACKEND}/proxy/rsi-status`)
  } catch {
    // Fallback: direct (may be blocked by CORS)
    return fetchJSON('https://status.robertsspaceindustries.com/api/v2/summary.json')
  }
}

// ── UEX Corp: Commodity list ──────────────────────────────────────────────────
export async function fetchCommodities() {
  try {
    const data = await fetchJSON(`${BACKEND}/proxy/uex/commodities`)
    return data?.data ?? data ?? []
  } catch {
    return fetchJSON('https://api.uexcorp.space/2.0/commodities')
      .then(d => d?.data ?? d ?? [])
  }
}

// ── UEX Corp: All current prices ──────────────────────────────────────────────
export async function fetchCommodityPrices() {
  try {
    const data = await fetchJSON(`${BACKEND}/proxy/uex/commodities_prices`)
    return data?.data ?? data ?? []
  } catch {
    return fetchJSON('https://api.uexcorp.space/2.0/commodities_prices')
      .then(d => d?.data ?? d ?? [])
  }
}

// ── Fleet (backend storage) ───────────────────────────────────────────────────
export async function fetchFleet() {
  return fetchJSON(`${BACKEND}/api/fleet`)
}

export async function addShip(shipData) {
  const res = await fetch(`${BACKEND}/api/fleet/ships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shipData),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function updateShip(id, shipData) {
  const res = await fetch(`${BACKEND}/api/fleet/ships/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shipData),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function deleteShip(id) {
  const res = await fetch(`${BACKEND}/api/fleet/ships/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── Notes ─────────────────────────────────────────────────────────────────────
export async function fetchNotes() {
  return fetchJSON(`${BACKEND}/api/notes`)
}

export async function addNote(noteData) {
  const res = await fetch(`${BACKEND}/api/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noteData),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function deleteNote(id) {
  const res = await fetch(`${BACKEND}/api/notes/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
