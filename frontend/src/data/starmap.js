// ── SC Navigator · Stanton System Data ──────────────────────────────────────
// Quellen: starcitizen.tools / uexcorp.space

export const STANTON_DATA = {
  id: 'stanton',
  name: 'Stanton',
  type: 'star',
  description: 'Das erste vollständig in privatem Besitz befindliche Sternensystem der UEE. Vier Megakonzerne kontrollieren je einen Planeten.',
  planets: [
    {
      id: 'hurston',
      name: 'Hurston',
      shortName: 'HUR',
      type: 'planet',
      color: '#8B5E14',
      glowColor: '#C4832E',
      orbitRadius: 95,
      angle: 30,
      radius: 13,
      faction: 'Hurston Dynamics',
      atmosphere: 'Toxisch',
      gravity: '1.0g',
      description: 'Schwer industrialisierter Planet, vollständig ausgebeutet von Hurston Dynamics. Die Atmosphäre ist stark verschmutzt. Lorville ist die einzige bewohnbare Stadt – düster, überwacht, aber der wichtigste Hub im inneren Stanton.',
      services: ['landing', 'trade', 'repair', 'refuel', 'medical', 'shopping', 'missions'],
      wikiUrl: 'https://starcitizen.tools/Hurston',
      buyHighlight: ['Agricium', 'Titanium', 'Laranite', 'Hephaestanite'],
      sellHighlight: ['Widow', 'Agricultural Supplies', 'Processed Food'],
      landingZones: ['Lorville (HDMS)'],
      moons: [
        { id: 'arial',    name: 'Arial',    type: 'moon', color: '#9B8B6F', orbitRadius: 45, angle: 120, radius: 6, description: 'Wüstenmond mit mehreren HDMS-Außenposten und Bergbaustationen. Bekannt für Titanium- und Laranite-Vorkommen.', services: ['landing', 'refuel', 'trade'], wikiUrl: 'https://starcitizen.tools/Arial' },
        { id: 'aberdeen', name: 'Aberdeen', type: 'moon', color: '#7A6E6E', orbitRadius: 45, angle: 215, radius: 5, description: 'Felsiger, unwirtlicher Mond mit tiefen Canyons. Wenige Außenposten, gefährliches Terrain.', services: ['landing'], wikiUrl: 'https://starcitizen.tools/Aberdeen' },
        { id: 'magda',    name: 'Magda',    type: 'moon', color: '#8F7A5A', orbitRadius: 45, angle: 295, radius: 5, description: 'Kleiner Mond mit vereinzelten Outposts. Eher für erfahrene Piloten.', services: ['landing'], wikiUrl: 'https://starcitizen.tools/Magda' },
        { id: 'ita',      name: 'Ita',      type: 'moon', color: '#6B5C4C', orbitRadius: 45, angle: 50,  radius: 4, description: 'Äußerster und unwirtlichster Mond Hurstons. Kaum erschlossen.', services: [], wikiUrl: 'https://starcitizen.tools/Ita' },
      ],
      stations: [
        { id: 'everus', name: 'Everus Harbor', type: 'station', color: '#4FC3F7', orbitRadius: 60, angle: 70, radius: 4, description: 'Hauptorbitalstation bei Hurston. Tor nach Lorville und wichtiger Handelsknoten für Industriegüter.', services: ['landing', 'trade', 'repair', 'refuel', 'medical', 'shopping'], wikiUrl: 'https://starcitizen.tools/Everus_Harbor', buyHighlight: ['Medical Supplies', 'Processed Food'], sellHighlight: ['Scrap', 'Agricultural Supplies'] },
      ],
    },
    {
      id: 'crusader',
      name: 'Crusader',
      shortName: 'CRU',
      type: 'planet',
      color: '#C4893E',
      glowColor: '#E8B060',
      orbitRadius: 155,
      angle: 148,
      radius: 20,
      faction: 'Crusader Industries',
      atmosphere: 'Gasriese (nicht landbar)',
      gravity: '— (Gasriese)',
      description: 'Mächtiger Gasriese, Heimat der schwebenden Wolkenstadt Orison. Crusader Industries ist der führende Raumschiffhersteller im System. Drei Monde und eine Orbitalstation umkreisen ihn.',
      services: ['landing', 'trade', 'repair', 'refuel', 'medical', 'shopping', 'missions'],
      wikiUrl: 'https://starcitizen.tools/Crusader',
      buyHighlight: ['Stims', 'Hydrogen Fuel', 'Distilled Spirits'],
      sellHighlight: ['Medical Supplies', 'Recycled Material Composite'],
      landingZones: ['Orison (Wolkenplattform)'],
      moons: [
        { id: 'cellin',  name: 'Cellin',  type: 'moon', color: '#BFA882', orbitRadius: 52, angle: 60,  radius: 7, description: 'Kleiner Mond mit dünner Atmosphäre, mehreren Außenposten und der Security Station Kareah. Beliebtes Gebiet für Bounty Hunting.', services: ['landing', 'trade', 'refuel'], wikiUrl: 'https://starcitizen.tools/Cellin' },
        { id: 'daymar',  name: 'Daymar',  type: 'moon', color: '#C4A96E', orbitRadius: 52, angle: 185, radius: 8, description: 'Sandiger Mond mit starken Stürmen. Bekannt für Bergbau, die Daymar Rally und versteckte Verstecke der Nine Tails.', services: ['landing', 'trade', 'refuel', 'missions'], wikiUrl: 'https://starcitizen.tools/Daymar' },
        { id: 'yela',    name: 'Yela',    type: 'moon', color: '#A8C4D4', orbitRadius: 52, angle: 305, radius: 7, description: 'Eisiger Mond mit einem Asteroidengürtel. Beliebtes Bergbaugebiet, aber auch Nine Tails Hochburg.', services: ['landing', 'refuel'], wikiUrl: 'https://starcitizen.tools/Yela' },
      ],
      stations: [
        { id: 'seraphim', name: 'Seraphim Station', type: 'station', color: '#4FC3F7', orbitRadius: 68, angle: 135, radius: 4, description: 'Hauptorbitalstation bei Crusader. Transit-Hub zwischen Orison und den Monden.', services: ['landing', 'trade', 'repair', 'refuel', 'medical'], wikiUrl: 'https://starcitizen.tools/Seraphim_Station', buyHighlight: ['Stims', 'Processed Food'], sellHighlight: ['Scrap'] },
      ],
    },
    {
      id: 'arccorp',
      name: 'ArcCorp',
      shortName: 'ARC',
      type: 'planet',
      color: '#7B6B9B',
      glowColor: '#A68FCC',
      orbitRadius: 205,
      angle: 255,
      radius: 12,
      faction: 'ArcCorp',
      atmosphere: 'Künstlich / Atembar',
      gravity: '1.0g',
      description: 'Ein vollständig urbanisierter Planet – buchstäblich eine einzige riesige Stadt. Area18 ist das pulsierende Handels- und Entertainmentzentrum, bekannt für Clubs, Shops und illegale Waren.',
      services: ['landing', 'trade', 'repair', 'refuel', 'medical', 'shopping', 'missions'],
      wikiUrl: 'https://starcitizen.tools/ArcCorp',
      buyHighlight: ['Processed Food', 'Stims', 'Neon', 'Altruciatoxin'],
      sellHighlight: ['Titanium', 'Tungsten', 'Laranite'],
      landingZones: ['Area18'],
      moons: [
        { id: 'lyria', name: 'Lyria', type: 'moon', color: '#B8C4A0', orbitRadius: 44, angle: 85,  radius: 6, description: 'Mond mit spektakulären Kristallformationen und aktiven Bergbaustationen. Atemberaubende Landschaften.', services: ['landing', 'trade', 'refuel'], wikiUrl: 'https://starcitizen.tools/Lyria' },
        { id: 'wala',  name: 'Wala',  type: 'moon', color: '#A0B4B8', orbitRadius: 44, angle: 240, radius: 5, description: 'Kleiner, rauer Mond mit Shubin Interstellar Außenposten. Solides Bergbaugebiet.', services: ['landing', 'refuel'], wikiUrl: 'https://starcitizen.tools/Wala' },
      ],
      stations: [
        { id: 'baijini', name: 'Baijini Point', type: 'station', color: '#4FC3F7', orbitRadius: 58, angle: 330, radius: 4, description: 'Orbitalstation bei ArcCorp. Wichtiger Handelsknoten für Technologiegüter und ein guter Ausgangspunkt für Area18.', services: ['landing', 'trade', 'repair', 'refuel', 'medical', 'shopping'], wikiUrl: 'https://starcitizen.tools/Baijini_Point', buyHighlight: ['Processed Food', 'Medical Supplies'], sellHighlight: ['Titanium', 'Tungsten'] },
      ],
    },
    {
      id: 'microtech',
      name: 'microTech',
      shortName: 'MIC',
      type: 'planet',
      color: '#5C9EBE',
      glowColor: '#7DB8D4',
      orbitRadius: 265,
      angle: 340,
      radius: 12,
      faction: 'microTech Inc.',
      atmosphere: 'Eisig / Atembar',
      gravity: '0.97g',
      description: 'Eisplanet im äußeren Stanton-System. New Babbage ist die modernste, technologisch fortschrittlichste Stadt in Stanton – sauber, hell und voller High-Tech-Ausrüstung. Heimat des gleichnamigen Tech-Konzerns.',
      services: ['landing', 'trade', 'repair', 'refuel', 'medical', 'shopping', 'missions'],
      wikiUrl: 'https://starcitizen.tools/MicroTech',
      buyHighlight: ['Diluthermex', 'Stims', 'Medical Supplies', 'Quantum CPU'],
      sellHighlight: ['Scrap', 'Processed Food', 'Agricultural Supplies'],
      landingZones: ['New Babbage'],
      moons: [
        { id: 'clio',     name: 'Clio',     type: 'moon', color: '#8BAFC4', orbitRadius: 46, angle: 80,  radius: 6, description: 'Eisiger Mond mit Forschungsaußenposten. Ruhige Atmosphäre – ideal für Exploration und Bergbau.', services: ['landing', 'refuel'], wikiUrl: 'https://starcitizen.tools/Clio' },
        { id: 'calliope', name: 'Calliope', type: 'moon', color: '#6A9AB0', orbitRadius: 46, angle: 200, radius: 5, description: 'Mond mit tiefen Canyons und unterirdischen Einrichtungen. Gefährliches Terrain.', services: ['landing'], wikiUrl: 'https://starcitizen.tools/Calliope' },
        { id: 'euterpe',  name: 'Euterpe',  type: 'moon', color: '#5A8498', orbitRadius: 46, angle: 315, radius: 5, description: 'Kleiner, felsiger Mond. Vereinzelte Bergbau-Außenposten am Rand des Systems.', services: ['landing', 'refuel'], wikiUrl: 'https://starcitizen.tools/Euterpe' },
      ],
      stations: [
        { id: 'porttressler', name: 'Port Tressler', type: 'station', color: '#4FC3F7', orbitRadius: 62, angle: 155, radius: 4, description: 'Tor zur Technologiehauptstadt New Babbage. Modernste Orbitalstation im System mit Top-Ausrüstung.', services: ['landing', 'trade', 'repair', 'refuel', 'medical', 'shopping'], wikiUrl: 'https://starcitizen.tools/Port_Tressler', buyHighlight: ['Medical Supplies', 'Diluthermex'], sellHighlight: ['Scrap', 'Agricultural Supplies'] },
      ],
    },
  ],
  jumpPoints: [
    { id: 'jp_pyro',   name: 'Sprungpunkt Pyro',   angle: 195, orbitRadius: 305, type: 'jumppoint', description: 'Sprungpunkt zum Pyro-System. Hochrisikogebiet, dominiert von Outlaw-Fraktionen. Seit Patch 4.0 erreichbar.', wikiUrl: 'https://starcitizen.tools/Pyro' },
    { id: 'jp_magnus', name: 'Sprungpunkt Magnus',  angle: 78,  orbitRadius: 305, type: 'jumppoint', description: 'Sprungpunkt zum Magnus-System. Aktuell noch nicht im Spiel verfügbar – in Entwicklung.', wikiUrl: 'https://starcitizen.tools/Magnus' },
  ],
}

export function flattenLocations(data) {
  const results = []
  data.planets.forEach(p => {
    results.push({ ...p, systemPath: p.name })
    p.moons?.forEach(m =>    results.push({ ...m, parentPlanet: p.id, systemPath: `${p.name} › ${m.name}` }))
    p.stations?.forEach(s => results.push({ ...s, parentPlanet: p.id, systemPath: `${p.name} › ${s.name}` }))
  })
  data.jumpPoints?.forEach(jp => results.push({ ...jp, systemPath: jp.name }))
  return results
}
