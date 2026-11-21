# 01 — Pixel Sundae · SPEC

93.4 s · 1920×1080 · 30 fps · voice `assets/voice.m4a` from 0.

## Look (numbers, not adjectives)
- Ground navy `#111827` (deep `#0b0f1e` in space shots). Voxels only in brand colours: pink `#EC8796`,
  orange `#F6B04A`, purple `#8F7FD6`, cream `#FFF4E6`, plus sky `#6FB7E8` (water/rain) and grey `#5B6178` (cloud).
- One shared pool of **4,000 voxels** (one `InstancedMesh`, unit cubes at 0.9 scale, Lambert, one key light from
  upper-left-front + ambient). Every shot is a *formation* of that pool; shots change by the voxels flying from
  one formation to the next (staggered 0.35–0.8 s morph with a small arc). That is the "pixel icons become the
  voxels that build every scene" idea, and it means no shot ever cross-dissolves.
- WebGL draws at 960×540 and is upscaled ×2 with `image-rendering: pixelated` → real chunky pixels.
- Type: VT323 (headings/callouts, 72–150 px), Space Mono (HUD, 22–30 px, caps, +0.12em tracking).
- Bubble: 280 px base, pixel-stepped circle (clip-path staircase), 8 px pink pixel ring. Moves only in
  `steps(6)` hops (8-bit), 0.42 s. Positions (centre): BIG-L (460,540) ×1.75 · TL (240,240) · TR (1680,240) ·
  BL (240,840) · BR (1680,840), corners at ×0.93. Never over text: captions live in the bottom-centre band
  (x 420–1500, y 840–960), HUD on the side opposite the bubble.
- Camera: always drifting (≥0.6°/s yaw or slow dolly). Subject centred in the free area.
- Sound: voice 1.0, a self-made quiet chiptune bed (0.10), bundled Pixabay SFX at 0.3 on ~14 hits.

BANNED: cross dissolves; bounce/elastic on text; text sliding after it lands; breathing/pulsing titles;
the same entrance on every caption (alternate: step-in from below, per-letter type-on, blur-in).

## Shots (abs. seconds) — formation · camera · bubble · on-screen words
| # | Start–end | 3D formation | Bubble | Words / overlays |
|---|---|---|---|---|
| A1 | 0.0–3.3 | voxel floor of pixel columns rolling in a sine wave (synth grid), camera low dolly | BIG-L | boot terminal top-right types `SUNDAI OS` / `> LOADING HACKATHON` + block progress bar; "YO!" 0.1 |
| A2 | 3.3–5.1 | floor columns rise into voxel letters **HACKATHON** (right of bubble) | BIG-L | "WELCOME TO THE" 2.9 |
| B1 | 5.1–7.2 | letters fly into a 3D voxel **sundae** (pink→orange cup, cream swirl), turntable | hop → TL | "HUGE SHOUT OUT" 6.2 |
| B2 | 7.2–8.4 | the sundae bursts: 12 pixel icon tiles fly out into a ring; logo slams centre | TL | **Sundai logo** 7.24 |
| B3 | 8.4–10.8 | icon voxels become ~40 voxel people who walk into one huddle | TL | "ALL TOGETHER" 8.4 |
| C1 | 10.8–12.2 | huddle restacks into a tower built block-by-block, bottom up | hop → BR | "BUILD SOMETHING COOL" 10.8 |
| C2 | 12.2–13.9 | tower morphs sphere → pyramid → ring every 0.55 s | BR | "EXPERIMENT" 12.3 |
| C3 | 13.9–16.0 | voxels burst into bouncing confetti on a floor | BR | "HAVE FUN" 15.0 |
| D1 | 16.0–18.1 | confetti settles into a flat 16×16 pixel tile (2D) | hop → TR | "TODAY'S THEME" 16.4 |
| D2 | 18.1–19.7 | the tile extrudes into a rotating hollow 3D cube with a ripple | TR | "3D SIMULATIONS" 18.1 |
| D3 | 19.7–21.0 | cube keeps turning inside a pixel browser window | TR | browser frame `sundai.club/hack`; "ON THE WEB" 19.7 |
| D4 | 21.0–22.2 | voxel Sierpinski triangle (three.js nod) | TR | "THREE.JS" 21.1 |
| D5 | 22.2–23.5 | voxel letters **AI** | TR | "+ AI" 22.3 |
| E1 | 23.5–26.0 | voxel tree with one apple | TR | step HUD top: REAL WORLD → HOW IT WORKS → BROWSER; "PRETTY SIMPLE" 23.9 |
| E2 | 26.0–27.2 | apple falls and bounces (closed-form) | TR | HUD step 1 lit; "REAL WORLD" 26.4 |
| E3 | 27.2–28.8 | tree gone, purple blueprint: trajectory dots + gravity arrow | TR | step 2 lit; formula card `y = v·t − ½·g·t²`; "HOW IT WORKS" 27.2 |
| E4 | 28.8–30.8 | bouncing apple inside a browser window (frame scales in from 3×) | TR | step 3 lit; "IN YOUR BROWSER" 28.8 |
| F1 | 30.8–33.3 | voxel Boston: block grid, Charles River, Mass Ave diagonal, 260 cars looping | hop → BR | HUD `BOSTON · 1,240 CARS/MIN`; "TRAFFIC IN BOSTON" 31.9 |
| F2 | 33.3–35.1 | camera tilts up: voxel storm clouds, rain, lightning at 34.3 + sky flash | BR | HUD `WIND 88 KM/H`; "CRAZY WEATHER" 33.9 |
| F3 | 35.1–36.4 | above the clouds: voxel sun + 6 orbiting planets + orbit rings | BR | HUD `6 PLANETS · 1 SUN`; "SOLAR SYSTEM" 35.6 |
| F4 | 36.4–39.2 | the system explodes into exactly 1,000 voxels in a curl-like flow | BR | HUD counter 0→1,000; "1,000 PARTICLES" 36.9 |
| G1 | 39.2–40.9 | particles snap heart → star → rocket (0.5 s each) | hop → TR | "WHATEVER IT IS" 39.2 |
| G2 | 40.9–41.8 | voxel paint splash in all brand colours | TR | "BE CREATIVE" 40.9 |
| G3 | 41.8–43.3 | everything spirals into a tight orb | TR | "THE COOL PART" 42.2 |
| H1 | 43.3–47.0 | orb pops into 24 balls falling and bouncing (right half) | TR | code editor (left) types the gravity code; "AI CODING TOOLS" 43.6, "SKIP THE HOURS" 45.4 |
| H2 | 47.0–48.6 | balls lock into a lattice (solved) | TR | editor stamps `✓ PHYSICS` `✓ MATH`; "PHYSICS + MATH" 47.2 |
| H3 | 48.6–52.2 | voxel lightbulb, lights up at 49.2, rays at 50.8 | TR | "YOUR IDEAS" 50.1, "MAKE THEM HAPPEN" 50.8 |
| I1 | 52.2–54.4 | bulb flattens into a flat 2D pixel smiley | hop → BL | "NEVER DONE 3D?" 53.7 |
| I2 | 54.4–56.6 | the smiley inflates to a 3D voxel smiley head | BL | "TOTALLY FINE" 55.4 |
| I3 | 56.6–58.6 | open voxel book, pages flipping | BL | "A PLACE TO LEARN" 57.2 |
| J1 | 58.6–59.3 | cube ↔ pyramid shuffle | BL | "TRY NEW THINGS" 58.6 |
| J2 | 59.3–60.5 | 5 voxel people waving | BL | "MEET COOL PEOPLE" 59.3 |
| J3 | 60.5–63.0 | people stack into a skyscraper; camera tilts up its height | BL | "BUILD BIGGER" 61.1 |
| K1 | 63.0–66.0 | tower collapses into a giant voxel "!" | hop → TR | "ONE THING" 63.5 |
| K2 | 66.0–67.4 | tangled torus-knot spaghetti spinning | TR | "DON'T OVERTHINK IT" 65.9 |
| K3 | 67.4–69.8 | over-complicated machine: 4 nested gyroscope rings | TR | "NOT THE MOST COMPLEX" 67.9 |
| K4 | 69.8–71.6 | everything collapses to ONE big cube | TR | "START SIMPLE" 69.9 |
| K5 | 71.6–73.0 | pixel cursor clicks the cube → it bounces and spawns a trail of cubes | TR | cursor; "MAKE IT INTERACTIVE" 71.6 |
| L1 | 73.0–75.0 | 6 voxel people in a circle | hop → BL | speech bubbles "hi!" "hey"; "TALK" 73.5 |
| L2 | 75.0–76.0 | small bulbs hop person to person | BL | "SHARE IDEAS" 75.0 |
| L3 | 76.0–77.2 | "?" voxels float over heads | BL | "ASK QUESTIONS" 76.0 |
| L4 | 77.2–79.0 | people burst into a colour fountain | BL | "EXPERIMENT!" 78.1 |
| M1 | 79.0–81.6 | voxel person walking a pixel road | hop → TR | inventory panel slides in (left): 3 empty slots; "BY THE END OF TODAY" 79.3 |
| M2 | 81.6–82.9 | voxel trophy | TR | slot 1 `BUILT`; "SOMETHING BUILT" 81.6 |
| M3 | 82.9–84.2 | voxel book/bulb | TR | slot 2 `LEARNED`; "SOMETHING LEARNED" 82.9 |
| M4 | 84.2–85.6 | 3 voxel friends side by side | TR | slot 3 `FRIENDS`; "NEW FRIENDS" 84.6 |
| N1 | 85.6–88.5 | voxels rebuild the sundae on the right | hop → BIG-L | "THANKS!" 87.5 |
| N2 | 88.5–90.6 | sundae turns; icon tiles orbit it | BIG-L | **Sundai logo** 88.6 (right, under the sundae) |
| N3 | 90.6–93.4 | orbit continues, camera drifts in | BIG-L | "SEE WHAT YOU BUILD" 90.7; `PRESS START` 92.0 |

Changes every ≤2.5 s everywhere (a morph, a caption, a HUD step or a bubble hop).
