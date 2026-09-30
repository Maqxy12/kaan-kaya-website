// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';
import YAML from 'yaml';

// Optionale Besucherstatistik (GoatCounter) – wird in src/content/profil.yaml eingeschaltet
const { goatcounter = '' } = YAML.parse(readFileSync('./src/content/profil.yaml', 'utf8')) ?? {};
const statistik = goatcounter ? [`https://${goatcounter}.goatcounter.com`] : [];

// Die öffentliche Adresse der Website.
// Auf Netlify wird sie automatisch gesetzt (Variable URL). Sobald du eine eigene
// Domain hast, trägst du sie hier ein, z. B. 'https://kaankaya.ch'.
const site = process.env.SITE_URL || process.env.URL || 'https://kaankaya.netlify.app';

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      filter: (page) => !/\/(danke|thanks)\/$/.test(page),
    }),
  ],
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        `img-src 'self' data: ${statistik.join(' ')}`.trim(),
        "font-src 'self'",
        `connect-src 'self' ${statistik.join(' ')}`.trim(),
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "manifest-src 'self'",
      ],
      scriptDirective: {
        resources: ["'self'", ...(goatcounter ? ['https://gc.zgo.at'] : [])],
      },
    },
  },
  vite: {
    ssr: {
      // Werden nur beim Bauen genutzt (Vorschaubilder & PDF) – nicht bündeln
      external: ['pdfkit', 'satori', '@resvg/resvg-js'],
    },
  },
  devToolbar: { enabled: false },
});
