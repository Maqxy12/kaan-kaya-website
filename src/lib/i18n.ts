/** Sprachen, Adressen der Seiten und Hilfsfunktionen für DE/EN. */
export type Lang = 'de' | 'en';
export const LANGS: Lang[] = ['de', 'en'];
export const DEFAULT_LANG: Lang = 'de';

export const htmlLang: Record<Lang, string> = { de: 'de-CH', en: 'en' };
export const ogLocale: Record<Lang, string> = { de: 'de_CH', en: 'en_GB' };
export const dateLocale: Record<Lang, string> = { de: 'de-CH', en: 'en-GB' };

/** Jede Seite hat in jeder Sprache eine eigene, sprechende Adresse. */
export const routes = {
  start: { de: '/', en: '/en/' },
  projekte: { de: '/projekte/', en: '/en/projects/' },
  skills: { de: '/skills/', en: '/en/skills/' },
  blog: { de: '/blog/', en: '/en/blog/' },
  kontakt: { de: '/kontakt/', en: '/en/contact/' },
  danke: { de: '/kontakt/danke/', en: '/en/contact/thanks/' },
  jetzt: { de: '/jetzt/', en: '/en/now/' },
  lebenslauf: { de: '/lebenslauf/', en: '/en/cv/' },
  datenschutz: { de: '/datenschutz/', en: '/en/privacy/' },
  boxtimer: { de: '/box-timer/', en: '/en/box-timer/' },
} as const satisfies Record<string, Record<Lang, string>>;

export type RouteKey = keyof typeof routes;
export type Alternates = Record<Lang, string>;

export const route = (key: RouteKey, lang: Lang): string => routes[key][lang];
export const alternates = (key: RouteKey): Alternates => routes[key];

export const projektPfad = (lang: Lang, slug: string) =>
  lang === 'de' ? `/projekte/${slug}/` : `/en/projects/${slug}/`;
export const blogPfad = (lang: Lang, slug: string) =>
  lang === 'de' ? `/blog/${slug}/` : `/en/blog/${slug}/`;
export const cvPdfPfad = (lang: Lang) =>
  lang === 'de' ? '/lebenslauf/kaan-kaya-lebenslauf.pdf' : '/en/cv/kaan-kaya-cv.pdf';

export const andereSprache = (lang: Lang): Lang => (lang === 'de' ? 'en' : 'de');

export const formatDatum = (datum: Date | string, lang: Lang, lang_format: 'long' | 'short' = 'long') =>
  new Date(datum).toLocaleDateString(dateLocale[lang], {
    day: 'numeric',
    month: lang_format === 'long' ? 'long' : 'short',
    year: 'numeric',
    timeZone: 'Europe/Zurich',
  });
