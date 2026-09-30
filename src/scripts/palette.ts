/**
 * Befehlspalette (⌘K / Ctrl+K): Seiten, Projekte, Beiträge und Aktionen durchsuchen.
 * Barrierefrei als Combobox + Listbox umgesetzt, komplett per Tastatur bedienbar.
 */
import { config, toggleTheme, copy, openTerminal } from './site';

interface Item {
  gruppe: 'seiten' | 'projekte' | 'blog' | 'aktionen';
  titel: string;
  text?: string;
  url?: string;
  icon: string;
  tags?: string;
  aktion?: () => void;
}
interface Index {
  items: Item[];
  icons: Record<string, string>;
}

const T = config.texte.palette;
let dialog: HTMLDialogElement | null = null;
let input: HTMLInputElement;
let list: HTMLUListElement;
let data: Index | null = null;
let treffer: Item[] = [];
let aktiv = 0;

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const aktionen = (): Item[] => [
  { gruppe: 'aktionen', titel: T.aktionen.email, text: config.email, icon: 'mail', aktion: () => copy(config.email) },
  { gruppe: 'aktionen', titel: T.aktionen.theme, icon: 'sun-moon', aktion: toggleTheme },
  { gruppe: 'aktionen', titel: T.aktionen.sprache, icon: 'languages', url: config.andereSprache },
  { gruppe: 'aktionen', titel: T.aktionen.terminal, icon: 'terminal', aktion: () => setTimeout(openTerminal, 50) },
  { gruppe: 'aktionen', titel: T.aktionen.spiel, icon: 'gamepad-2', url: `${config.start}#reaktion` },
  { gruppe: 'aktionen', titel: T.aktionen.pdf, icon: 'download', url: config.cvPdf },
  ...(config.instagram
    ? [{ gruppe: 'aktionen' as const, titel: T.aktionen.instagram, icon: 'instagram', url: config.instagram }]
    : []),
];

function suchen(q: string): Item[] {
  const alle = [...(data?.items ?? []), ...aktionen()];
  const woerter = norm(q).split(/\s+/).filter(Boolean);
  if (!woerter.length) return alle;
  return alle
    .map((item) => {
      const titel = norm(item.titel);
      const rest = norm(`${item.text ?? ''} ${item.tags ?? ''}`);
      let score = 0;
      for (const w of woerter) {
        if (titel.startsWith(w)) score += 6;
        else if (titel.includes(w)) score += 4;
        else if (rest.includes(w)) score += 1;
        else return { item, score: 0 };
      }
      return { item, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.item);
}

const svg = (name: string) =>
  `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">${data?.icons[name] ?? ''}</svg>`;

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function render() {
  treffer = suchen(input.value);
  aktiv = Math.min(aktiv, Math.max(0, treffer.length - 1));
  if (!treffer.length) {
    list.innerHTML = `<li class="pal-empty" role="presentation">${escape(T.keine_treffer)}</li>`;
    input.removeAttribute('aria-activedescendant');
    return;
  }
  const gruppiert = input.value.trim() === '';
  let html = '';
  let letzte = '';
  treffer.forEach((item, i) => {
    if (gruppiert && item.gruppe !== letzte) {
      html += `<li class="pal-group" role="presentation">${escape(T.gruppen[item.gruppe])}</li>`;
      letzte = item.gruppe;
    }
    html += `<li id="pal-opt-${i}" role="option" class="pal-opt" data-i="${i}" aria-selected="${i === aktiv}">
      <span class="pal-icon">${svg(item.icon)}</span>
      <span class="pal-text"><span class="pal-title">${escape(item.titel)}</span>${
        item.text ? `<span class="pal-sub">${escape(item.text)}</span>` : ''
      }</span>
      <span class="pal-enter" aria-hidden="true">${svg('corner-down-left')}</span>
    </li>`;
  });
  list.innerHTML = html;
  markieren();
}

function markieren() {
  list.querySelectorAll('[role="option"]').forEach((el) => {
    const on = Number((el as HTMLElement).dataset.i) === aktiv;
    el.setAttribute('aria-selected', String(on));
    if (on) {
      input.setAttribute('aria-activedescendant', el.id);
      el.scrollIntoView({ block: 'nearest' });
    }
  });
}

function ausfuehren(item: Item | undefined) {
  if (!item) return;
  dialog?.close();
  if (item.aktion) item.aktion();
  else if (item.url) {
    if (/^https?:/.test(item.url)) window.open(item.url, '_blank', 'noopener');
    else location.href = item.url;
  }
}

function bauen() {
  dialog = document.createElement('dialog');
  dialog.className = 'palette';
  dialog.setAttribute('aria-label', T.platzhalter);
  dialog.innerHTML = `
    <div class="pal-box">
      <div class="pal-search">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></g></svg>
        <input type="text" role="combobox" aria-expanded="true" aria-controls="pal-list" aria-autocomplete="list"
          autocomplete="off" spellcheck="false" placeholder="${escape(T.platzhalter)}" aria-label="${escape(T.platzhalter)}" />
        <kbd class="pal-esc">esc</kbd>
      </div>
      <ul id="pal-list" role="listbox" class="pal-list" aria-label="${escape(T.platzhalter)}"></ul>
      <div class="pal-foot" aria-hidden="true">
        <span><kbd>↑</kbd><kbd>↓</kbd> ${escape(T.hinweise.navigieren)}</span>
        <span><kbd>↵</kbd> ${escape(T.hinweise.oeffnen)}</span>
        <span><kbd>esc</kbd> ${escape(T.hinweise.schliessen)}</span>
      </div>
    </div>`;
  document.body.append(dialog);
  input = dialog.querySelector('input')!;
  list = dialog.querySelector('ul')!;

  input.addEventListener('input', () => {
    aktiv = 0;
    render();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      aktiv = (aktiv + 1) % Math.max(1, treffer.length);
      markieren();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      aktiv = (aktiv - 1 + treffer.length) % Math.max(1, treffer.length);
      markieren();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      ausfuehren(treffer[aktiv]);
    }
  });
  list.addEventListener('click', (e) => {
    const opt = (e.target as Element).closest<HTMLElement>('[role="option"]');
    if (opt) ausfuehren(treffer[Number(opt.dataset.i)]);
  });
  list.addEventListener('pointermove', (e) => {
    const opt = (e.target as Element).closest<HTMLElement>('[role="option"]');
    if (opt && Number(opt.dataset.i) !== aktiv) {
      aktiv = Number(opt.dataset.i);
      markieren();
    }
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('overlay-open');
  });
}

export async function open() {
  if (!dialog) bauen();
  if (dialog!.open) return;
  document.documentElement.classList.add('overlay-open');
  dialog!.showModal();
  input.value = '';
  aktiv = 0;
  if (!data) {
    try {
      data = await (await fetch(config.suche)).json();
    } catch {
      data = { items: [], icons: {} };
    }
  }
  render();
  input.focus();
}
