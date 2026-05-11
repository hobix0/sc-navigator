# scripts/process-items.py
# Quelle: Star Citizen Wiki (starcitizen.tools) — MediaWiki Cargo API
# Holt FPS-Waffen, Rüstungen, Schiffswaffen und Komponenten.
# Keine Authentifizierung nötig — Wiki ist öffentlich zugänglich.

import json
import sys
import urllib.request
import urllib.parse
from datetime import datetime, timezone

WIKI_API = "https://starcitizen.tools/api.php"

# ── API-Hilfsfunktion ─────────────────────────────────────────────────────────
def wiki_get(params, timeout=30):
    """Ruft die MediaWiki API ab und gibt das JSON-Ergebnis zurück."""
    params['format'] = 'json'
    url = WIKI_API + '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={
        'User-Agent': 'SC-Navigator/1.0 (github.com/Hobix0/SC-Navigator)',
        'Accept': 'application/json',
    })
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read().decode('utf-8'))
    except Exception as e:
        print(f"  Fehler: {e}")
        return {}

def cargo_page(table, fields, where='', limit=500, offset=0):
    """Eine Seite der Cargo-Abfrage."""
    params = {
        'action': 'cargoquery',
        'tables': table,
        'fields': fields,
        'limit': limit,
        'offset': offset,
    }
    if where:
        params['where'] = where
    data = wiki_get(params)
    return [row.get('title', {}) for row in data.get('cargoquery', [])]

def cargo_all(table, fields, where=''):
    """Holt alle Ergebnisse mit automatischer Pagination."""
    results, offset, limit = [], 0, 500
    while True:
        batch = cargo_page(table, fields, where=where, limit=limit, offset=offset)
        results.extend(batch)
        if len(batch) < limit:
            break
        offset += limit
        print(f"    ... {len(results)} geladen")
    return results

# ── Wiki erreichbar? ──────────────────────────────────────────────────────────
print("→ Prüfe SC Wiki Verbindung...")
test = wiki_get({'action': 'query', 'meta': 'siteinfo', 'siprop': 'statistics'})
if not test:
    print("  FEHLER: SC Wiki nicht erreichbar")
    sys.exit(1)
pages = test.get('query', {}).get('statistics', {}).get('articles', '?')
print(f"  Wiki erreichbar — {pages} Artikel")

# ── Cargo-Tabellen ausprobieren ───────────────────────────────────────────────
# Die SC Wiki nutzt Cargo-Templates. Wir probieren die wahrscheinlichsten Tabellen.
TABLES = [
    {
        'table':  'Items',
        'fields': '_pageName,Name,Type,Class,Size,Grade,Manufacturer',
        'label':  'Allgemeine Items',
    },
    {
        'table':  'Weapons',
        'fields': '_pageName,Name,Type,Class,Size,Grade,Manufacturer',
        'label':  'Waffen',
    },
    {
        'table':  'Armor',
        'fields': '_pageName,Name,Type,Class,Size,Grade,Manufacturer',
        'label':  'Rüstungen',
    },
    {
        'table':  'Personal_equipment',
        'fields': '_pageName,Name,Type,Class,Size,Manufacturer',
        'label':  'Persönliche Ausrüstung',
    },
    {
        'table':  'Ship_equipment',
        'fields': '_pageName,Name,Type,Class,Size,Grade,Manufacturer',
        'label':  'Schiffsausrüstung',
    },
]

all_items   = {}   # name_key → item dict
found_tables = []

for t in TABLES:
    print(f"→ Tabelle '{t['table']}'...")
    test_row = cargo_page(t['table'], t['fields'], limit=1)

    if not test_row:
        print(f"  Leer oder existiert nicht — übersprungen")
        continue

    print(f"  Vorhanden! Felder: {list(test_row[0].keys())}")
    rows = cargo_all(t['table'], t['fields'])
    found_tables.append(t['table'])

    for row in rows:
        name = (row.get('Name') or row.get('_pageName') or '').strip()
        if not name:
            continue
        key = name.lower()
        if key not in all_items:
            all_items[key] = {
                'id':           row.get('_pageName', name).replace(' ', '_'),
                'name':         name,
                'kind':         (row.get('Type') or row.get('Class') or t['label']),
                'manufacturer': (row.get('Manufacturer') or '').strip(),
                'grade':        (row.get('Grade') or '').strip(),
                'size':         (row.get('Size') or '').strip(),
                'is_illegal':   False,
                'best_buy':     None,
                'best_sell':    None,
                'profit':       0,
                'wiki_url':     f"https://starcitizen.tools/{urllib.parse.quote(name.replace(' ', '_'))}",
            }

    print(f"  {len(rows)} Einträge geladen")

# ── Fallback: Kategorie-Abfrage wenn keine Cargo-Tabellen gefunden ────────────
if not all_items:
    print("→ Kein Cargo gefunden — Fallback: Wiki-Kategorien...")

    CATEGORIES = [
        ('Personal weapons',    'FPS Waffe'),
        ('Armor',               'Rüstung'),
        ('Ship weapons',        'Schiffswaffe'),
        ('Ship components',     'Schiffskomponente'),
        ('Coolers',             'Kühler'),
        ('Power plants',        'Reaktor'),
        ('Shields',             'Schild'),
        ('Quantum drives',      'Quantum-Antrieb'),
    ]

    for cat_name, kind in CATEGORIES:
        print(f"  Kategorie: {cat_name}")
        cont = {}
        while True:
            params = {
                'action':  'query',
                'list':    'categorymembers',
                'cmtitle': f'Category:{cat_name}',
                'cmlimit': 500,
                'cmtype':  'page',
                **cont,
            }
            data   = wiki_get(params)
            members = data.get('query', {}).get('categorymembers', [])

            for m in members:
                name = m.get('title', '').strip()
                key  = name.lower()
                if name and key not in all_items:
                    all_items[key] = {
                        'id':           name.replace(' ', '_'),
                        'name':         name,
                        'kind':         kind,
                        'manufacturer': '',
                        'grade':        '',
                        'size':         '',
                        'is_illegal':   False,
                        'best_buy':     None,
                        'best_sell':    None,
                        'profit':       0,
                        'wiki_url':     f"https://starcitizen.tools/{urllib.parse.quote(name.replace(' ', '_'))}",
                    }

            cont_data = data.get('continue', {})
            if not cont_data:
                break
            cont = cont_data

        print(f"    {len([k for k in all_items if all_items[k]['kind'] == kind])} Items")

# ── Ausgabe ───────────────────────────────────────────────────────────────────
items = sorted(all_items.values(), key=lambda x: x['name'].lower())

print(f"→ Gesamt: {len(items)} Items")
if not items:
    print("  WARNUNG: Keine Items gefunden!")

output = {
    '_cached_at': datetime.now(timezone.utc).isoformat(),
    '_source':    'Star Citizen Wiki — starcitizen.tools',
    '_count':     len(items),
    'items':      items,
}

with open('data-items.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, separators=(',', ':'))

print(f"✓ {len(items)} Items → data-items.json")