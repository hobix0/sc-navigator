# scripts/process-items.py
# Verarbeitet UEX Corp /items + /items_prices
# Waffen, Rüstungen, Schiffskomponenten — keine Handelswaren

import json
import sys
from datetime import datetime, timezone

# ── Daten laden ───────────────────────────────────────────────────────────────
try:
    with open('/tmp/items.json') as f:
        raw = json.load(f)
except Exception as e:
    print(f"Fehler items.json: {e}", file=sys.stderr); sys.exit(1)

try:
    with open('/tmp/items_prices.json') as f:
        raw_prices = json.load(f)
except Exception:
    raw_prices = []

items_raw  = raw.get('data', raw)               if isinstance(raw, dict)        else raw
prices_raw = raw_prices.get('data', raw_prices) if isinstance(raw_prices, dict) else raw_prices

if not isinstance(items_raw, list):  items_raw  = []
if not isinstance(prices_raw, list): prices_raw = []

print(f"  Items geladen:        {len(items_raw)}")
print(f"  Preiseinträge:        {len(prices_raw)}")

# ── Debug: Feldnamen ausgeben ─────────────────────────────────────────────────
if items_raw:
    print(f"  Item-Felder:          {list(items_raw[0].keys())}")
if prices_raw:
    print(f"  Preis-Felder:         {list(prices_raw[0].keys())}")
    print(f"  Preis-Beispiel:       {json.dumps(prices_raw[0])[:300]}")

# ── Preise gruppieren ─────────────────────────────────────────────────────────
# Mögliche Feldnamen für Item-ID in Preisdaten
buy_prices  = {}
sell_prices = {}

for p in prices_raw:
    # Item-ID: verschiedene mögliche Felder
    iid = (p.get('id_item')
        or p.get('item_id')
        or p.get('id_item_fk')
        or p.get('id'))
    if not iid:
        continue

    terminal = (p.get('terminal_name') or p.get('location') or p.get('name') or '?')
    pb = float(p.get('price_buy')  or p.get('buy_price')  or p.get('buy')  or 0)
    ps = float(p.get('price_sell') or p.get('sell_price') or p.get('sell') or 0)

    if pb > 0: buy_prices.setdefault(iid,  []).append({'price': pb, 'terminal': terminal})
    if ps > 0: sell_prices.setdefault(iid, []).append({'price': ps, 'terminal': terminal})

print(f"  Items mit Kaufpreis:   {len(buy_prices)}")
print(f"  Items mit Verkaufspreis: {len(sell_prices)}")

# ── Items zusammenbauen ───────────────────────────────────────────────────────
items = []
for c in items_raw:
    iid  = c.get('id')
    name = c.get('name') or '?'

    # Kategorie: verschiedene mögliche Felder
    kind = (c.get('kind') or c.get('type') or c.get('category')
         or c.get('item_type') or c.get('sub_category') or '—')

    # Hersteller
    manufacturer = (c.get('manufacturer') or c.get('brand')
                 or c.get('manufacturer_name') or c.get('mfr') or '')

    buys  = sorted(buy_prices.get(iid,  []), key=lambda x: x['price'])
    sells = sorted(sell_prices.get(iid, []), key=lambda x: -x['price'])
    bb = buys[0]  if buys  else None
    bs = sells[0] if sells else None

    items.append({
        'id':           iid,
        'name':         name,
        'kind':         kind,
        'manufacturer': manufacturer,
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

print(f"  OK: {len(items)} Items, {with_prices} mit Preisen → data-items.json")
