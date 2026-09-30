/** Kurzbeschreibung der Website für KI-Assistenten (llms.txt-Standard). */
import type { APIRoute } from 'astro';
import { t, profil } from '../lib/texte';
import { route, projektPfad, blogPfad } from '../lib/i18n';
import { projekte, beitraege, slug } from '../lib/inhalte';

export const GET: APIRoute = async ({ site }) => {
  const en = t('en');
  const abs = (p: string) => new URL(p, site).href;
  const p = await projekte('en');
  const b = await beitraege('en');
  const text = `# ${profil.name}

> ${en.meta.beschreibung}

${en.start.intro}

- Location: Zug, Switzerland
- Education: WISS Zurich (2026–2027), apprenticeship as an application developer (Informatiker EFZ Applikationsentwicklung) at Roche, Rotkreuz (from 2027)
- Certificates: ${en.skills.zertifikate.map((z) => z.name).join(', ')}
- Languages: ${en.start.sprachen.liste.map((l) => `${l.sprache} (${l.niveau})`).join(', ')}
- Contact: ${profil.email}

## Pages

- [About](${abs(route('start', 'en'))}): Story, timeline, values and interests
- [Projects](${abs(route('projekte', 'en'))}): Case studies
- [Skills](${abs(route('skills', 'en'))}): Honest skill levels, certificates, roadmap
- [CV](${abs(route('lebenslauf', 'en'))}): Curriculum vitae (also as PDF)
- [Contact](${abs(route('kontakt', 'en'))})
- German version: ${abs(route('start', 'de'))}

## Projects

${p.map((x) => `- [${x.data.titel}](${abs(projektPfad('en', slug(x.id)))}): ${x.data.kurz}`).join('\n')}

## Blog

${b.map((x) => `- [${x.data.titel}](${abs(blogPfad('en', slug(x.id)))}): ${x.data.beschreibung}`).join('\n')}
`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
