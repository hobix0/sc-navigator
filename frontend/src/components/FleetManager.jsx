import { useState, useEffect, useCallback } from 'react'
import { fetchFleet, addShip, deleteShip, updateShip, fetchNotes, addNote, deleteNote } from '../api/index.js'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

const ROLES = ['Multi-role', 'Fighter', 'Bomber', 'Cargo', 'Mining', 'Exploration', 'Salvage', 'Medical', 'Racing', 'Starter']
const MANUFACTURERS = ['Aegis', 'Anvil', 'CNOU', 'Crusader', 'Drake', 'Esperia', 'Gatac', 'Greycat', 'Mirai', 'MISC', 'Origin', 'Roberts', 'RSI', 'Tumbril', 'Vanduul', 'Other']

const EMPTY_FORM = { name: '', manufacturer: '', role: 'Multi-role', owner: '', notes: '' }

export default function FleetManager() {
  const [ships, setShips]             = useState([])
  const [notes, setNotes]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [backendOk, setBackendOk]     = useState(false)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [noteText, setNoteText]       = useState('')
  const [noteAuthor, setNoteAuthor]   = useLocalStorage('sc-author', '')
  const [showForm, setShowForm]       = useState(false)
  const [saving, setSaving]           = useState(false)
  const [localShips, setLocalShips]   = useLocalStorage('sc-fleet', [])
  const [localNotes, setLocalNotes]   = useLocalStorage('sc-notes', [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [f, n] = await Promise.all([fetchFleet(), fetchNotes()])
      setShips(f.ships ?? [])
      setNotes(n.notes ?? [])
      setBackendOk(true)
    } catch {
      // Backend not reachable – use localStorage
      setShips(localShips)
      setNotes(localNotes)
      setBackendOk(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAddShip(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (backendOk) {
        const ship = await addShip(form)
        setShips(s => [...s, ship])
      } else {
        const ship = { id: Date.now(), ...form, addedAt: new Date().toISOString() }
        const updated = [...localShips, ship]
        setLocalShips(updated)
        setShips(updated)
      }
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch (err) {
      alert('Fehler beim Speichern: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteShip(id) {
    if (!confirm('Schiff wirklich entfernen?')) return
    try {
      if (backendOk) await deleteShip(id)
      else setLocalShips(prev => prev.filter(s => s.id !== id))
      setShips(s => s.filter(s => s.id !== id))
    } catch (err) {
      alert('Fehler: ' + err.message)
    }
  }

  async function handleAddNote(e) {
    e.preventDefault()
    if (!noteText.trim()) return
    try {
      if (backendOk) {
        const note = await addNote({ text: noteText, author: noteAuthor || 'Anonymous' })
        setNotes(n => [note, ...n])
      } else {
        const note = { id: Date.now(), text: noteText, author: noteAuthor || 'Anonymous', createdAt: new Date().toISOString() }
        const updated = [note, ...localNotes]
        setLocalNotes(updated)
        setNotes(updated)
      }
      setNoteText('')
    } catch (err) {
      alert('Fehler: ' + err.message)
    }
  }

  async function handleDeleteNote(id) {
    try {
      if (backendOk) await deleteNote(id)
      else setLocalNotes(prev => prev.filter(n => n.id !== id))
      setNotes(n => n.filter(n => n.id !== id))
    } catch {}
  }

  const Field = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</label>
      {children}
    </div>
  )

  return (
    <div className="page-content">
      {/* Backend status banner */}
      {!loading && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 14px', borderRadius: 'var(--radius-sm)',
          background: backendOk ? 'var(--green-bg)' : 'var(--amber-bg)',
          border: `1px solid ${backendOk ? 'rgba(77,208,138,.2)' : 'rgba(240,160,48,.2)'}`,
          marginBottom: '1rem', fontSize: '12px',
          color: backendOk ? 'var(--green)' : 'var(--amber)',
        }}>
          <span>{backendOk ? '🟢' : '🟡'}</span>
          {backendOk
            ? 'Backend verbunden – Daten werden für alle synchronisiert'
            : 'Backend nicht erreichbar – Lokaler Modus (nur auf diesem Gerät)'}
        </div>
      )}

      <div className="grid-2" style={{ gap: '1rem', alignItems: 'start' }}>

        {/* Fleet */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 500 }}>
              Flotte ({ships.length})
            </h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}>
              {showForm ? '✕ Abbrechen' : '+ Schiff hinzufügen'}
            </button>
          </div>

          {/* Add ship form */}
          {showForm && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <form onSubmit={handleAddShip} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="grid-2" style={{ gap: '10px' }}>
                  <Field label="Schiffname *">
                    <input className="input" placeholder="z.B. Crusader Intrepid" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
                  </Field>
                  <Field label="Hersteller">
                    <select className="select" value={form.manufacturer} onChange={e => setForm(f => ({...f, manufacturer: e.target.value}))}>
                      <option value="">— Auswählen —</option>
                      {MANUFACTURERS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </Field>
                  <Field label="Rolle">
                    <select className="select" value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
                      {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </Field>
                  <Field label="Besitzer / Pilot">
                    <input className="input" placeholder="Dein SC-Name" value={form.owner} onChange={e => setForm(f => ({...f, owner: e.target.value}))} />
                  </Field>
                </div>
                <Field label="Notizen">
                  <textarea className="textarea" placeholder="Loadout, Einsatzgebiet..." value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} />
                </Field>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Speichert...' : 'Hinzufügen'}</button>
                </div>
              </form>
            </div>
          )}

          {/* Ship list */}
          {loading && <div className="state-box">⏳ Lade Flotte...</div>}
          {!loading && ships.length === 0 && (
            <div className="card state-box" style={{ flexDirection: 'column' }}>
              <span>🚀</span>
              <span style={{ color: 'var(--text-muted)' }}>Noch keine Schiffe eingetragen</span>
            </div>
          )}
          {ships.map(ship => (
            <div key={ship.id} className="card" style={{ marginBottom: '.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '3px' }}>
                    {ship.manufacturer && <span style={{ color: 'var(--text-muted)', marginRight: '6px', fontSize: '13px' }}>{ship.manufacturer}</span>}
                    {ship.name}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {ship.role && <span className="badge badge-blue">{ship.role}</span>}
                    {ship.owner && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>👤 {ship.owner}</span>}
                  </div>
                  {ship.notes && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>{ship.notes}</div>}
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteShip(ship.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div>
          <div style={{ marginBottom: '.75rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 500 }}>
              Gruppen-Notizen
            </h2>
          </div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                className="input"
                placeholder="Dein Name / Call Sign"
                value={noteAuthor}
                onChange={e => setNoteAuthor(e.target.value)}
              />
              <textarea
                className="textarea"
                placeholder="Notiz, Treffpunkt, Missionsziel..."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                style={{ minHeight: '72px' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={!noteText.trim()}>
                + Notiz posten
              </button>
            </form>
          </div>

          {notes.length === 0 && (
            <div className="card state-box"><span style={{ color: 'var(--text-muted)' }}>Noch keine Notizen</span></div>
          )}
          {notes.map(note => (
            <div key={note.id} className="card" style={{ marginBottom: '.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--accent)' }}>{note.author}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{new Date(note.createdAt).toLocaleString('de-DE')}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{note.text}</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteNote(note.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
