# Deine Website – Anleitung

So änderst, erweiterst und veröffentlichst du deine Website. Für Texte brauchst du **keine Programmierkenntnisse**: Alles Wichtige steht in einfachen Textdateien.

---

## 1. Wo steht was?

| Was du ändern willst | Datei |
|---|---|
| E-Mail, Instagram, GitHub, LinkedIn, Erreichbarkeit | `src/content/profil.yaml` |
| **Alle deutschen Texte** (Startseite, Skills, Kontakt, FAQ, Jetzt, Lebenslauf …) | `src/content/texte/de.yaml` |
| **Alle englischen Texte** | `src/content/texte/en.yaml` |
| Projekte (Case Studies) | `src/content/projekte/de/*.md` und `…/en/*.md` |
| Blogbeiträge | `src/content/blog/de/*.md` und `…/en/*.md` |
| Datenschutzerklärung | `src/content/seiten/de/datenschutz.md` und `…/en/privacy.md` |
| Dein Foto | `src/assets/profil.jpg` (siehe unten) |
| Farben, Schriften, Abstände | `src/styles/global.css` (ganz oben) |

**Regeln für die `.yaml`-Dateien:**
- Ändere nur den Text **rechts** vom Doppelpunkt.
- Steht im Text ein Doppelpunkt mit Leerzeichen danach (`Ziel: …`), setze ihn in `"Anführungszeichen"`.
- Die Einrückung (Leerzeichen am Zeilenanfang) muss gleich bleiben.
- Schweizer Rechtschreibung: `ss` statt `ß`.

Machst du einen Fehler, stoppt der Build mit einer **deutschen Meldung**, die genau sagt, was fehlt. Eine kaputte Seite geht so nie online.

---

## 2. Die Website auf deinem Computer ansehen

Einmalig (installiert alles Nötige):

```bash
npm install
```

Danach jedes Mal:

```bash
npm run dev
```

Öffne **http://localhost:4321**. Jede Änderung an einer Datei siehst du sofort im Browser.

---

## 3. Häufige Aufgaben

### Foto einfügen
Leg ein quadratisches Foto (mind. 800 × 800 px) als `src/assets/profil.jpg` ab. Fertig: Die Website ersetzt das Monogramm automatisch und optimiert das Bild (AVIF/WebP). Das Foto erscheint dann auf der Startseite, im Blog, im Lebenslauf (Seite **und** PDF), auf den Vorschaubildern für WhatsApp & Co. und in den Daten für Google. Willst du ein neues Foto, ersetzt du einfach diese eine Datei.

### Neues Projekt hinzufügen
1. Kopiere `src/content/projekte/de/roboter.md` und gib der Kopie einen neuen Namen, z. B. `wetter-app.md`. Der Dateiname wird zur Adresse: `/projekte/wetter-app/`.
2. Passe oben den Bereich zwischen den `---` an:
   - `schluessel`: ein eindeutiges Wort, **in DE und EN gleich** (verbindet die Übersetzungen)
   - `reihenfolge`: Position in der Liste (1 = ganz oben)
   - `kategorie`: `[web]`, `[hardware]`, `[spiel]` (auch mehrere)
   - `visual`: eine der Illustrationen `website`, `reaktion`, `roboter`, `portfolio`
   - optional `live: https://…` und `code: https://github.com/…` für Buttons
3. Darunter schreibst du die Case Study (siehe Markdown unten).
4. Mach dasselbe auf Englisch in `src/content/projekte/en/`.

### Neuer Blogbeitrag
Kopiere `src/content/blog/de/hallo-welt.md`, ändere `titel`, `beschreibung`, `datum` (Format `2026-10-15`) und `schluessel`. Den Text schreibst du darunter. Mit `entwurf: true` bleibt der Beitrag unsichtbar, bis du ihn fertig hast.

### Seite „Jetzt“ aktualisieren
Texte in `de.yaml` / `en.yaml` unter `jetzt:` ändern und in `profil.yaml` das Datum `jetzt_aktualisiert` anpassen.

### Skill-Stufen ändern
In `de.yaml` / `en.yaml` unter `skills: → gruppen:` die Zahl bei `stufe` ändern: `0` = als Nächstes, `1` = Grundlagen, `2` = Anwendung, `3` = sicher.

### Markdown (für Projekte und Blog)
```
## Zwischenüberschrift
Normaler Text. **fett** und [Link](https://beispiel.ch)
- Aufzählungspunkt
```

---

## 4. Veröffentlichen

Deine Website läuft unter **https://kaankaya.netlify.app** (Netlify-Projekt „kaankaya“).

### Variante A: Automatisch über GitHub (empfohlen)
Einmal einrichten:
1. Installiere **GitHub Desktop** (desktop.github.com) und melde dich mit deinem GitHub-Konto an.
2. **File → Add Local Repository** → den Ordner `kaan-kaya-website` wählen → **Publish repository**.
3. In Netlify im Projekt „kaankaya“: **Project configuration → Build & deploy → Continuous deployment → Link repository** → GitHub → `kaan-kaya-website` wählen. Die Einstellungen kommen aus `netlify.toml`.

Danach gilt: Datei ändern → in GitHub Desktop **Commit** und **Push** → nach ca. 1–2 Minuten ist die Seite online.

### Variante B: Von Hand hochladen
`npm run build` ausführen und den Ordner `dist` in Netlify unter **Deploys** in das Feld ganz unten ziehen.

### Kontaktformular
- **Forms → Form detection** muss eingeschaltet sein.
- Benachrichtigung per E-Mail: **Forms → Submission notifications → Add notification → Email notification**.

### Google & Statistik (optional)
In `src/content/profil.yaml`:
- `google_verifizierung`: Code aus der Google Search Console (HTML-Tag-Methode)
- `goatcounter`: dein GoatCounter-Name für die Besucherstatistik (ohne Cookies)

## 5. Was automatisch passiert

Bei jedem Veröffentlichen erzeugt die Website selbst:
- den **Lebenslauf als PDF** (DE + EN) aus deinen Texten,
- **Vorschaubilder** für WhatsApp, LinkedIn & Co. für jede Seite,
- **Sitemap**, **RSS-Feed**, `robots.txt` und `llms.txt` (für Google und KI-Suchen),
- eine **Qualitätsprüfung**: Alle internen Links werden getestet. Ist einer kaputt, wird nicht veröffentlicht.

## 6. Versteckte Extras

- <kbd>⌘</kbd> <kbd>K</kbd> / <kbd>Ctrl</kbd> <kbd>K</kbd> oder <kbd>/</kbd>: Befehlspalette
- Taste links neben der <kbd>1</kbd> (§ auf Schweizer Tastatur): Terminal-Modus, dort `help` tippen
- Hell/Dunkel-Modus oben rechts, Sprache DE/EN daneben
