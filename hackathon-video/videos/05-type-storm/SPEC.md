# 05 — Type Storm · SPEC

93.4 s · 1920×1080 · 30 fps · voice `assets/voice.m4a` from 0.

## Look (numbers, not adjectives)
- Ground #050505. Ink white (linear 0.9). One accent: pink #EC8796, on ≤ 1 word per shot. Archivo Black for all type; JetBrains Mono 700 only for the code block; Space Mono for one label.
- One swarm of 22,000 three.js points (one canvas, one `THREE.Points`) is every picture in the film. Each shot is a target shape; a cut = the swarm morphs into the next target in 0.40 s + up to 0.22 s per-point stagger (cubic in-out), with a 0.9-unit sideways bulge and up to 1.5 units toward camera mid-flight. No cross dissolves anywhere.
- Words: sampled from Archivo Black drawn on a 2D canvas (2 px step), fit to ≤ 1250 px wide, cap height ≤ 330 px, centred at (960, 500). Big-bubble shots: centred at x 740, ≤ 1000 px wide.
- Camera: perspective fov 30, z = 20.15 (1 world unit = 100 px on z = 0), always drifting ±0.35 / ±0.2 units; 2,500 background dust points give parallax. Bloom only above 0.82 luminance (white words glow, pink does not).
- Bubble: one `<video>` in a circle, white 6 px rim. Snaps (0.35 s power4.inOut) to a new spot on every sentence. Corners: TR (1660,210) TL (260,210) BR (1660,870) BL (260,870), Ø 230. Big (Ø 460–520) only 0–4.2 s and 85.6–93.4 s. Three times it *is* the letter O: YO (0 s), COOL (42.4 s), GOES (72.4 s) — a 30 px white ring fades on so it reads as a letter.
- Callouts: one group at a time, 58 px Archivo Black on a black box (rgba 8,8,8,.82), bottom 120 px, words slide up 0.32 s power3.out 60 ms apart, leave by sliding up 0.16 s. Never under the bubble (≤ 1100 px wide, centred; bubble lives at x < 375 or x > 1545 when small).

## Shots (start = morph start; words land ~0.4 s later, on the spoken word)
| # | Start | Particles become | Bubble | Callout / HTML |
|---|---|---|---|---|
| 1 | 0.00 | scatter → **Y** + bubble = O | O of YO, Ø≈410 | — |
| 2 | 0.70 | **EVERYONE** (x 740) | big right (1490,540) Ø460 | — |
| 3 | 2.55 | **WELCOME** | big right | — |
| 4 | 3.25 | **HACKATHON** (pink) | → TR at 4.22 | SUPER EXCITED 4.22 |
| 5 | 5.00 | crowd: 7 rows of dot-people, heads bobbing | TR | EVERYONE HERE 5.14 |
| 6 | 6.05 | **SHOUT OUT** | TR | — |
| 7 | 7.05 | ring orbiting the Sundai logo | TR | Sundai logo 7.2–8.4 (zooms through) |
| 8 | 8.00 | **TOGETHER** | → BL 9.10 | — |
| 9 | 9.30 | **TODAY** | BL | — |
| 10 | 10.55 | 4×4×4 voxel cube builds layer by layer | BL | SOMETHING COOL 11.32 |
| 11 | 12.05 | **EXPERIMENT** | BL | — |
| 12 | 13.00 | light bulb, pink filament | BL | NEW IDEAS 13.16 |
| 13 | 14.80 | **FUN** (pink, letters hop) | → TR 16.02 | — |
| 14 | 16.20 | **THE THEME** | TR | — |
| 15 | 17.85 | **3D** with real depth; camera orbits −32°→+32° | TR | SIMULATIONS 18.62 |
| 16 | 19.50 | browser window with sine-wave rows inside | TR | ON THE WEB 19.72 |
| 17 | 20.90 | **three.js** | TR | — |
| 18 | 22.05 | **AI** (pink) | → BR 22.98 | — |
| 19 | 23.30 | one simple ball | BR | PRETTY SIMPLE 23.46 |
| 20 | 24.50 | **THINK** | → TL 24.66 | — |
| 21 | 26.20 | spinning dot globe (land bright, sea dim) | TL | REAL WORLD 26.46 |
| 22 | 27.00 | two meshing gears | TL | HOW IT WORKS 27.18 |
| 23 | 28.60 | browser window with the globe inside | TL | BRING IT TO LIFE / IN YOUR BROWSER |
| 24 | 30.40 | **SIMULATE** | → TR 30.56 | — |
| 25 | 31.70 | **TRAFFIC** | TR | — |
| 26 | 32.55 | TRAFFIC streams down onto a street grid: 5,500 cars with light trails (white one way, pink the other); 96 buildings rise; camera tilts overhead | TR | BOSTON 32.72 |
| 27 | 33.75 | **WEATHER** (camera back to front) | TR | — |
| 28 | 34.45 | WEATHER dissolves into rain; lightning bolt + 2 flashes at 34.95/35.15 | TR | CRAZY WEATHER 34.26 |
| 29 | 35.40 | solar system: sun, 6 planets on tilted orbits, Saturn ring | TR | SOLAR SYSTEM 35.6 |
| 30 | 36.75 | exactly 0→1,000 points spawn and fly around | TR | counter 0→1,000 (36.9–38.4) |
| 31 | 39.05 | explosion, 35% pink | → BL 39.22 | WHATEVER IT IS |
| 32 | 40.65 | **CREATIVE** (pink) | BL | — |
| 33 | 41.95 | **COOL** + bubble = 2nd O | into O at 42.05 | — |
| 34 | 43.10 | 4 lines of code (`ai.write("physics")`) | → TR 43.28 | AI CODING TOOLS 43.64 |
| 35 | 44.70 | clock, pink minute hand spinning | TR | DON'T SPEND HOURS 45.42 |
| 36 | 46.85 | **PHYSICS** | TR | — |
| 37 | 47.90 | **F = ma** (pink) | → BR 48.68 | — |
| 38 | 48.95 | **IDEAS** | BR | — |
| 39 | 50.55 | torus knot spinning | BR | MAKE THEM HAPPEN |
| 40 | 52.10 | wireframe cube rotating | → TL 52.24 | DON'T WORRY |
| 41 | 54.20 | **3D?** | TL | — |
| 42 | 55.50 | check mark (pink) | → TR 55.34, → BL 56.64 | TOTALLY FINE |
| 43 | 57.55 | **LEARN** | BL | — |
| 44 | 58.45 | **TRY NEW THINGS** | BL | — |
| 45 | 59.15 | network of 9 people-nodes | BL | MEET COOL PEOPLE |
| 46 | 60.70 | spiral tower of 14 blocks builds | BL | DIDN'T THINK YOU COULD 61.72 |
| 47 | 63.30 | **ONE THING** | → TR 63.10 | — |
| 48 | 64.45 | **!** (pink) | TR | — |
| 49 | 65.30 | **OVERTHINK**, shaking harder and harder | TR | DON'T OVERTHINK IT |
| 50 | 67.30 | tangle of 6 knotted curves | → BL 66.68 | MOST COMPLICATED PROJECT |
| 51 | 69.65 | collapse to one tiny cube | → TR 69.76 | START SIMPLE |
| 52 | 70.45 | **SIMPLE** | TR | — |
| 53 | 71.15 | **INTERACTIVE**; cursor clicks at 71.76, ripple runs through the letters | TR | cursor |
| 54 | 72.25 | **GOES** + bubble = O | into O at 72.30 | SEE WHERE IT GOES |
| 55 | 73.35 | **TALK** | → TL 73.48 | THE PEOPLE AROUND YOU |
| 56 | 74.85 | two spheres trading particles | TL | SHARE IDEAS |
| 57 | 75.85 | **?** | TL | ASK QUESTIONS |
| 58 | 76.95 | explosion | TL | DON'T BE AFRAID |
| 59 | 77.95 | **EXPERIMENT**, glitching in slices | TL | — |
| 60 | 78.80 | progress bar fills (pink) | → BR 78.88 | BY THE END OF TODAY |
| 61 | 80.55 | voxel cube builds again | BR | WALK AWAY WITH |
| 62 | 82.10 | **BUILT** | BR | — |
| 63 | 82.95 | **LEARNED** | BR | — |
| 64 | 84.00 | network | BR | — |
| 65 | 84.75 | **FRIENDS** (pink) | BR | — |
| 66 | 85.55 | halo ring around the bubble | big right (1460,540) Ø480 | THAT'S PRETTY MUCH IT |
| 67 | 87.30 | **THANKS** (x 700) | big right | — |
| 68 | 88.45 | ellipse orbiting the Sundai logo | big right | logo 88.6; EXCITED TO SEE / WHAT YOU COME UP WITH 90.66 |
| 69 | 90.55 | slow two-arm galaxy, dim | big right | — |

## Sound
Voice at 1.0. No music bed (the free catalog needs a HeyGen sign-in). 13 bundled Pixabay-licence SFX from `/media-use` at 0.18–0.3 on the big hits (fly-in, logo, 3D, city, lightning, explosion, bubble-into-O, check, click, outro).
