/** Vorschaubilder für alle Seiten, Projekte und Blogbeiträge. */
import type { APIRoute, GetStaticPaths } from 'astro';
import { ogBild, type OgDaten } from '../../lib/og';
import { t } from '../../lib/texte';
import { LANGS } from '../../lib/i18n';
import { projekte, beitraege, slug } from '../../lib/inhalte';

type Props = Omit<OgDaten, 'domain'>;

export const getStaticPaths = (async () => {
  const paths: { params: { pfad: string }; props: Props }[] = [];
  for (const lang of LANGS) {
    const tx = t(lang);
    const fuss = `${tx.meta.rolle} · ${tx.kontakt.ort}`;
    const seiten: [string, string, string, string][] = [
      ['start', tx.start.badge, `${tx.start.titel} ${tx.start.titel_akzent}`, tx.start.intro],
      ['projekte', tx.projekte.eyebrow, tx.projekte.titel, tx.projekte.seo_beschreibung],
      ['skills', tx.skills.eyebrow, tx.skills.titel, tx.skills.seo_beschreibung],
      ['blog', tx.blog.eyebrow, tx.blog.titel, tx.blog.seo_beschreibung],
      ['kontakt', tx.kontakt.eyebrow, tx.kontakt.titel, tx.kontakt.seo_beschreibung],
      ['jetzt', tx.jetzt.eyebrow, tx.jetzt.titel, tx.jetzt.seo_beschreibung],
      ['lebenslauf', tx.lebenslauf.titel, tx.meta.rolle, tx.lebenslauf.seo_beschreibung],
      ['boxtimer', tx.boxtimer.eyebrow, tx.boxtimer.titel, tx.boxtimer.seo_beschreibung],
    ];
    for (const [key, eyebrow, titel, text] of seiten) {
      paths.push({ params: { pfad: `${lang}/${key}` }, props: { eyebrow, titel, text, fuss } });
    }
    for (const p of await projekte(lang)) {
      paths.push({
        params: { pfad: `${lang}/projekte/${slug(p.id)}` },
        props: { eyebrow: tx.projekte.eyebrow, titel: p.data.titel, text: p.data.kurz, fuss },
      });
    }
    for (const b of await beitraege(lang)) {
      paths.push({
        params: { pfad: `${lang}/blog/${slug(b.id)}` },
        props: { eyebrow: tx.blog.eyebrow, titel: b.data.titel, text: b.data.beschreibung, fuss },
      });
    }
  }
  return paths;
}) satisfies GetStaticPaths;

export const GET: APIRoute<Props> = async ({ props, site }) => {
  const png = await ogBild({ ...props, domain: site!.host });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
