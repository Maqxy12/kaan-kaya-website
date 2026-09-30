/**
 * Terminal-Modus (Easter Egg): die Website als Kommandozeile.
 * Öffnen mit der Taste links neben der 1 (` / §) oder über die Befehlspalette.
 */
import { config, toggleTheme, copy } from './site';

interface TerminalData {
  name: string;
  rolle: string;
  ort: string;
  intro: string;
  motto: string;
  weg: { zeit: string; titel: string }[];
  skills: { titel: string; eintraege: { name: string; stufe: number; label: string }[] }[];
  sprachen: { sprache: string; niveau: string; stufe: number }[];
  zertifikate: string[];
  jetzt: { titel: string; text: string }[];
  freizeit: string[];
  werte: string[];
  projekte: { titel: string; url: string }[];
  seiten: Record<string, string>;
}

const de = config.lang === 'de';
const L = de
  ? {
      willkommen: 'Willkommen im Terminal von Kaan Kaya.',
      hilfeTipp: "Tippe 'help' für alle Befehle. 'exit' oder Esc schliesst das Terminal.",
      unbekannt: (c: string) => `Befehl nicht gefunden: ${c}. Tippe 'help'.`,
      befehle: 'Verfügbare Befehle',
      kopiert: 'E-Mail-Adresse in die Zwischenablage kopiert.',
      oeffne: 'Öffne',
      themeOk: 'Farbmodus gewechselt.',
      sudo: 'Netter Versuch. Aber hier bin ich der Admin. 🥊',
      hire: 'Gute Wahl. Schreib mir: ',
      ziel: 'Ziel: Schweizer Meister (Amateure).',
      kontakt: 'Kontakt',
      laden: 'Lade Daten …',
    }
  : {
      willkommen: "Welcome to Kaan Kaya's terminal.",
      hilfeTipp: "Type 'help' for all commands. 'exit' or Esc closes the terminal.",
      unbekannt: (c: string) => `Command not found: ${c}. Type 'help'.`,
      befehle: 'Available commands',
      kopiert: 'Email address copied to clipboard.',
      oeffne: 'Opening',
      themeOk: 'Colour mode switched.',
      sudo: "Nice try. But I'm the admin here. 🥊",
      hire: 'Good choice. Write to me: ',
      ziel: 'Goal: Swiss amateur champion.',
      kontakt: 'Contact',
      laden: 'Loading data …',
    };

const HILFE: [string, string, string][] = [
  ['help', 'Diese Übersicht', 'This overview'],
  ['whoami', 'Wer ist Kaan?', 'Who is Kaan?'],
  ['about', 'Die Geschichte in Kurzform', 'The story in short'],
  ['journey', 'Mein Weg als Zeitstrahl', 'My journey as a timeline'],
  ['skills', 'Skills & Stufen', 'Skills & levels'],
  ['languages', 'Sprachen', 'Languages'],
  ['projects', 'Alle Projekte', 'All projects'],
  ['now', 'Woran ich gerade arbeite', "What I'm working on"],
  ['hobbies', 'Ausserhalb vom Code', 'Beyond code'],
  ['contact', 'Kontaktmöglichkeiten', 'Ways to reach me'],
  ['email', 'E-Mail-Adresse kopieren', 'Copy email address'],
  ['cv', 'Lebenslauf als PDF', 'CV as PDF'],
  ['open <seite>', 'Seite öffnen (z. B. open projekte)', 'Open a page (e.g. open projects)'],
  ['theme', 'Hell/Dunkel umschalten', 'Toggle light/dark'],
  ['lang', 'Sprache wechseln', 'Switch language'],
  ['game', 'Reaktionstest starten', 'Start reaction test'],
  ['timer', 'Box-Timer öffnen', 'Open boxing timer'],
  ['punch', '🥊', '🥊'],
  ['clear', 'Bildschirm leeren', 'Clear screen'],
  ['exit', 'Terminal schliessen', 'Close terminal'],
];
const BEFEHLE = [...HILFE.map((h) => h[0].split(' ')[0]), 'sudo', 'hire', 'date', 'echo', 'ls', 'history'];

const SEITEN_ALIAS: Record<string, string> = {
  home: 'start', start: 'start', about: 'start', ueber: 'start', über: 'start',
  projects: 'projekte', projekte: 'projekte', project: 'projekte',
  skills: 'skills', blog: 'blog', now: 'jetzt', jetzt: 'jetzt',
  cv: 'lebenslauf', lebenslauf: 'lebenslauf', resume: 'lebenslauf',
  contact: 'kontakt', kontakt: 'kontakt', privacy: 'datenschutz', datenschutz: 'datenschutz',
  timer: 'boxtimer', 'box-timer': 'boxtimer',
};

let dialog: HTMLDialogElement | null = null;
let out: HTMLElement;
let input: HTMLInputElement;
let data: TerminalData | null = null;
const verlauf: string[] = [];
let pos = 0;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function print(html: string, cls = '') {
  const line = document.createElement('div');
  line.className = `t-line ${cls}`;
  line.innerHTML = html;
  out.append(line);
  out.scrollTop = out.scrollHeight;
}
const balken = (n: number, max: number) => '█'.repeat(n) + '░'.repeat(max - n);

const POW = String.raw`
  ____   ___  __        __ _
 |  _ \ / _ \ \ \      / /| |
 | |_) | | | | \ \ /\ / / | |
 |  __/| |_| |  \ V  V /  |_|
 |_|    \___/    \_/\_/   (_)`;

function oeffnen(url: string) {
  print(`${L.oeffne} <span class="t-accent">${esc(url)}</span> …`);
  setTimeout(() => {
    if (/^https?:/.test(url)) window.open(url, '_blank', 'noopener');
    else location.href = url;
  }, 350);
}

function ausfuehren(zeile: string) {
  const [cmd = '', ...args] = zeile.trim().split(/\s+/);
  const c = cmd.toLowerCase();
  if (!data && c !== 'clear' && c !== 'exit') return print(L.laden, 't-dim');
  const d = data!;
  switch (c) {
    case '':
      return;
    case 'help':
    case '?':
      print(`<span class="t-head">${L.befehle}</span>`);
      HILFE.forEach(([name, deText, enText]) =>
        print(`<span class="t-cmd">${esc(name.padEnd(14))}</span><span class="t-dim">${esc(de ? deText : enText)}</span>`),
      );
      return;
    case 'whoami':
      print(`<span class="t-head">${esc(d.name)}</span> — ${esc(d.rolle)}`);
      print(`📍 ${esc(d.ort)}`, 't-dim');
      return;
    case 'about':
      print(esc(d.intro));
      print(`„${esc(d.motto)}“`, 't-dim');
      return;
    case 'journey':
    case 'weg':
    case 'timeline':
      d.weg.forEach((w) => print(`<span class="t-accent">${esc(w.zeit.padEnd(14))}</span>${esc(w.titel)}`));
      return;
    case 'skills':
      d.skills.forEach((g) => {
        print(`<span class="t-head">${esc(g.titel)}</span>`);
        g.eintraege.forEach((e) =>
          print(`  ${esc(e.name.padEnd(30))}<span class="t-bar">${balken(e.stufe, 3)}</span>  <span class="t-dim">${esc(e.label)}</span>`),
        );
      });
      return;
    case 'languages':
    case 'sprachen':
      d.sprachen.forEach((s) =>
        print(`${esc(s.sprache.padEnd(14))}<span class="t-bar">${balken(s.stufe, 5)}</span>  <span class="t-dim">${esc(s.niveau)}</span>`),
      );
      print(`<span class="t-dim">${esc(d.zertifikate.join(' · '))}</span>`);
      return;
    case 'projects':
    case 'projekte':
    case 'ls':
      d.projekte.forEach((p, i) =>
        print(`<span class="t-dim">${String(i + 1).padStart(2, '0')}</span>  <a class="t-link" href="${esc(p.url)}">${esc(p.titel)}</a>`),
      );
      return;
    case 'now':
    case 'jetzt':
      d.jetzt.forEach((j) => print(`<span class="t-accent">${esc(j.titel.padEnd(14))}</span>${esc(j.text)}`));
      return;
    case 'hobbies':
      print(esc(d.freizeit.join(' · ')));
      print(L.ziel, 't-dim');
      return;
    case 'contact':
    case 'kontakt':
      print(`<span class="t-head">${L.kontakt}</span>`);
      print(`✉  <a class="t-link" href="mailto:${esc(config.email)}">${esc(config.email)}</a>`);
      if (config.instagram) print(`◎  <a class="t-link" href="${esc(config.instagram)}" target="_blank" rel="noopener">${esc(config.instagram)}</a>`);
      print(`→  <a class="t-link" href="${esc(config.kontakt)}">${esc(config.kontakt)}</a>`);
      return;
    case 'email':
      copy(config.email);
      return print(`${L.kopiert} <span class="t-accent">${esc(config.email)}</span>`);
    case 'cv':
      return oeffnen(config.cvPdf);
    case 'open':
    case 'cd': {
      const ziel = SEITEN_ALIAS[(args[0] ?? '').toLowerCase()];
      if (!ziel) return print(Object.keys(d.seiten).join('  '), 't-dim');
      return oeffnen(d.seiten[ziel]);
    }
    case 'theme':
      toggleTheme();
      return print(L.themeOk);
    case 'lang':
      return oeffnen(config.andereSprache);
    case 'timer':
      return oeffnen(d.seiten.boxtimer);
    case 'game':
      dialog?.close();
      return oeffnen(`${config.start}#reaktion`);
    case 'punch':
    case 'box':
      print(`<pre class="t-pre t-logo">${esc(POW)}</pre>`);
      return print('🥊', 't-accent');
    case 'sudo':
      return print(L.sudo, 't-accent');
    case 'hire':
      return print(`${L.hire}<a class="t-link" href="mailto:${esc(config.email)}">${esc(config.email)}</a>`);
    case 'date':
      return print(new Date().toLocaleString(de ? 'de-CH' : 'en-GB', { timeZone: config.zeitzone }));
    case 'echo':
      return print(esc(args.join(' ')));
    case 'history':
      return verlauf.forEach((v, i) => print(`<span class="t-dim">${i + 1}</span>  ${esc(v)}`));
    case 'clear':
      out.innerHTML = '';
      return;
    case 'exit':
    case 'quit':
      dialog?.close();
      return;
    default:
      print(esc(L.unbekannt(cmd)), 't-err');
  }
}

function bauen() {
  dialog = document.createElement('dialog');
  dialog.className = 'terminal';
  dialog.setAttribute('aria-label', 'Terminal');
  dialog.innerHTML = `
    <div class="t-window">
      <div class="t-bar-top">
        <span class="t-dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="t-title">kaan@zug: ~</span>
        <button type="button" class="t-close" aria-label="${de ? 'Terminal schliessen' : 'Close terminal'}">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="t-out" role="log" aria-live="polite"></div>
      <form class="t-form">
        <label class="t-prompt" for="t-input">kaan@zug:~$</label>
        <input id="t-input" class="t-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="send" />
      </form>
    </div>`;
  document.body.append(dialog);
  out = dialog.querySelector('.t-out')!;
  input = dialog.querySelector('input')!;

  dialog.querySelector('.t-close')!.addEventListener('click', () => dialog!.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog!.close();
    else if (!(e.target as Element).closest('a, button')) input.focus();
  });
  dialog.addEventListener('close', () => document.documentElement.classList.remove('overlay-open'));
  dialog.querySelector('form')!.addEventListener('submit', (e) => {
    e.preventDefault();
    const zeile = input.value;
    print(`<span class="t-prompt">kaan@zug:~$</span> ${esc(zeile)}`, 't-echo');
    if (zeile.trim()) {
      verlauf.push(zeile);
      pos = verlauf.length;
    }
    input.value = '';
    ausfuehren(zeile);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && verlauf.length) {
      e.preventDefault();
      pos = Math.max(0, pos - 1);
      input.value = verlauf[pos] ?? '';
    } else if (e.key === 'ArrowDown' && verlauf.length) {
      e.preventDefault();
      pos = Math.min(verlauf.length, pos + 1);
      input.value = verlauf[pos] ?? '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const v = input.value.toLowerCase();
      const passend = BEFEHLE.filter((b) => b.startsWith(v));
      if (passend.length === 1) input.value = passend[0] + ' ';
      else if (passend.length > 1) print(passend.join('  '), 't-dim');
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      out.innerHTML = '';
    }
  });

  print(`<pre class="t-pre t-logo">${esc(String.raw` _  __    _        _     _   _
| |/ /   / \      / \   | \ | |
| ' /   / _ \    / _ \  |  \| |
| . \  / ___ \  / ___ \ | |\  |
|_|\_\/_/   \_\/_/   \_\|_| \_|`)}</pre>`);
  print(L.willkommen, 't-head');
  print(L.hilfeTipp, 't-dim');
}

export async function open() {
  if (!dialog) bauen();
  if (dialog!.open) return;
  document.documentElement.classList.add('overlay-open');
  dialog!.showModal();
  input.focus();
  if (!data) {
    try {
      data = (await (await fetch(config.suche)).json()).terminal;
    } catch {
      /* offline */
    }
  }
}
