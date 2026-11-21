# 04 — World Hopper · SPEC

GOAL: a hacker watching feels "I could type a world into existence tonight" and wants to build one.
OUTPUT: HyperFrames, 1920×1080, 30 fps, 93.4 s = 2802 frames. Voice `assets/voice.m4a` from 0.
SOUND: voice at 1.0; bundled Pixabay SFX (whoosh per portal at 0.28–0.4, typing under each prompt at 0.25,
sparkle on both logo hits at 0.3). No music bed (no free local music source; see REVIEW.md).

## Idea
The speaker is a traveller in a circular bubble. A prompt bar types a world, a portal rips open at the
centre, the bubble dives through, and we are in that world. Portals are the transitions (12 of them).
One world is a real AI-generated world: the World Labs Marble sample "Narrow European cobblestone lane"
(500k Gaussian splats), rendered in three.js by Spark. The others are procedural three.js worlds.

## Look
- Ground: deep navy #0B0D1A / #111827 in the hub; each world has its own light. Brand accents only:
  pink #EC8796, orange #F6B04A, purple #8F7FD6.
- Callouts: Archivo Black, 96 px, caps, tracking −1%, white with one word in pink or orange. Bottom
  centre, baseline ≈ y 945, inside 80% title-safe (x 192–1728, y 108–972). Soft bottom scrim
  rgba(5,6,14,.6)→0 over 340 px, always on.
- Prompt bar: top centre, 980×88 px, dark glass rgba(14,16,30,.82) + 1 px white 18% border, radius 44,
  Space Mono 34 px, pink caret, orange "↵" key that flashes on Enter.
- Cards: Inter 700/400, dark glass rgba(12,14,26,.8), radius 20, 40 px padding.
- 3D: one light direction per world (key from upper left), constant camera drift, bloom threshold 0.82
  so only lights, rims, sun, sparks bloom.
- Portal: full-screen composite shader. Circle of radius r(t) shows the next world, rim is a 14 px
  pink→orange→purple swirl that blooms, the old world is pulled 8% toward the hole near the rim.
  r(t): opens to r0 (gate size) with ease-out in the first 35%, then accelerates (power 2.2) past the
  frame diagonal. Never a cross-dissolve.

## Bubble (480 px element, scaled; centre given)
| t | centre | diameter | note |
|---|---|---|---|
| 0–4.9 | 960,540 | 440 | inside the hub gate ring |
| 5.0–17.9 | 1660,520 | 240 | right middle |
| 17.9–18.6 | → 960,540, scale→0 | | dives through portal T1 |
| 19.2–28.6 | 1660,520 | 240 | pops out of the world |
| 28.7–32.1 | 1700,880 | 200 | outside browser frame corner |
| 32.1–32.6 | dive | | T2 |
| 33.0–43.0 | 1660,520 | 240 | small squash on each fast hop |
| 43.1–43.7 | dive at gate | | T7 |
| 44.0–54.0 | 1700,280 | 220 | top right, editor on left |
| 54.6–72.6 | 1660,520 | 240 | |
| 73.3–78.6 | 960,520 | 230 | the centre node of the people network |
| 78.7–85.5 | 1660,520 | 240 | |
| 85.6–93.4 | 960,430 | 420 | back in the gate, logo below |

## Shots
| # | t (s) | world / 3D | on screen words | handoff |
|---|---|---|---|---|
| 1 | 0–4.9 | HUB: purple grid floor, stars, one swirling gate ring at centre; camera z 9, drifting | YO, WHAT'S UP (0.1–1.9) · WELCOME TO THE HACKATHON (2.86–4.9) | bubble leaves gate |
| 2 | 4.9–10.7 | HUB: gate inner disc ignites; Sundai logo grows out of the gate at 7.24 | HUGE SHOUT-OUT (6.24–7.1) · logo card 7.24–10.5 · BRINGING US TOGETHER (7.86–9.0) | logo shrinks back into gate |
| 3 | 10.7–16.2 | HUB: four world-portals rise from the floor at 10.78 / 12.24 / 13.3 / 14.4, each showing a live world (city, storm, solar, particles) | BUILD SOMETHING COOL · EXPERIMENT · HAVE FUN | prompt bar slides in |
| 4 | 16.2–19.0 | HUB → prompt types "a rainy old-town lane", Enter 17.8 → portal T1 opens in gate at 17.85 | TODAY'S THEME (16.48) · 3D SIMULATIONS (18.1) | bubble dives |
| 5 | 19.0–22.9 | SPLAT: real Marble world, camera dollies down the lane, three.js rain | ON THE WEB (19.7) · THREE.JS + AI (21.08) · tag under prompt "real AI-generated world · World Labs Marble · 500k Gaussian splats · Spark + three.js" | |
| 6 | 22.9–26.4 | SPLAT continues | card: "WORLD MODEL — AI that generates a 3D world you can move through." | card slides out left |
| 7 | 26.4–28.7 | SPLAT + cyan ground grid + gravity arrow + labels (how it works) | REAL WORLD (26.46) · HOW IT WORKS (27.18) | frame shrinks |
| 8 | 28.7–32.2 | SPLAT inside a browser window (device scales to 0.8, chrome bar "localhost:5173 / my-world") ; prompt types "boston traffic at night" 30.7 | IN YOUR BROWSER (28.78) | zoom back into browser + portal T2 |
| 9 | 32.2–34.0 | CITY: Boston-ish night grid, Charles River strip, two towers, 1,800 car lights streaming | BOSTON TRAFFIC (32.72) | T3 |
| 10 | 34.0–35.3 | STORM: cloud deck, 7,000 rain streaks, tornado funnel, two lightning strikes | CRAZY WEATHER (34.26) | T4 |
| 11 | 35.3–36.55 | SOLAR: sun + 6 planets + orbit lines, fly-by | SOLAR SYSTEM (35.6) | T5 |
| 12 | 36.55–39.2 | PARTICLES: exactly 1,000 glowing particles swarm, form "1000", burst | 1,000 PARTICLES + counter 0→1000 | T6 |
| 13 | 39.2–43.1 | HUB: all four world-portals live; camera pushes into gate at 41.84 | BE CREATIVE (39.88) · HERE'S THE COOL PART (41.84) | T7 in gate |
| 14 | 43.1–49.0 | SOLAR physics view (offset right): orbit trails, gravity lines, velocity arrows from 47.48 | code card types an AI prompt + 4 physics lines; AI CODING TOOLS (43.64) · SKIP THE HOURS (45.42) · PHYSICS + MATH (47.48, struck) | |
| 15 | 49.0–54.0 | SOLAR | code card becomes "your idea →"; FOCUS ON IDEAS (49.2) · MAKE THEM HAPPEN (50.76) · NEVER DONE 3D? (52.82) | T8 |
| 16 | 54.0–58.2 | BLOCKS: the three.js "hello cube" on a grid; prompt types "a spinning cube" | TOTALLY FINE (55.34) | cubes multiply |
| 17 | 58.2–63.0 | BLOCKS: 420 cubes fly out and build a tower | LEARN · TRY NEW THINGS · MEET PEOPLE · BUILD WHAT YOU COULDN'T | |
| 18 | 63.0–69.7 | BLOCKS: tower tangles into chaos | DON'T OVERTHINK IT (65.38) · SKIP THE MOST COMPLEX (67.4) | collapse |
| 19 | 69.7–72.7 | BLOCKS: everything collapses to one cube; a cursor drags it, cube follows, ripples | START SIMPLE (69.76) · MAKE IT INTERACTIVE (71.26); prompt "make it interactive" | T9 |
| 20 | 72.7–78.7 | HUB: 24 traveller nodes around the bubble, links grow per phrase | TALK TO PEOPLE · SHARE IDEAS · ASK QUESTIONS · EXPERIMENT | T10 |
| 21 | 78.7–85.6 | CITY (built) → T11 SOLAR (learned) → T12 HUB network (friends) | SOMETHING BUILT (81.58) · SOMETHING LEARNED (82.92) · NEW FRIENDS (84.38) | |
| 22 | 85.6–93.4 | HUB: camera back to the gate, bubble big in it; Sundai logo below at 88.6 | HUGE THANKS (87.46) · CAN'T WAIT TO SEE WHAT YOU BUILD (91.0–93.4) | end |

## Motion
- Callout words: each word slides up from a mask (yPercent 105→0, 0.32 s, expo.out, 0.07 s stagger); exit blur 6 px + fade 0.16 s power2.in. No bounce, no scale.
- Bubble moves: 0.5–0.7 s power3.inOut; dives: power3.in to scale 0.08; arrivals expo.out from scale 0.
- Cards: in 0.4 s power2.out (x −40→0, opacity), out 0.3 s power2.in.
- Camera: every world drifts continuously; no static frames.

## BANNED
Cross-dissolves between worlds; floating idle loops on text; bounce on text; text under the bubble;
glow on text; Math.random/Date.now/rAF; logo docked in a corner; corner brackets.

## QA frames
1.0, 4.0, 7.8, 13.5, 17.2, 18.4, 20.5, 24.5, 27.6, 30.5, 32.5, 33.2, 34.8, 36.0, 37.9, 41.0, 42.8,
45.0, 48.5, 51.5, 53.5, 56.0, 61.0, 67.5, 70.5, 72.0, 75.0, 80.5, 83.3, 85.0, 89.5, 92.5.
