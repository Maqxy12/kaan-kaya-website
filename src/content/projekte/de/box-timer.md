---
titel: Box-Timer
kurz: Ein Rundentimer fürs Boxtraining – mit Gong, 10-Sekunden-Warnung und Bildschirm, der während des Trainings anbleibt.
schluessel: boxtimer
reihenfolge: 2
kategorie: [web, sport]
visual: timer
app: boxtimer
rolle: Idee & Konzept – umgesetzt mit KI-Unterstützung
stack: [TypeScript, Web Audio API, Wake Lock API, CSS]
jahr: 2026
status: Live – kostenlos nutzbar
highlight: Im eigenen Training im Einsatz
---

## Die Idee

Im Boxtraining läuft alles in Runden: meistens 3 Minuten Kampf, 1 Minute Pause. Viele Timer-Apps sind voller Werbung oder unnötig kompliziert. Ich wollte einen Timer, der genau das kann, was ich im Training brauche – nicht mehr und nicht weniger.

## Was er kann

- **Runden, Rundenzeit, Pause und Vorbereitung** frei einstellen – die Einstellungen bleiben gespeichert
- **Gong** zum Start jeder Runde, **dreifacher Gong** zum Rundenende
- **Warnsignal 10 Sekunden vor Rundenende** – wie im echten Sparring
- **Countdown-Piepen** in den letzten 3 Sekunden jeder Pause
- **Farben je Phase:** grün in der Runde, orange in den letzten 10 Sekunden, blau in der Pause
- **Bildschirm bleibt an**, solange der Timer läuft
- **Vollbild** und Vibration auf dem Handy

## Die Technik dahinter

- **Keine Audiodateien:** Gong, Warnsignal und Piepen werden mit der Web Audio API live im Browser erzeugt. Die Seite bleibt dadurch winzig.
- **Genaue Zeit:** Der Timer rechnet mit Zeitstempeln statt einfach runterzuzählen. So bleibt er auch genau, wenn das Handy kurz hängt.
- **Wake Lock API:** verhindert, dass der Bildschirm mitten in der Runde ausgeht.
- **Kostenlos und ohne Werbung** – für alle, die trainieren.
