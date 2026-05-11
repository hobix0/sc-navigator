# scripts/process-items.py
# Quelle: api.star-citizen.wiki — öffentliche REST API aus Spieldaten (kein Auth nötig)
# Docs:   https://docs.star-citizen.wiki
# Daten:  Items, FPS Waffen, Rüstungen, Schiffskomponenten, direkt aus 4.x Spieldateien

import json
import sys
import urllib.request
import urllib.parse
from datetime import datetime, timezone

API_BASE = "https://api.star-citizen.wiki/api/v2"

def fetch(path, params=None, timeout=30):
    """Ruft die star-citizen.wiki API ab und gibt data-Array zurück."""
    url = API_BASE + path
    if params:
        url += '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={
        'Accept':     'application/json',
        'User-Agent': 'SC-Navigator/1.0 (github.com/Hobix0/SC-Navigator)',
    })
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            data = json.loads(r.read().decode('utf-8'))
        return data.get('data', []) if isinstance(data, dict) else []
    except Exception as e:
        print(f"  Fehler bei {path}: {e}")
        return []

def fetch_all(path, base_params=None, per_page=100):
    """Holt alle Seiten eines paginierten Endpoints."""
    all_items = []
    page = 1
    params = dict(base_params or {})
    params['limit'] = per_page

    while True:
        params['page'] = page
        batch = fetch(path, params)
        if not batch:
            break
        all_items.extend(batch)
        print(f"    Seite {page}: {len(batch)} Items ({len(all_items)} gesamt)")
        if len(batch) < per_page:
            break
        page += 1

    return all_items

# ── Kategorien die wir holen ──────────────────────────────────────────────────
# Format: (endpoint, filter-params, Anzeige-Label)
CATEGORIES = [
    ('/items', {'filter[type]':     'WeaponPersonal'},    'FPS Waffe'),
    ('/items', {'filter[category]': 'fps-armor'},         'Rüstung'),
    ('/items', {'filter[category]': 'clothes'},           'Kleidung'),
    ('/items', {'filter[category]': 'weapon-attachments'},'Waffenaufsatz'),
    ('/items', {'filter[category]': 'medical'},           'Medizin'),
    ('/items', {'filter[type]':     'Cooler'},            'Kühler'),
    ('/items', {'filter[type]':     'PowerPlant'},        'Reaktor'),
    ('/items', {'filter[type]':     'QuantumDrive'},      'Quantum-Antrieb'),
    ('/items', {'filter[type]':     'Shield'},            'Schild'),
    ('/items', {'filter[type]':     'WeaponGun'},         'Schiffswaffe'),
    ('/items', {'filter[type]':     'Missile'},           'Rakete'),
    ('/items', {'filter[type]':     'MiningLaser'},       'Mining-Laser'),
    ('/items', {'filter[type]':     'FlightController'},  'Flugregler'),
]

# ── Items laden ───────────────────────────────────────────────────────────────
print(f"→ Lade Items von api.star-citizen.wiki...")
all_items = {}   # uuid → item

for (path, params, kind_label) in CATEGORIES:
    print(f"  [{kind_label}]")
    rows = fetch_all(path, base_params=params)

    for row in rows:
        uuid = row.get('uuid') or row.get('class_name')
        if not uuid or uuid in all_items:
            continue

        # Hersteller
        mfr = ''
        if isinstance(row.get('manufacturer'), dict):
            mfr = row['manufacturer'].get('name') or ''
        elif isinstance(row.get('manufacturer'), str):
            mfr = row['manufacturer']

        # Größe / Grade
        size  = str(row.get('size', ''))
        grade = str(row.get('grade', ''))

        all_items[uuid] = {
            'id':           uuid,
            'name':         row.get('name') or row.get('class_name') or '?',
            'class_name':   row.get('class_name', ''),
            'kind':         kind_label,
            'type':         row.get('type', ''),
            'manufacturer': mfr,
            'size':         size,
            'grade':        grade,
            'is_illegal':   False,
            'best_buy':     None,
            'best_sell':    None,
            'profit':       0,
            'wiki_url':     f"https://api.star-citizen.wiki/items/{urllib.parse.quote(row.get('class_name',''))}",
        }

    print(f"    → {len(rows)} geladen, gesamt: {len(all_items)}")

print(f"\n→ Gesamt: {len(all_items)} Items (dedupliziert)")

if not all_items:
    print("FEHLER: Keine Items gefunden — Verbindung prüfen")
    sys.exit(1)

# ── Debug: erste 3 Items ausgeben ─────────────────────────────────────────────
sample = list(all_items.values())[:3]
for s in sample:
    print(f"  Beispiel: {s['name']} ({s['kind']}) — {s['manufacturer']}")

# ── Ausgabe ───────────────────────────────────────────────────────────────────
items = sorted(all_items.values(), key=lambda x: x['name'].lower())

output = {
    '_cached_at': datetime.now(timezone.utc).isoformat(),
    '_source':    'api.star-citizen.wiki — Spieldaten 4.x',
    '_count':     len(items),
    'items':      items,
}

with open('data-items.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, separators=(',', ':'))

print(f"✓ {len(items)} Items → data-items.json")