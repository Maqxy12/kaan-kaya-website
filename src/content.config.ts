/**
 * Aufbau der Markdown-Inhalte (Projekte, Blog, Rechtliches).
 * Jede Datei liegt in einem Sprachordner:  .../de/name.md  bzw.  .../en/name.md
 * Das Feld "schluessel" verbindet die deutsche und englische Version miteinander.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projekte = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projekte' }),
  schema: z.object({
    titel: z.string(),
    kurz: z.string(),
    schluessel: z.string(),
    reihenfolge: z.number(),
    kategorie: z.array(z.enum(['web', 'hardware', 'spiel', 'sport'])).min(1),
    visual: z.enum(['website', 'reaktion', 'roboter', 'portfolio', 'timer']),
    app: z.enum(['boxtimer']).optional(),
    rolle: z.string(),
    stack: z.array(z.string()).min(1),
    jahr: z.coerce.string().optional(),
    status: z.string().optional(),
    live: z.url().optional(),
    code: z.url().optional(),
    highlight: z.string().optional(),
    kennzahlen: z.array(z.object({ wert: z.string(), label: z.string() })).default([]),
    spiel: z.boolean().default(false),
    entwurf: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    titel: z.string(),
    beschreibung: z.string(),
    datum: z.coerce.date(),
    schluessel: z.string(),
    tags: z.array(z.string()).default([]),
    entwurf: z.boolean().default(false),
  }),
});

const seiten = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/seiten' }),
  schema: z.object({
    titel: z.string(),
    stand: z.coerce.date(),
  }),
});

export const collections = { projekte, blog, seiten };
