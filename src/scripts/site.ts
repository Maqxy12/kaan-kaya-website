/**
 * Globales Skript (klein gehalten): Farbmodus, Live-Uhr, Kopieren, Tastenkürzel.
 * Befehlspalette und Terminal werden erst beim ersten Öffnen nachgeladen.
 */
export interface SiteConfig {
  lang: 'de' | 'en';
  email: string;
  instagram: string;
  zeitzone: string;
  von: number;
  bis: number;
  andereSprache: string;
  cvPdf: string;
  kontakt: string;
  start: string;
  suche: string;
  texte: {
    palette: {
      platzhalter: string;
      keine_treffer: string;
      gruppen: Record<'seiten' | 'projekte' | 'blog' | 'aktionen', string>;
      aktionen: Record<'email' | 'theme' | 'sprache' | 'terminal' | 'spiel' | 'pdf' | 'instagram', string>;
      hinweise: Record<'navigieren' | 'oeffnen' | 'schliessen', string>;
    };
    kopiert: string;
    erreichbar: string;
    offline: string;
    ortszeit: string;
  };
}

export const config: SiteConfig = JSON.parse(document.getElementById('site-config')?.textContent || '{}');
const root = document.documentElement;

/* ── Ansagen für Screenreader ── */
const announcer = Object.assign(document.createElement('div'), { className: 'sr-only' });
announcer.setAttribute('aria-live', 'polite');
document.body.append(announcer);
export const announce = (msg: string) => {
  announcer.textContent = '';
  requestAnimationFrame(() => (announcer.textContent = msg));
};

/* ── Farbmodus ── */
const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* privater Modus – egal */
    }
  },
};
const syncThemeColor = () => {
  const bg = getComputedStyle(document.body).backgroundColor;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => (m.content = bg));
};
export const toggleTheme = () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  const apply = () => {
    root.dataset.theme = next;
    store.set('theme', next);
    syncThemeColor();
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.startViewTransition && !reduce) document.startViewTransition(apply);
  else apply();
};
document.addEventListener('click', (e) => {
  if ((e.target as Element).closest('[data-theme-toggle]')) toggleTheme();
});
matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
  if (!store.get('theme')) {
    root.dataset.theme = e.matches ? 'light' : 'dark';
    syncThemeColor();
  }
});
if (store.get('theme')) syncThemeColor();

/* ── Live-Uhr & Erreichbarkeit ── */
const zeitFormat = new Intl.DateTimeFormat(config.lang === 'de' ? 'de-CH' : 'en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: config.zeitzone,
});
const stundeFormat = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: config.zeitzone });
export const erreichbar = () => {
  const h = Number(stundeFormat.format(new Date()));
  return h >= config.von && h < config.bis;
};
const tick = () => {
  const now = new Date();
  const zeit = zeitFormat.format(now);
  const ok = erreichbar();
  document.querySelectorAll<HTMLElement>('[data-clock]').forEach((el) => {
    el.textContent = zeit;
    el.setAttribute('datetime', now.toISOString());
  });
  document.querySelectorAll<HTMLElement>('[data-status]').forEach((el) => {
    el.dataset.available = String(ok);
    // Sichtbarer Text steht vorne (WCAG 2.5.3 „Label in Name“)
    const sichtbar = [...el.children].map((c) => c.textContent?.trim()).filter(Boolean).join(' ');
    if (el.matches('a')) el.setAttribute('aria-label', `${sichtbar} – ${config.texte.ortszeit}, ${ok ? config.texte.erreichbar : config.texte.offline}`);
    el.title = ok ? config.texte.erreichbar : config.texte.offline;
  });
  document.querySelectorAll<HTMLElement>('[data-status-text]').forEach((el) => {
    el.textContent = ok ? config.texte.erreichbar : config.texte.offline;
  });
};
tick();
setInterval(tick, 20_000);

/* ── Kopieren (z. B. E-Mail-Adresse) ── */
export const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  announce(config.texte.kopiert);
};
document.addEventListener('click', async (e) => {
  const btn = (e.target as Element).closest<HTMLElement>('[data-copy]');
  if (!btn) return;
  e.preventDefault();
  await copy(btn.dataset.copy!);
  const label = btn.querySelector<HTMLElement>('[data-copy-label]');
  if (label) {
    const vorher = label.textContent;
    label.textContent = config.texte.kopiert;
    btn.dataset.copied = 'true';
    setTimeout(() => {
      label.textContent = vorher;
      delete btn.dataset.copied;
    }, 1800);
  }
});

/* ── Befehlspalette & Terminal (werden bei Bedarf nachgeladen) ── */
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
if (!isMac) document.querySelectorAll('[data-mod]').forEach((el) => (el.textContent = 'Ctrl'));

export const openPalette = async () => (await import('./palette')).open();
export const openTerminal = async () => (await import('./terminal')).open();

document.addEventListener('click', (e) => {
  const el = e.target as Element;
  if (el.closest('[data-palette-open]')) openPalette();
  if (el.closest('[data-terminal-open]')) openTerminal();
  if (el.closest('[data-print]')) window.print();
});

const tippt = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openPalette();
    return;
  }
  if (tippt(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
  if (document.querySelector('dialog[open]')) return;
  if (e.key === '/') {
    e.preventDefault();
    openPalette();
  } else if (e.key === '`' || e.key === '§' || e.code === 'Backquote') {
    e.preventDefault();
    openTerminal();
  }
});

/* Vorladen, sobald der Nutzer in die Nähe der Suche kommt */
document.querySelector('[data-palette-open]')?.addEventListener('pointerenter', () => import('./palette'), { once: true });
