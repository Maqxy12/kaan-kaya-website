// Erzeugt die Schweiz-Karte (SVG-Pfad) einmalig aus Natural-Earth-Daten.
// Aufruf: node scripts/generate-map.mjs  → schreibt src/data/switzerland.json
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoMercator, geoPath } from 'd3-geo';

const topo = JSON.parse(readFileSync('node_modules/world-atlas/countries-10m.json', 'utf8'));
const ch = feature(topo, topo.objects.countries).features.find((f) => f.id === '756');
const width = 640;
const height = 420;
const projection = geoMercator().fitExtent([[16, 16], [width - 16, height - 16]], ch);
const path = geoPath(projection).digits(1);
const places = {
  zug: [8.5155, 47.1662],
  zurich: [8.5417, 47.3769],
  rotkreuz: [8.4314, 47.1419],
};
const points = Object.fromEntries(
  Object.entries(places).map(([k, c]) => [k, projection(c).map((n) => Math.round(n * 10) / 10)]),
);
writeFileSync(
  'src/data/switzerland.json',
  JSON.stringify({ width, height, d: path(ch), points }, null, 0),
);
console.log('ok', points, path(ch).length);
