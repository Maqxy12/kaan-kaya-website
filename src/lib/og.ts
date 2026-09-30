/**
 * Erzeugt Vorschaubilder (1200×630) für WhatsApp, LinkedIn & Co. beim Bauen.
 */
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const fontDir = join(process.cwd(), 'node_modules/@fontsource');
const font = (pkg: string, file: string) => readFileSync(join(fontDir, pkg, 'files', file));
const fonts = [
  { name: 'Inter', data: font('inter', 'inter-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: font('inter', 'inter-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
  { name: 'Jakarta', data: font('plus-jakarta-sans', 'plus-jakarta-sans-latin-800-normal.woff'), weight: 800 as const, style: 'normal' as const },
];

const logo = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64"><defs><linearGradient id="g" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#60a5fa"/><stop offset=".55" stop-color="#3b82f6"/><stop offset="1" stop-color="#f97316"/></linearGradient></defs><path d="M16 2.6 27.6 9.3v13.4L16 29.4 4.4 22.7V9.3z" fill="none" stroke="url(#g)" stroke-width="2.2" stroke-linejoin="round"/><path d="M12.4 10v12M20 10l-6.2 6 6.6 6" fill="none" stroke="#f1f5f9" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="21.2" cy="16" r="1.9" fill="#f97316"/></svg>`,
).toString('base64')}`;

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (Node | string)[]): Node => ({
  type,
  props: { style, children: children.length === 1 ? children[0] : children },
});

export interface OgDaten {
  eyebrow: string;
  titel: string;
  text: string;
  fuss: string;
  domain: string;
}

export async function ogBild({ eyebrow, titel, text, fuss, domain }: OgDaten): Promise<Buffer> {
  const titelGroesse = titel.length > 48 ? 58 : titel.length > 30 ? 68 : 80;
  const tree = h(
    'div',
    {
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '64px 72px 56px',
      backgroundColor: '#0b0f17',
      backgroundImage:
        'radial-gradient(circle at 8% 0%, rgba(59,130,246,0.32), transparent 45%), radial-gradient(circle at 100% 100%, rgba(249,115,22,0.22), transparent 45%)',
      color: '#f1f5f9',
      fontFamily: 'Inter',
    },
    h(
      'div',
      { display: 'flex', alignItems: 'center', gap: 18 },
      { type: 'img', props: { src: logo, width: 64, height: 64 } },
      h(
        'div',
        { display: 'flex', flexDirection: 'column' },
        h('div', { fontFamily: 'Jakarta', fontSize: 30, letterSpacing: -0.5 }, 'Kaan Kaya'),
        h('div', { fontSize: 20, color: '#a3b1c6', fontWeight: 600 }, fuss),
      ),
    ),
    h(
      'div',
      { display: 'flex', flexDirection: 'column', gap: 20 },
      h('div', { fontSize: 22, fontWeight: 600, letterSpacing: 3, color: '#fb923c', textTransform: 'uppercase' }, eyebrow),
      h('div', { fontFamily: 'Jakarta', fontSize: titelGroesse, lineHeight: 1.05, letterSpacing: -2.5, maxWidth: 1050 }, titel),
      h('div', { fontSize: 28, lineHeight: 1.4, color: '#a3b1c6', maxWidth: 980, lineClamp: 2, display: 'block' }, text),
    ),
    h(
      'div',
      { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
      h('div', { display: 'flex', width: 360, height: 6, borderRadius: 6, backgroundImage: 'linear-gradient(90deg, #60a5fa, #3b82f6 45%, #f97316)' }),
      h('div', { fontSize: 22, color: '#8a97ad', fontWeight: 600 }, domain),
    ),
  );
  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
