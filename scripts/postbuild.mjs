// Qualitätsprüfung nach jedem Build: Findet kaputte interne Links und fehlende Dateien.
// Schlägt die Prüfung fehl, wird die Website NICHT veröffentlicht.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const dateien = [];
const lauf = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) lauf(p);
    else if (p.endsWith('.html')) dateien.push(p);
  }
};
lauf(DIST);

const existiert = (url) => {
  const pfad = decodeURI(url.split('#')[0].split('?')[0]);
  if (!pfad || pfad === '/') return existsSync(join(DIST, 'index.html'));
  const ziel = join(DIST, pfad);
  if (pfad.endsWith('/')) return existsSync(join(ziel, 'index.html'));
  return existsSync(ziel) || existsSync(join(ziel, 'index.html'));
};

const fehler = [];
let links = 0;
for (const datei of dateien) {
  const html = readFileSync(datei, 'utf8');
  for (const [, url] of html.matchAll(/(?:href|src|srcset|content)="(\/[^"\s,]*)/g)) {
    if (url.startsWith('//')) continue;
    links++;
    if (!existiert(url)) fehler.push(`${datei.replace(DIST, '')} → ${url}`);
  }
  if (!/<title>[^<]+<\/title>/.test(html)) fehler.push(`${datei}: <title> fehlt`);
  if (!/name="description"/.test(html)) fehler.push(`${datei}: Beschreibung fehlt`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) fehler.push(`${datei}: ${h1}× <h1> (erwartet: genau 1)`);
}

if (fehler.length) {
  console.error(`\n✖ Qualitätsprüfung fehlgeschlagen (${fehler.length}):\n  ${[...new Set(fehler)].join('\n  ')}\n`);
  process.exit(1);
}
console.log(`✓ Qualitätsprüfung: ${dateien.length} Seiten, ${links} interne Links – alles in Ordnung.`);
