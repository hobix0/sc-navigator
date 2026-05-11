# scripts/process-items.py
# Umgeht /item_categories (403) durch direktes Durchprobieren der IDs 1-150.
# Leere Kategorien werden übersprungen, Items dedupliziert.

import json
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone

WORKER   = "https://sc-uex-proxy.lucatheis8.workers.dev"
MAX_CAT  = 150   # Wie viele Kategorie-IDs durchprobiert werden

def fetch(path, timeout=30):
    """Ruft Worker-URL ab. Gibt data-Liste zurück, [] bei Fehler."""
    url = WORKER + path
    try:
        req = urllib.request.Request(url, headers={'Accept': 'application/json'})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = json.loads(r.read().decode())
        result = raw.get('data', raw) if isinstance(raw, dict) else raw
        return result if isinstance(result, list) else []
    except urllib.error.HTTPError as e:
        if e.code not in (400, 404):   # 400/404 = Kategorie leer/ungültig, kein Fehler
            print(f"  HTTP {e.code}: {path}")
        return []
    except Exception as e:
        print(f"  Fehler {path}: {e}")
        return []

# ── Items: alle Kategorie-IDs durchprobieren ──────────────────────────────────
print(f"→ Durchsuche Kategorie-IDs 1–{MAX_CAT}...")
all_items   = {}   # id → item
found_cats  = []   # welche IDs hatten Items

for cat_id in range(1, MAX_CAT + 1):
    items = fetch(f'/items?id_category={cat_id}')
    if items:
        found_cats.append(cat_id)
        for item in items:
            iid = item.get('id')
            if iid and iid not in all_items:
                all_items[iid] = {**item, '_cat_id': cat_id}

print(f"  Kategorien mit Items: {found_cats}")
print(f"  Gesamt Items:         {len(all_items)}")

if not all_items:
    print("FEHLER: Keine Items gefunden. Worker-URL oder API-Key prüfen.")
    sys.exit(1)

# Debug: Felder des ersten Items
first = next(iter(all_items.values()))
print(f"  Item-Felder:  {list(first.keys())}")

# ── Preise: gleiche Kategorie-IDs verwenden ───────────────────────────────────
print("→ Lade Preise...")
buy_prices  = {}
sell_prices = {}
price_debug_done = False

for cat_id in found_cats:
    prices = fetch(f'/items_prices?id_category={cat_id}')
    if not prices:
        continue

    if not price_debug_done:
        print(f"  Preis-Felder:  {list(prices[0].keys())}")
        print(f"  Preis-Beispiel: {json.dumps(prices[0])[:300]}")
        price_debug_done = True

    for p in prices:
        iid = (p.get('id_item') or p.get('item_id') or p.get('id_item_fk'))
        if not iid or iid not in all_items:
            continue
        terminal = (p.get('terminal_name') or p.get('location') or p.get('name') or '?')
        pb = float(p.get('price_buy')  or p.get('buy_price')  or 0)
        ps = float(p.get('price_sell') or p.get('sell_price') or 0)
        if pb > 0: buy_prices.setdefault(iid,  []).append({'price': pb, 'terminal': terminal})
        if ps > 0: sell_prices.setdefault(iid, []).append({'price': ps, 'terminal': terminal})

print(f"  Items mit Kaufpreis:    {len(buy_prices)}")
print(f"  Items mit Verkaufspreis: {len(sell_prices)}")

# ── Items zusammenbauen ───────────────────────────────────────────────────────
items = []
for iid, c in all_items.items():
    buys  = sorted(buy_prices.get(iid,  []), key=lambda x: x['price'])
    sells = sorted(sell_prices.get(iid, []), key=lambda x: -x['price'])
    bb = buys[0]  if buys  else None
    bs = sells[0] if sells else None
    items.append({
        'id':           iid,
        'name':         c.get('name') or '?',
        'kind':         (c.get('kind') or c.get('type') or c.get('category') or '—'),
        'manufacturer': (c.get('manufacturer') or c.get('brand') or c.get('manufacturer_name') or ''),
        'is_illegal':   bool(c.get('is_illegal', 0)),
        'best_buy':     bb,
        'best_sell':    bs,
        'profit':       round(bs['price'] - bb['price'], 2) if bb and bs else 0,
    })

items.sort(key=lambda x: x['name'].lower())
with_prices = sum(1 for i in items if i['best_buy'] or i['best_sell'])

# ── Ausgabe ───────────────────────────────────────────────────────────────────
output = {
    '_cached_at': datetime.now(timezone.utc).isoformat(),
    '_source':    'UEX Corp API v2 — Items',
    '_count':     len(items),
    'items':      items,
}
with open('data-items.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, separators=(',', ':'))

print(f"✓ {len(items)} Items, {with_prices} mit Preisen → data-items.json")
