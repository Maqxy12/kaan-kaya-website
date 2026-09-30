// Erzeugt Favicons und App-Icons aus dem Logo.  Aufruf: npm run icons
import { writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const mark = (bg, pad = 0) => {
  const s = 32 + pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${s} ${s}">
  <defs><linearGradient id="g" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#60a5fa"/><stop offset=".55" stop-color="#3b82f6"/><stop offset="1" stop-color="#f97316"/>
  </linearGradient></defs>
  ${bg}
  <path d="M16 3.6 26.7 9.8v12.4L16 28.4 5.3 22.2V9.8z" fill="none" stroke="url(#g)" stroke-width="2.3" stroke-linejoin="round"/>
  <path d="M12.6 10.6v10.8M19.6 10.6l-5.6 5.4 6 5.4" fill="none" stroke="#f1f5f9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="20.6" cy="16" r="1.8" fill="#f97316"/>
</svg>`;
};

const rounded = mark('<rect x="0" y="0" width="32" height="32" rx="7.5" fill="#0f1623"/>');
const full = (pad) => mark(`<rect x="${-pad}" y="${-pad}" width="${32 + pad * 2}" height="${32 + pad * 2}" fill="#0b0f17"/>`, pad);
const png = (svg, size) => new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();

writeFileSync('public/favicon.svg', rounded);
writeFileSync('public/apple-touch-icon.png', png(full(3), 180));
writeFileSync('public/icon-192.png', png(rounded, 192));
writeFileSync('public/icon-512.png', png(rounded, 512));
writeFileSync('public/icon-maskable-512.png', png(full(8), 512));

// favicon.ico mit eingebetteten PNGs (16, 32, 48)
const sizes = [16, 32, 48];
const images = sizes.map((s) => png(rounded, s));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const o = 6 + i * 16;
  header.writeUInt8(s, o);
  header.writeUInt8(s, o + 1);
  header.writeUInt16LE(1, o + 4);
  header.writeUInt16LE(32, o + 6);
  header.writeUInt32LE(images[i].length, o + 8);
  header.writeUInt32LE(offset, o + 12);
  offset += images[i].length;
});
writeFileSync('public/favicon.ico', Buffer.concat([header, ...images]));
console.log('✓ Icons erzeugt');
