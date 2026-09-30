/**
 * Erzeugt den Lebenslauf als PDF – automatisch aus denselben Daten wie die Website.
 * Änderst du etwas in den Texten, ist auch das PDF beim nächsten Veröffentlichen aktuell.
 */
import PDFDocument from 'pdfkit';
import { join } from 'node:path';
import { t, profil, instagramUrl } from './texte';
import { type Lang, formatDatum } from './i18n';
import { projekte } from './inhalte';
import { fotoDatei } from './foto';

const fontDir = join(process.cwd(), 'node_modules/@fontsource');
const F = {
  regular: join(fontDir, 'inter/files/inter-latin-400-normal.woff'),
  semibold: join(fontDir, 'inter/files/inter-latin-600-normal.woff'),
  bold: join(fontDir, 'inter/files/inter-latin-700-normal.woff'),
  display: join(fontDir, 'plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff'),
};
const C = {
  text: '#0b1220',
  muted: '#3b4a60',
  subtle: '#64748b',
  primary: '#1d4ed8',
  accent: '#c2410c',
  line: '#d8dee8',
};

export async function lebenslaufPdf(lang: Lang, site: URL): Promise<Buffer> {
  const tx = t(lang);
  const cv = tx.lebenslauf;
  const s = tx.skills;
  const liste = await projekte(lang);

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 46, bottom: 40, left: 48, right: 48 },
    info: {
      Title: `${profil.name} – ${cv.titel}`,
      Author: profil.name,
      Subject: tx.meta.rolle,
      Keywords: 'CV, Lebenslauf, Software Engineer, Zug',
    },
    lang: lang === 'de' ? 'de-CH' : 'en-GB',
    displayTitle: true,
    pdfVersion: '1.7',
  });
  doc.registerFont('R', F.regular);
  doc.registerFont('S', F.semibold);
  doc.registerFont('B', F.bold);
  doc.registerFont('D', F.display);

  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));
  const fertig = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  const L = doc.page.margins.left;
  const W = doc.page.width - L - doc.page.margins.right;

  // ── Kopf ──
  const FOTO = 76; // Grösse des Fotos oben rechts (in Punkt)
  const kopfBreite = fotoDatei ? W - FOTO - 16 : W;
  doc.font('D').fontSize(28).fillColor(C.text).text(profil.name, L, 46, { characterSpacing: -0.6, width: kopfBreite });
  doc.font('S').fontSize(12).fillColor(C.primary).text(tx.meta.rolle, { width: kopfBreite });
  doc.moveDown(0.35);
  const kontakt = [tx.kontakt.ort, profil.email, site.host, instagramUrl ? `Instagram @${profil.instagram}` : '']
    .filter(Boolean)
    .join('   ·   ');
  doc.font('R').fontSize(9).fillColor(C.muted).text(kontakt, { width: kopfBreite });
  let kopfEnde = doc.y;

  if (fotoDatei) {
    // Bewerbungsfoto oben rechts (in der Schweiz üblich)
    const fx = L + W - FOTO;
    const fy = 40;
    doc.save().roundedRect(fx, fy, FOTO, FOTO, 6).clip();
    doc.image(fotoDatei, fx, fy, { cover: [FOTO, FOTO], align: 'center', valign: 'center' });
    doc.restore();
    doc.roundedRect(fx, fy, FOTO, FOTO, 6).lineWidth(0.6).stroke(C.line);
    kopfEnde = Math.max(kopfEnde, fy + FOTO - 8);
  } else {
    // Logo (Hexagon mit K)
    const lx = L + W - 40;
    const ly = 46;
    const grad = doc.linearGradient(lx, ly, lx + 40, ly + 40);
    grad.stop(0, '#60a5fa').stop(0.55, '#3b82f6').stop(1, '#f97316');
    doc.save().translate(lx, ly).scale(1.25);
    doc.path('M16 2.6 27.6 9.3v13.4L16 29.4 4.4 22.7V9.3z').lineWidth(2.2).lineJoin('round').stroke(grad);
    doc.path('M12.4 10v12M20 10l-6.2 6 6.6 6').lineWidth(2.4).lineCap('round').lineJoin('round').stroke(C.text);
    doc.circle(21.2, 16, 1.9).fill('#f97316');
    doc.restore();
  }

  let y = kopfEnde + 12;
  doc.moveTo(L, y).lineTo(L + W, y).lineWidth(1.5).stroke(C.text);
  y += 16;

  const titel = (text: string, x: number, width: number) => {
    doc.font('B').fontSize(7.5).fillColor(C.accent).text(text.toUpperCase(), x, y, { width, characterSpacing: 1.3 });
    y = doc.y + 5;
  };
  const absatz = (text: string, x: number, width: number, farbe = C.muted, size = 9.5) => {
    doc.font('R').fontSize(size).fillColor(farbe).text(text, x, y, { width, lineGap: 2 });
    y = doc.y;
  };

  // ── Profil ──
  titel(cv.profil_titel, L, W);
  absatz(cv.profil, L, W, C.text, 10);
  y += 16;

  // ── Zwei Spalten ──
  const gap = 28;
  const lw = W * 0.58;
  const rx = L + lw + gap;
  const rw = W - lw - gap;
  const start = y;

  // Linke Spalte: Ausbildung + Projekte
  titel(cv.ausbildung_titel, L, lw);
  for (const a of cv.ausbildung) {
    const top = y;
    doc.font('S').fontSize(8.5).fillColor(C.subtle).text(a.zeit, L, top, { width: 70 });
    doc.font('S').fontSize(10).fillColor(C.text).text(a.titel, L + 78, top, { width: lw - 78 });
    if (a.ort) doc.font('R').fontSize(9).fillColor(C.muted).text(a.ort, { width: lw - 78 });
    if (a.text) doc.font('R').fontSize(9).fillColor(C.primary).text(a.text, { width: lw - 78 });
    y = doc.y + 8;
  }
  y += 8;
  titel(cv.projekte_titel, L, lw);
  for (const p of liste) {
    doc.font('S').fontSize(10).fillColor(C.text).text(p.data.titel, L, y, { width: lw });
    doc.font('R').fontSize(9).fillColor(C.muted).text(p.data.kurz, { width: lw, lineGap: 1.5 });
    doc.font('R').fontSize(8).fillColor(C.subtle).text(p.data.stack.join(' · '), { width: lw });
    y = doc.y + 8;
  }
  const linksEnde = y;

  // Rechte Spalte
  y = start;
  titel(cv.zertifikate_titel, rx, rw);
  for (const z of s.zertifikate) {
    doc.font('S').fontSize(10).fillColor(C.text).text(z.name, rx, y, { width: rw });
    doc.font('R').fontSize(8.5).fillColor(C.muted).text(z.aussteller, { width: rw });
    y = doc.y + 6;
  }
  y += 8;
  titel(cv.sprachen_titel, rx, rw);
  for (const l of tx.start.sprachen.liste) {
    doc.font('S').fontSize(9.5).fillColor(C.text).text(l.sprache, rx, y, { width: rw, continued: true });
    doc.font('R').fillColor(C.muted).text(`  ${l.niveau}`);
    y = doc.y + 3;
  }
  y += 10;
  titel(cv.kenntnisse_titel, rx, rw);
  for (const g of s.gruppen) {
    const items = g.eintraege.filter((e) => e.stufe > 0).map((e) => e.name);
    const next = g.eintraege.filter((e) => e.stufe === 0).map((e) => e.name);
    doc.font('S').fontSize(9.5).fillColor(C.text).text(g.titel, rx, y, { width: rw });
    doc.font('R').fontSize(9).fillColor(C.muted).text(items.join(', '), { width: rw });
    if (next.length) doc.font('R').fontSize(8.5).fillColor(C.accent).text(`${s.stufen[0]}: ${next.join(', ')}`, { width: rw });
    y = doc.y + 6;
  }
  y += 8;
  titel(s.soft_titel, rx, rw);
  absatz(s.soft.join(' · '), rx, rw, C.muted, 9);
  y += 14;
  titel(cv.interessen_titel, rx, rw);
  absatz(cv.interessen, rx, rw, C.muted, 9);

  // ── Fuss ──
  if (Math.max(linksEnde, y) > doc.page.height - 60) console.warn('⚠ Lebenslauf-PDF ist länger als eine Seite.');
  doc.page.margins.bottom = 0; // Fusszeile darf in den Rand – sonst entsteht eine zweite Seite
  const fy = doc.page.height - 34;
  doc.moveTo(L, fy - 8).lineTo(L + W, fy - 8).lineWidth(0.6).stroke(C.line);
  doc
    .font('R')
    .fontSize(7.5)
    .fillColor(C.subtle)
    .text(`${cv.stand}: ${formatDatum(new Date(), lang)}  ·  ${site.host}`, L, fy, { width: W, lineBreak: false });

  doc.end();
  return fertig;
}
