/**
 * Suchindex für die Befehlspalette und Daten für den Terminal-Modus.
 * Wird beim Bauen erzeugt: /suche/de.json und /suche/en.json
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { t, profil } from '../../lib/texte';
import { type Lang, LANGS, route, projektPfad, blogPfad } from '../../lib/i18n';
import { projekte, beitraege, slug } from '../../lib/inhalte';
import lucide from '@iconify-json/lucide/icons.json';

const ICONS = ['user', 'folder-code', 'layers', 'pen-line', 'sparkles', 'file-text', 'at-sign', 'shield-check', 'mail', 'sun-moon', 'languages', 'terminal', 'gamepad-2', 'download', 'instagram', 'corner-down-left', 'search', 'arrow-right', 'timer'];
const icons = Object.fromEntries(ICONS.map((n) => [n, (lucide as unknown as { icons: Record<string, { body: string }> }).icons[n].body]));

export const getStaticPaths = (() => LANGS.map((lang) => ({ params: { lang } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang as Lang;
  const tx = t(lang);
  const seiten = [
    { key: 'start', titel: tx.nav.start, text: tx.meta.beschreibung, icon: 'user' },
    { key: 'projekte', titel: tx.nav.projekte, text: tx.projekte.seo_beschreibung, icon: 'folder-code' },
    { key: 'skills', titel: tx.nav.skills, text: tx.skills.seo_beschreibung, icon: 'layers' },
    { key: 'blog', titel: tx.nav.blog, text: tx.blog.seo_beschreibung, icon: 'pen-line' },
    { key: 'jetzt', titel: tx.nav.jetzt, text: tx.jetzt.seo_beschreibung, icon: 'sparkles' },
    { key: 'boxtimer', titel: tx.boxtimer.name, text: tx.boxtimer.seo_beschreibung, icon: 'timer' },
    { key: 'lebenslauf', titel: tx.nav.lebenslauf, text: tx.lebenslauf.seo_beschreibung, icon: 'file-text' },
    { key: 'kontakt', titel: tx.nav.kontakt, text: tx.kontakt.seo_beschreibung, icon: 'at-sign' },
    { key: 'datenschutz', titel: tx.nav.datenschutz, text: tx.datenschutz.seo_beschreibung, icon: 'shield-check' },
  ] as const;

  const p = await projekte(lang);
  const b = await beitraege(lang);

  const items = [
    ...seiten.map((s) => ({ gruppe: 'seiten', titel: s.titel, text: s.text, url: route(s.key, lang), icon: s.icon, key: s.key })),
    ...p.map((x) => ({
      gruppe: 'projekte',
      titel: x.data.titel,
      text: x.data.kurz,
      url: projektPfad(lang, slug(x.id)),
      icon: 'folder-code',
      tags: x.data.stack.join(' '),
    })),
    ...b.map((x) => ({
      gruppe: 'blog',
      titel: x.data.titel,
      text: x.data.beschreibung,
      url: blogPfad(lang, slug(x.id)),
      icon: 'pen-line',
      tags: x.data.tags.join(' '),
    })),
  ];

  const terminal = {
    name: profil.name,
    rolle: tx.meta.rolle,
    ort: tx.kontakt.ort,
    intro: tx.start.intro,
    motto: tx.start.motto.zitat,
    weg: tx.start.weg.eintraege.map((e) => ({ zeit: e.zeit, titel: e.titel })),
    skills: tx.skills.gruppen.map((g) => ({
      titel: g.titel,
      eintraege: g.eintraege.map((e) => ({ name: e.name, stufe: e.stufe, label: tx.skills.stufen[e.stufe] })),
    })),
    sprachen: tx.start.sprachen.liste,
    zertifikate: tx.skills.zertifikate.map((z) => z.name),
    jetzt: tx.jetzt.liste.map((j) => ({ titel: j.titel, text: j.text })),
    freizeit: tx.start.freizeit.liste.map((f) => f.titel),
    werte: tx.start.werte.liste.map((w) => w.titel),
    projekte: p.map((x) => ({ titel: x.data.titel, url: projektPfad(lang, slug(x.id)) })),
    seiten: Object.fromEntries(seiten.map((s) => [s.key, route(s.key, lang)])),
  };

  return new Response(JSON.stringify({ items, terminal, icons }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
