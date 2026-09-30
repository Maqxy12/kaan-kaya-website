---
titel: Boxing timer
kurz: A round timer for boxing training – with a bell, a 10-second warning and a screen that stays on while you train.
schluessel: boxtimer
reihenfolge: 2
kategorie: [web, sport]
visual: timer
app: boxtimer
rolle: Idea & concept – built with AI assistance
stack: [TypeScript, Web Audio API, Wake Lock API, CSS]
jahr: 2026
status: Live – free to use
highlight: Used in my own training
---

## The idea

Boxing training runs in rounds: usually 3 minutes of work, 1 minute of rest. Many timer apps are full of ads or needlessly complicated. I wanted a timer that does exactly what I need in training – nothing more, nothing less.

## What it does

- **Set rounds, round time, rest and get-ready time** – your settings are saved
- **Bell** at the start of every round, **triple bell** at the end
- **Warning signal 10 seconds before the round ends** – just like in real sparring
- **Countdown beeps** in the last 3 seconds of every rest
- **Colours per phase:** green during the round, orange in the last 10 seconds, blue during rest
- **Screen stays on** while the timer is running
- **Fullscreen** and vibration on phones

## The tech behind it

- **No audio files:** the bell, warning and beeps are generated live in the browser with the Web Audio API. That keeps the page tiny.
- **Accurate time:** the timer works with timestamps instead of simply counting down, so it stays accurate even if the phone lags for a moment.
- **Wake Lock API:** stops the screen from turning off mid-round.
- **Free and ad-free** – for anyone who trains.
