# kaankaya.netlify.app

Personal website of **Kaan Kaya** – aspiring software engineer from Zug, Switzerland.
Bilingual (DE/EN), fast, accessible and built to be edited without touching code.

**Live:** https://kaankaya.netlify.app

## Highlights

- **Lighthouse 100 / 100 / 100 / 100** (mobile) – performance, accessibility, best practices, SEO
- **Bilingual** with localised URLs, `hreflang`, structured data (schema.org) and generated social preview images
- **Command palette** (⌘K / Ctrl+K) and a hidden **terminal mode** (key left of `1`)
- **Reaction game** and a **boxing round timer** (Web Audio API, Wake Lock API)
- **CV as PDF**, generated at build time from the same content files
- **Contact form** via Netlify Forms with honeypot spam protection
- **No cookies, no tracking**, self-hosted fonts, strict Content Security Policy
- **Quality gate:** every build checks all internal links, titles and headings

## Tech

[Astro](https://astro.build) · TypeScript · plain CSS (custom design system) · Netlify

## Structure

```
src/content/profil.yaml        contact details & settings
src/content/texte/de.yaml      all German texts
src/content/texte/en.yaml      all English texts
src/content/projekte/          case studies (Markdown)
src/content/blog/              blog posts (Markdown)
src/components/                UI components
src/styles/global.css          design tokens & global styles
```

## Development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production build in dist/ + quality check
```

Anleitung auf Deutsch: [ANLEITUNG.md](ANLEITUNG.md)
