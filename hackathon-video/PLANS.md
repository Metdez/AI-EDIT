# Five plans — Sundai three.js hackathon welcome video

Same 93.4 s voice track and avatar in all five; 1920×1080, 30 fps, HyperFrames + three.js.
Each is a different film, not a reskin. Shared rules are in `BRIEF.md`.

## Beat sheet (from `transcripts/words.json`)

| Time (s) | What is said | Cue words (s) |
| --- | --- | --- |
| 0.0–5.1 | Yo, what's up — welcome to the hackathon | hackathon 3.5 |
| 5.1–10.8 | Shout out to Sundai for bringing us together | Sundai 7.24 |
| 10.8–16.0 | Build something cool, experiment, have fun | |
| 16.0–23.5 | Theme: 3D simulations on the web, three.js and AI | 3D 18.1, AI 22.26 |
| 23.5–30.0 | Real world → figure out how it works → bring it to life in your browser | real 26.46, browser 29.86 |
| 30.0–39.0 | Boston traffic, crazy weather, solar system, a thousand particles | Boston 32.72, weather 34.26, solar 35.6, thousand 36.9 |
| 39.0–44.6 | Be creative — here's the cool part | |
| 43.6–54.2 | AI coding tools: no hours on physics and math, focus on ideas | AI 43.64, physics 47.48 |
| 54.2–58.2 | Never worked with 3D? Totally fine | 3D 54.4 |
| 58.2–63.0 | Learn, try new things, meet people, build what you didn't think you could | |
| 63.0–72.7 | Don't overthink it. Start simple, make it interactive | overthink 65.96, simple 70.66, interactive 71.6 |
| 72.7–78.0 | Talk, share ideas, ask questions, experiment | experiment 78.14 |
| 78.0–85.6 | Walk away with something built, something learned, new friends | friends 85.06 |
| 85.6–93.4 | That's it — thanks Sundai, excited to see what you build | Sundai 88.6 |

## 01 — Pixel Sundae (the Sundai-brand one)
Retro pixel/voxel world in Sundai's own colours (pink, orange, purple on navy), VT323 + Space Mono.
The logo's pixel icons burst out of the sundae and become the voxel particles that build every scene:
a voxel Boston with voxel cars, voxel storm clouds, a chunky solar system. Bubble has a pixel-stepped
border and hops between corners in 8-bit steps. Feels like a game boot screen.

## 02 — Blueprint to Life (the explainer)
"Real world → how it works → in your browser" told literally. Each example starts as a glowing
wireframe blueprint with HUD labels and real numbers (cars/min, orbital periods, wind speed), then
fills in with shaded materials and starts moving. Dark glass cards, corner brackets, mono caps.
A code panel types the few lines of three.js that drive each sim. Bubble docks into glass cards.

## 03 — One Continuous Flight (the cinematic one)
A single unbroken camera move, no cuts: a thousand particles → they condense into a solar system →
dive to Earth → through storm clouds and lightning → down onto Boston streets at night with traffic
light-trails → pull out through a browser window on a desk. Every shot transforms into the next.
Bloom, shallow depth of field, slow drift. Minimal type. Bubble rides along as a small satellite.

## 04 — World Hopper (the world-models one)
The bubble is a traveller. A prompt bar types a world ("a rainy neon city", "a red desert planet"),
a portal opens, and the bubble flies through it into that generated world. One real Gaussian-splat
world fly-through (Spark renderer + a World Labs Marble sample) if it loads; procedural worlds
otherwise. Explains world models in one on-screen line. Portals are the transitions.

## 05 — Type Storm (the fast-cut kinetic one)
Typography first, fastest pacing (a cut every 1–2 s). Huge words built from 3D particles that morph
into the thing being said: TRAFFIC becomes streaming cars, WEATHER dissolves into rain, 1,000 counts
up as particles spawn. Black and white with one pink accent, Archivo Black. Bubble snaps to a new
spot on every sentence and sometimes becomes the dot of an "i" or an "O".
