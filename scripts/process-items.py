# scripts/process-items.py
# Liest die rohen UEX Corp API Antworten und schreibt data-items.json
# Wird vom GitHub Action update-items.yml aufgerufen

import json
import sys
from datetime import datetime, timezone

# ── Daten laden ───────────────────────────────────────────────────────────────
try:
    with open('/tmp/commodities.json') as f:
        raw = json.load(f)
except Exception as e:
    print(f"Fehler beim Laden von commodities.json: {e}", file=sys.stderr)
    sys.exit(1)

try:
    with open('/tmp/prices.json') as f:
        raw_prices = json.load(f)
except Exception:
    raw_prices = []

# UEX Corp v2 liefert entweder {"data": [...]} oder direkt [...]
commodities = raw.get('data', raw)        if isinstance(raw, dict)        else raw
prices      = raw_prices.get('data', raw_prices) if isinstance(raw_prices, dict) else raw_prices

if not isinstance(commodities, list): commodities = []
if not isinstance(prices, list):      prices = []

print(f"  Commodities: {len(commodities)}")
print(f"  Preiseinträge: {len(prices)}")

# ── Preise gruppieren: id → beste Kauf- / Verkaufspreise ─────────────────────
buy_prices  = {}   # { commodity_id: [{price, terminal}] }
sell_prices = {}

for p in prices:
    cid      = p.get('id_commodity')
    if not cid:
        continue
    terminal = p.get('terminal_name') or p.get('star_system_name') or '?'
    pb       = float(p.get('price_buy',  0) or 0)
    ps       = float(p.get('price_sell', 0) or 0)

    if pb > 0:
        buy_prices.setdefault(cid,  []).append({'price': pb, 'terminal': terminal})
    if ps > 0:
        sell_prices.setdefault(cid, []).append({'price': ps, 'terminal': terminal})

# ── Für jede Commodity besten Kauf und Verkauf ermitteln ─────────────────────
items = []
for c in commodities:
    cid   = c.get('id')
    name  = c.get('name') or c.get('code') or '?'
    code  = c.get('code', '')
    kind  = c.get('kind') or c.get('type') or '—'

    buys  = sorted(buy_prices.get(cid,  []), key=lambda x: x['price'])    # günstigster zuerst
    sells = sorted(sell_prices.get(cid, []), key=lambda x: -x['price'])   # teuerster zuerst

    best_buy  = buys[0]  if buys  else None
    best_sell = sells[0] if sells else None
    profit    = round(best_sell['price'] - best_buy['price'], 2) if best_buy and best_sell else 0

    items.append({
        'id':         cid,
        'name':       name,
        'code':       code,
        'kind':       kind,
        'is_illegal': bool(c.get('is_illegal', 0)),
        'best_buy':   best_buy,
        'best_sell':  best_sell,
        'profit':     profit,
    })

items.sort(key=lambda x: x['name'].lower())

# ── Ausgabe schreiben ─────────────────────────────────────────────────────────
output = {
    '_cached_at': datetime.now(timezone.utc).isoformat(),
    '_source':    'UEX Corp API v2 — https://uexcorp.space',
    '_count':     len(items),
    'items':      items,
}

with open('data-items.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, separators=(',', ':'))

print(f"  ✓ {len(items)} Items geschrieben → data-items.json")
