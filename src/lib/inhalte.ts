/** Zugriff auf Projekte, Blogbeiträge und Seiten – nach Sprache gefiltert und sortiert. */
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './i18n';

export type Projekt = CollectionEntry<'projekte'>;
export type Beitrag = CollectionEntry<'blog'>;

const sprache = (id: string) => id.split('/')[0] as Lang;
export const slug = (id: string) => id.split('/').slice(1).join('/');

export async function projekte(lang: Lang): Promise<Projekt[]> {
  const alle = await getCollection('projekte', (p) => sprache(p.id) === lang && !p.data.entwurf);
  return alle.sort((a, b) => a.data.reihenfolge - b.data.reihenfolge);
}

export async function beitraege(lang: Lang): Promise<Beitrag[]> {
  const alle = await getCollection('blog', (b) => sprache(b.id) === lang && !b.data.entwurf);
  return alle.sort((a, b) => b.data.datum.getTime() - a.data.datum.getTime());
}

/** Findet die Übersetzung eines Eintrags über den gemeinsamen "schluessel". */
export async function gegenstueck<C extends 'projekte' | 'blog'>(
  collection: C,
  schluessel: string,
  lang: Lang,
) {
  const alle = await getCollection(collection);
  return alle.find(
    (e) => sprache(e.id) === lang && (e.data as { schluessel: string }).schluessel === schluessel,
  );
}

/** Geschätzte Lesezeit in Minuten (≈ 220 Wörter pro Minute). */
export const lesezeit = (text = '') =>
  Math.max(1, Math.round(text.trim().split(/\s+/).length / 220));
