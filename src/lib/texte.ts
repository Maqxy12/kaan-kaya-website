/**
 * Lädt und prüft die YAML-Inhaltsdateien (Profil + Texte).
 * Fehlt ein Feld oder ist ein Wert falsch, bricht der Build mit einer
 * verständlichen Meldung ab – so geht nie eine kaputte Seite online.
 */
import YAML from 'yaml';
import { z } from 'astro/zod';
import deRaw from '../content/texte/de.yaml?raw';
import enRaw from '../content/texte/en.yaml?raw';
import profilRaw from '../content/profil.yaml?raw';
import type { Lang } from './i18n';

const txt = z.string().trim().min(1);
// Zahlen wie 2027 werden automatisch als Text akzeptiert
const s = z.preprocess((v) => (typeof v === 'number' ? String(v) : v), txt);
const strings = <K extends string>(...keys: K[]) =>
  z.object(Object.fromEntries(keys.map((k) => [k, s])) as Record<K, typeof s>);
const icon = s;
const stufe = z.number().int().min(0).max(5);
const iconListe = z.array(z.object({ icon, titel: s, text: s, highlight: s.optional() })).min(1);

const texteSchema = z.object({
  meta: strings('sprache', 'rolle', 'seiten_suffix', 'beschreibung'),
  nav: strings(
    'start', 'projekte', 'skills', 'blog', 'kontakt', 'jetzt', 'lebenslauf', 'datenschutz',
    'hauptnavigation', 'menue', 'menue_titel', 'menue_schliessen', 'suche', 'suche_lang',
    'sprache_wechseln', 'theme_wechseln', 'zum_inhalt', 'weitere',
  ),
  status: strings('erreichbar', 'offline', 'ortszeit'),
  allgemein: strings(
    'kopieren', 'kopiert', 'lesezeit', 'aktualisiert', 'neu', 'mehr', 'zurueck',
    'alle_ansehen', 'oeffnet_neues_fenster', 'e_mail', 'instagram',
  ),
  footer: strings('claim', 'gebaut', 'terminal_hinweis', 'rechte', 'bereiche', 'kontakt', 'rss'),
  start: z.object({
    seo_titel: s,
    badge: s,
    titel: s,
    titel_akzent: s,
    intro: s,
    cta_projekte: s,
    cta_kontakt: s,
    karte: z.object({
      titel: s,
      untertitel: s,
      foto_alt: s,
      felder: z.array(z.object({ label: s, wert: s })).min(1),
    }),
    fakten: z.array(z.object({ wert: s, label: s })).min(1).max(4),
    motto: z.object({ eyebrow: s, zitat: s }),
    weg: z.object({
      eyebrow: s,
      titel: s,
      intro: s,
      jetzt_label: s,
      eintraege: z
        .array(
          z.object({
            zeit: s,
            typ: z.enum(['start', 'sport', 'rueckschlag', 'bildung', 'meilenstein', 'jetzt', 'zukunft', 'ziel']),
            titel: s,
            text: s,
            tags: z.array(s).optional(),
          }),
        )
        .min(1),
    }),
    werte: z.object({ eyebrow: s, titel: s, intro: s, liste: iconListe }),
    freizeit: z.object({ eyebrow: s, titel: s, intro: s, liste: iconListe }),
    sprachen: z.object({
      eyebrow: s,
      titel: s,
      liste: z.array(z.object({ sprache: s, niveau: s, stufe })).min(1),
    }),
    reaktion: z.object({
      ...strings(
        'eyebrow', 'titel', 'text', 'start', 'anleitung', 'warten', 'warten_hinweis', 'los',
        'zu_frueh', 'zu_frueh_text', 'ergebnis', 'runde', 'von', 'weiter', 'schnitt', 'bestzeit',
        'noch_keine', 'nochmal',
      ).shape,
      bewertungen: z.array(z.object({ bis: z.number(), text: s })).min(1),
    }),
    projekte_teaser: strings('eyebrow', 'titel'),
    blog_teaser: strings('eyebrow', 'titel'),
    jetzt_teaser: strings('eyebrow', 'titel', 'link'),
    cta: strings('titel', 'text', 'knopf'),
  }),
  projekte: z.object({
    ...strings(
      'seo_titel', 'seo_beschreibung', 'eyebrow', 'titel', 'intro', 'filter_label', 'case_study',
      'rolle', 'stack', 'jahr', 'status', 'live', 'code', 'alle_projekte', 'naechstes',
      'selbst_testen', 'app_oeffnen', 'cta_titel', 'cta_text', 'cta_knopf',
    ).shape,
    filter: strings('alle', 'web', 'hardware', 'spiel', 'sport'),
  }),
  boxtimer: z.object({
    ...strings(
      'seo_titel', 'seo_beschreibung', 'eyebrow', 'titel', 'intro', 'einstellungen', 'runden',
      'rundenzeit', 'pause', 'vorbereitung', 'gesamt', 'start', 'pausieren', 'weiter', 'zuruecksetzen',
      'vollbild', 'ton_an', 'ton_aus', 'runde', 'von', 'phase_bereit', 'phase_vorbereitung',
      'phase_runde', 'phase_pause', 'phase_fertig', 'fertig_text', 'letzte_sekunden', 'weniger',
      'mehr', 'tipp_titel', 'kein_js', 'projekt_link',
    ).shape,
    tipps: z.array(s).min(1),
  }),
  skills: z.object({
    ...strings('seo_titel', 'seo_beschreibung', 'eyebrow', 'titel', 'intro', 'legende_titel', 'zertifikate_titel', 'soft_titel').shape,
    stufen: z.array(s).length(4),
    gruppen: z
      .array(
        z.object({
          titel: s,
          icon,
          eintraege: z.array(z.object({ name: s, stufe: z.number().int().min(0).max(3), text: s })).min(1),
        }),
      )
      .min(1),
    zertifikate: z.array(z.object({ name: s, aussteller: s, text: s, icon })),
    soft: z.array(s),
    lernen: z.object({
      eyebrow: s,
      titel: s,
      intro: s,
      schritte: z.array(z.object({ titel: s, text: s })).min(1),
    }),
    roadmap: z.object({
      eyebrow: s,
      titel: s,
      schritte: z.array(z.object({ zeit: s, titel: s, text: s })).min(1),
    }),
    setup: z.object({
      eyebrow: s,
      titel: s,
      liste: z.array(z.object({ kategorie: s, name: s })),
    }),
    lebenslauf: strings('titel', 'text', 'ansehen', 'pdf'),
  }),
  kontakt: z.object({
    ...strings('seo_titel', 'seo_beschreibung', 'eyebrow', 'titel', 'intro', 'direkt', 'ort_label', 'ort', 'karte_alt', 'faq_titel').shape,
    karte_orte: strings('zug', 'zurich', 'rotkreuz'),
    formular: z.object({
      ...strings(
        'titel', 'text', 'name', 'name_platzhalter', 'email', 'email_platzhalter', 'thema',
        'nachricht', 'nachricht_platzhalter', 'pflicht', 'senden', 'sendet', 'datenschutz_hinweis',
        'datenschutz_link', 'fehler_name', 'fehler_email', 'fehler_nachricht', 'fehler_senden',
        'erfolg_titel', 'erfolg_text', 'erfolg_nochmal',
      ).shape,
      themen: z.array(s).min(1),
    }),
    danke: strings('seo_titel', 'titel', 'text', 'zurueck'),
    faq: z.array(z.object({ frage: s, antwort: s })),
  }),
  blog: strings('seo_titel', 'seo_beschreibung', 'eyebrow', 'titel', 'intro', 'leer', 'weiterlesen', 'alle_beitraege', 'veroeffentlicht', 'auch_auf'),
  jetzt: z.object({
    ...strings('seo_titel', 'seo_beschreibung', 'eyebrow', 'titel', 'intro', 'intro_link_text').shape,
    liste: iconListe,
  }),
  lebenslauf: z.object({
    ...strings(
      'seo_titel', 'seo_beschreibung', 'titel', 'pdf', 'drucken', 'profil_titel', 'profil',
      'ausbildung_titel', 'zertifikate_titel', 'sprachen_titel', 'kenntnisse_titel',
      'projekte_titel', 'interessen_titel', 'interessen', 'kontakt_titel', 'stand',
    ).shape,
    ausbildung: z.array(z.object({ zeit: s, titel: s, ort: s.optional(), text: s.optional() })).min(1),
  }),
  datenschutz: strings('seo_titel', 'seo_beschreibung'),
  fehler: strings('seo_titel', 'code', 'titel', 'text', 'start', 'suche'),
  palette: z.object({
    ...strings('platzhalter', 'keine_treffer').shape,
    gruppen: strings('seiten', 'projekte', 'blog', 'aktionen'),
    aktionen: strings('email', 'theme', 'sprache', 'terminal', 'spiel', 'pdf', 'instagram'),
    hinweise: strings('navigieren', 'oeffnen', 'schliessen'),
  }),
});

const profilSchema = z.object({
  name: s,
  initialen: txt.max(3),
  email: z.email(),
  instagram: z.string().trim().default(''),
  github: z.string().trim().default(''),
  linkedin: z.string().trim().default(''),
  stadt: s,
  kanton: s,
  land: txt.length(2),
  zeitzone: s,
  erreichbar_von: z.number().int().min(0).max(24),
  erreichbar_bis: z.number().int().min(0).max(24),
  jetzt_aktualisiert: z.coerce.string(),
  google_verifizierung: z.string().trim().default(''),
  goatcounter: z.string().trim().regex(/^[a-z0-9-]*$/, 'nur Kleinbuchstaben, Zahlen und -').default(''),
});

export type Texte = z.infer<typeof texteSchema>;
export type Profil = z.infer<typeof profilSchema>;

function laden<T extends z.ZodType>(schema: T, raw: string, datei: string): z.infer<T> {
  let daten: unknown;
  try {
    daten = YAML.parse(raw);
  } catch (e) {
    throw new Error(`\n✖ ${datei} ist kein gültiges YAML:\n  ${(e as Error).message}\n`);
  }
  const result = schema.safeParse(daten);
  if (!result.success) {
    const liste = result.error.issues
      .map((i) => `  • ${i.path.join(' → ') || '(Datei)'}: ${i.message}`)
      .join('\n');
    throw new Error(`\n✖ Fehler in ${datei}:\n${liste}\n`);
  }
  return result.data;
}

export const profil = laden(profilSchema, profilRaw, 'src/content/profil.yaml');
const texte: Record<Lang, Texte> = {
  de: laden(texteSchema, deRaw, 'src/content/texte/de.yaml'),
  en: laden(texteSchema, enRaw, 'src/content/texte/en.yaml'),
};

export const t = (lang: Lang): Texte => texte[lang];

export const instagramUrl = profil.instagram ? `https://www.instagram.com/${profil.instagram}/` : '';
export const githubUrl = profil.github ? `https://github.com/${profil.github}` : '';
