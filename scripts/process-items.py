# scripts/process-items.py
# UEX Corp Items-Datenbank:
#   1. Alle Kategorien laden (/item_categories)
#   2. Pro Kategorie alle Items laden (/items?id_category=X)
#   3. Preise laden (/items_prices?id_category=X)
#   4. Alles in data-items.json schreiben

import json
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone

WORKER = "https://sc-uex-proxy.lucatheis8.workers.dev"

# ── Hilfsfunktion: URL abrufen ────────────────────────────────────────────────
def fetch(path, timeout=30):
    """Ruft Worker-URL ab, gibt data-Array zurück oder leere Liste bei Fehler."""
    url = WORKER + path
    try:
        req = urllib.request.Request(url, headers={'Accept': 'application/json'})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = json.loads(r.read().decode())
        # UEX Corp: {"status":200,"data":[...]} oder direkt [...]
        result = raw.get('data', raw) if isinstance(raw, dict) else raw
        return result if isinstance(result, list) else []
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:200]
        print(f"  HTTP {e.code} bei {path}: {body}")
        return []
    except Exception as e:
        print(f"  Fehler bei {path}: {e}")
        return []

# ── 1. Kategorien laden ───────────────────────────────────────────────────────
print("→ Lade Item-Kategorien...")
categories = fetch('/item_categories')

if not categories:
    print("  FEHLER: Keine Kategorien gefunden — Abbruch")
    sys.exit(1)

print(f"  {len(categories)} Kategorien")
if categories:
    print(f"  Felder: {list(categories[0].keys())}")
    print(f"  Beispiel: {json.dumps(categories[0])}")

# ── 2. Items pro Kategorie laden ──────────────────────────────────────────────
print("→ Lade Items pro Kategorie...")
all_items = {}     # id → item (dedupliziert)
all_prices = {}    # item_id → {buy: [], sell: []}

for cat in categories:
    cat_id   = cat.get('id')
    cat_name = cat.get('name') or cat.get('title') or str(cat_id)
    if not cat_id:
        continue

    items = fetch(f'/items?id_category={cat_id}')
    if items:
        for item in items:
            iid = item.get('id')
            if iid and iid not in all_items:
                all_items[iid] = {**item, '_category': cat_name}
        print(f"  [{cat_id}] {cat_name}: {len(items)} Items")

print(f"→ Gesamt Items (dedupliziert): {len(all_items)}")

# ── 3. Preise pro Kategorie laden ─────────────────────────────────────────────
print("→ Lade Preise pro Kategorie...")
total_prices = 0

for cat in categories:
    cat_id = cat.get('id')
    if not cat_id:
        continue

    prices = fetch(f'/items_prices?id_category={cat_id}')
    if not prices:
        continue

    # Debug: Felder des ersten Preiseintrags (nur beim allerersten Mal)
    if total_prices == 0 and prices:
        print(f"  Preis-Felder: {list(prices[0].keys())}")
        print(f"  Preis-Beispiel: {json.dumps(prices[0])[:300]}")

    for p in prices:
        # Item-ID im Preiseintrag — verschiedene mögliche Feldnamen
        iid = (p.get('id_item') or p.get('item_id')
            or p.get('id_item_fk') or p.get('id'))
        if not iid or iid not in all_items:
            continue

        terminal = (p.get('terminal_name') or p.get('location')
                 or p.get('name') or '?')
        pb = float(p.get('price_buy')  or p.get('buy_price')  or 0)
        ps = float(p.get('price_sell') or p.get('sell_price') or 0)

        if iid not in all_prices:
            all_prices[iid] = {'buy': [], 'sell': []}
        if pb > 0:
            all_prices[iid]['buy'].append({'price': pb, 'terminal': terminal})
        if ps > 0:
            all_prices[iid]['sell'].append({'price': ps, 'terminal': terminal})
        total_prices += 1

print(f"  {total_prices} Preiseinträge verarbeitet")
print(f"  {len(all_prices)} Items haben Preisdaten")

# ── 4. Items zusammenbauen ────────────────────────────────────────────────────
items = []
for iid, c in all_items.items():
    price_data = all_prices.get(iid, {'buy': [], 'sell': []})
    buys  = sorted(price_data['buy'],  key=lambda x: x['price'])
    sells = sorted(price_data['sell'], key=lambda x: -x['price'])
    bb = buys[0]  if buys  else None
    bs = sells[0] if sells else None

    items.append({
        'id':           iid,
        'name':         c.get('name') or '?',
        'kind':         (c.get('_category') or c.get('kind')
                      or c.get('type') or '—'),
        'manufacturer': (c.get('manufacturer') or c.get('brand')
                      or c.get('manufacturer_name') or ''),
        'is_illegal':   bool(c.get('is_illegal', 0)),
        'best_buy':     bb,
        'best_sell':    bs,
        'profit':       round(bs['price'] - bb['price'], 2) if bb and bs else 0,
    })

items.sort(key=lambda x: x['name'].lower())
with_prices = sum(1 for i in items if i['best_buy'] or i['best_sell'])

# ── 5. Ausgabe ────────────────────────────────────────────────────────────────
output = {
    '_cached_at': datetime.now(timezone.utc).isoformat(),
    '_source':    'UEX Corp API v2 — Items',
    '_count':     len(items),
    'items':      items,
}

with open('data-items.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, separators=(',', ':'))

print(f"✓ {len(items)} Items total, {with_prices} mit Preisen → data-items.json")
