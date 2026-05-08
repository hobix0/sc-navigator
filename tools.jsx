// Tool Grid — search, filter by category, sort, favorites (localStorage).

const { useState: useStateT, useEffect: useEffectT, useMemo: useMemoT } = React;

function ToolCard({ tool, isFav, onFav }) {
  const I = window.Icon[tool.icon] || window.Icon.Tools;
  return (
    <a href={tool.url} target="_blank" rel="noopener noreferrer"
       className="tool-card hud-corners glass rounded-lg p-4 block group relative">
      <span className="hud-c1"></span><span className="hud-c2"></span>

      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-md flex items-center justify-center border border-white/10"
             style={{ background: `linear-gradient(135deg, ${tool.color}22, ${tool.color}10)`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 24px ${tool.color}22` }}>
          <I className="w-5 h-5" style={{ color: tool.color }} />
        </div>
        <button onClick={(e) => { e.preventDefault(); onFav(tool.id); }}
          className="p-1.5 -m-1.5 text-white/30 hover:text-warn transition"
          aria-label="Favorit">
          {isFav ? <Icon.StarFill className="w-4 h-4 text-warn" /> : <Icon.Star className="w-4 h-4" />}
        </button>
      </div>

      <div className="font-display text-[14px] tracking-wide font-semibold mb-1">{tool.name}</div>
      <p className="text-[12px] text-white/55 leading-snug mb-3 line-clamp-2 min-h-[2.5em]">{tool.desc}</p>

      <div className="flex items-center justify-between">
        <span className="chip" style={{ background: `${tool.color}1a`, borderColor: `${tool.color}40`, color: tool.color }}>{tool.tag}</span>
        <span className="flex items-center gap-1 text-[11px] text-white/40 group-hover:text-rsi-300 transition">
          öffnen <Icon.External className="w-3 h-3" />
        </span>
      </div>

      {/* hover scanline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rsi-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </a>
  );
}

function ToolGrid() {
  const { TOOLS, TOOL_CATS } = window.SCData;

  const [q, setQ] = useStateT('');
  const [cat, setCat] = useStateT('Alle');
  const [sort, setSort] = useStateT('popular');
  const [favOnly, setFavOnly] = useStateT(false);
  const [favs, setFavs] = useStateT(() => {
    try { return new Set(JSON.parse(localStorage.getItem('sc-nav.favs') || '[]')); } catch (e) { return new Set(); }
  });

  useEffectT(() => {
    localStorage.setItem('sc-nav.favs', JSON.stringify([...favs]));
  }, [favs]);

  function toggleFav(id) {
    setFavs(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const filtered = useMemoT(() => {
    let list = TOOLS;
    if (cat !== 'Alle') list = list.filter(t => t.cat === cat);
    if (favOnly) list = list.filter(t => favs.has(t.id));
    if (q.trim()) {
      const ql = q.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(ql) ||
        t.desc.toLowerCase().includes(ql) ||
        t.tag.toLowerCase().includes(ql) ||
        t.cat.toLowerCase().includes(ql));
    }
    if (sort === 'popular') list = [...list].sort((a, b) => b.popularity - a.popularity);
    else if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'cat')  list = [...list].sort((a, b) => a.cat.localeCompare(b.cat) || a.name.localeCompare(b.name));
    return list;
  }, [q, cat, sort, favOnly, favs]);

  return (
    <Panel title="Tool-Verzeichnis" kicker={`${filtered.length} / ${TOOLS.length}`}
      right={
        <div className="flex items-center gap-2">
          <button onClick={() => setFavOnly(v => !v)}
            className={`btn !py-1.5 !px-2.5 !text-[10px] ${favOnly ? '!bg-warn/20 !border-warn !text-warn' : ''}`}>
            <Icon.Star className="w-3 h-3" /> Favoriten ({favs.size})
          </button>
        </div>
      }
      strong
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Icon.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Tools durchsuchen…"
            className="field w-full pl-9"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Icon.Sort className="w-3.5 h-3.5 text-white/40" />
          <select value={sort} onChange={e => setSort(e.target.value)} className="field !py-1.5 !pr-8 !text-[12px]">
            <option value="popular">Beliebt</option>
            <option value="name">Name (A–Z)</option>
            <option value="cat">Kategorie</option>
          </select>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {TOOL_CATS.map(c => {
          const count = c === 'Alle' ? TOOLS.length : TOOLS.filter(t => t.cat === c).length;
          const active = cat === c;
          return (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium tracking-wide border transition flex items-center gap-1.5
                ${active ? 'bg-rsi-400/15 border-rsi-400 text-white' : 'bg-white/[0.02] border-white/[0.08] text-white/60 hover:text-white hover:border-white/20'}`}>
              {c} <span className="font-mono text-[10px] opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-white/40 text-[12px]">
          <Icon.Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
          Keine Tools gefunden. Filter zurücksetzen?
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
          {filtered.map(t => <ToolCard key={t.id} tool={t} isFav={favs.has(t.id)} onFav={toggleFav} />)}
        </div>
      )}
    </Panel>
  );
}

window.ToolGrid = ToolGrid;
