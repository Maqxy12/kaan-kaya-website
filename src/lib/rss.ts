import rss from '@astrojs/rss';
import { t, profil } from './texte';
import { type Lang, blogPfad, htmlLang } from './i18n';
import { beitraege, slug } from './inhalte';

export async function feed(lang: Lang, site: URL) {
  const tx = t(lang);
  const posts = await beitraege(lang);
  return rss({
    title: `${profil.name} – ${tx.blog.seo_titel}`,
    description: tx.blog.seo_beschreibung,
    site,
    items: posts.map((p) => ({
      title: p.data.titel,
      description: p.data.beschreibung,
      pubDate: p.data.datum,
      link: blogPfad(lang, slug(p.id)),
      categories: p.data.tags,
      author: `${profil.email} (${profil.name})`,
    })),
    customData: `<language>${htmlLang[lang]}</language>`,
    trailingSlash: true,
  });
}
