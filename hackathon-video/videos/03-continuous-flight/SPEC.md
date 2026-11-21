# 03 — One Continuous Flight · SPEC

GOAL: the viewer rides one unbroken camera move from a cloud of particles to Boston, through a storm,
out to the solar system and back into a browser window, and leaves wanting to build a sim themselves.
OUTPUT: HyperFrames, 1920×1080, 30 fps. TIME: 93.4 s × 30 = 2802 frames. Voice `assets/voice.m4a` from 0.
Music: HeyGen catalog track `ebab080d` ("epic cinematic space ambient, deep drones"), 88 s, starts 5.4 s,
volume 0.10 under the voice; 6 bundled Pixabay whooshes/hits on the big camera moves.

LOOK
- Ground: deep space #05060c (never flat: starfield of 4,000 points, 1–2 px). City #070a14 with fog.
- Ink: #ffffff. Brand accents: pink #EC8796 (one highlighted caption word), orange #F6B04A (city light,
  sun), purple #8F7FD6 (grids, wires). Navy #111827 only for the "desk" outside the browser window.
- Type: Archivo Black, uppercase, 84 px, tracking 0.01em, captions only; Space Mono 22 px for the code card
  and URL bar. Captions sit at y 820–940, max width 1100 px, centred, over a bottom scrim
  (linear, transparent → rgba(3,4,10,.65) over the lowest 34 %).
- Light: one key direction per scene (the Sun in space, moonlight from upper-left in the city, a warm key
  from upper-left in the studio). Bloom: UnrealBloom threshold 0.72, strength 0.85, radius 0.5 — only the
  Sun, lightning, light trails and the brightest particles bloom. Fake depth of field on particles
  (point size grows and alpha falls with distance from the focus plane). Vignette 28 % (CSS radial).
- 3D: three.js r18x, one canvas, three scenes (SPACE, CITY, STUDIO) + one shared particle system that
  is re-parented into whichever scene is live. Real Earth/planet textures: Solar System Scope, CC BY 4.0.

OBJECTS (must read without labels)
- Sundai logo: the real PNG, built from ~6,000 particles sampled from its own pixels and colours.
- Earth: real day map + night-lights map + cloud layer, terminator, Boston (42.36 N, 71.06 W) marked.
- Boston at night: street grid with a diagonal avenue and the Charles River, brick/brownstone low-rise,
  a few glass towers downtown, white headlight and red tail-light trails on every street.
- Storm: dark cloud deck, rain streaks, a branching lightning bolt hitting the tallest tower.
- Solar system: emissive Sun, 6 textured planets on visible orbit lines.
- Physics lab: purple grid dented by a star's gravity well, 3 orbiting bodies with trails and arrows.
- Hello cube: the classic first three.js cube, wireframe then solid.

MOTION
- Camera: non-uniform Catmull-Rom/Hermite through timed keys (never stops dead), plus a 0.3 % drift.
  Dives ease in (accelerate into the seam), arrivals ease out (expo-like).
- Particle morphs: 0.9–1.4 s, per-particle stagger 0–0.35 s, smoothstep.
- Captions: each word slides up from a mask in 0.28 s expo.out, words 0.08 s apart, exit blur 6 px +
  fade 0.16 s. No bounce, no scale on text. Landed text is still.
- Bubble: one persistent circular video (300 px base, 5 px white ring). Moves are 0.7 s power3.inOut.
  Big (scale 1.6) for 0–5.1 and 85.6–93.4; satellite (scale 0.7, r ≈ 105 px) the rest.

SHOTS (one camera move; the seams are where something fills the frame)
| # | Time (s) | 3D / camera | Bubble (centre, scale) | On-screen words |
|---|---|---|---|---|
| 1 | 0.0–5.1 | Nebula of 6,000 particles drifting around the bubble, slow push | (960,400) 1.6 | WELCOME TO THE HACKATHON 2.86 |
| 2 | 5.1–9.6 | Particles stream in and build the Sundai logo; crisp logo locks at 7.24 | → (1630,830) 0.7 | (the logo is the callout) |
| 3 | 9.6–16.0 | Logo breaks → wireframe cube 10.8 → torus knot 12.2 → spinning colour shell 14.7 | (1630,830) | BUILD SOMETHING COOL 10.78 · EXPERIMENT 12.24 · HAVE FUN 14.74 |
| 4 | 16.0–23.0 | Shell → giant "3D" 18.1 → browser-window outline 19.7 → three.js-style triangle 21.1 | (1630,830) | 3D SIMULATIONS 18.1 · ON THE WEB 19.6 · THREE.JS + AI 21.08 |
| 5 | 23.0–26.4 | Particles fall into orbit rings; Sun ignites, planets appear; camera dives toward Earth | (1630,830) | — |
| 6 | 26.4–28.7 | Earth fills 50 % of frame; 27.18 a wireframe shell sweeps over it | (1630,830) | REAL WORLD 26.46 · HOW IT WORKS 27.18 |
| 7 | 28.7–30.5 | The whole picture pulls back into a browser window (scale 0.72) | (1630,830) | IN YOUR BROWSER 28.78 |
| 8 | 30.5–33.3 | Fly back through the window, dive into Earth at Boston; seam on the night city lights; descend to street-level light trails by 32.7 | (1630,830) | BOSTON TRAFFIC 31.88 |
| 9 | 33.3–35.2 | Tilt up, climb, rain, lightning strikes the tower at 34.26, enter the cloud | (1630,830) | CRAZY WEATHER 33.92 |
| 10 | 35.2–36.8 | Burst out above Earth's cloud tops, pull back to the whole solar system by 35.6 | (1630,830) | SOLAR SYSTEM 35.44 |
| 11 | 36.8–39.2 | Planets dissolve into 1,000 particles that fly around the camera | (1630,830) | 1,000 PARTICLES 36.9 (counts up) |
| 12 | 39.2–43.3 | Particles paint a brand-colour spiral galaxy (40.88), collapse to one point (42.3–43.2) | (1630,830) | BE CREATIVE 40.78 · HERE'S THE COOL PART 42.24 |
| 13 | 43.3–52.2 | Point bursts into a star in a gravity-well grid; 3 bodies orbit with trails/arrows; code card types left; 49.2 camera rises, 24 bodies spiral out | → (1630,250) | AI CODING TOOLS 43.64 · PHYSICS & MATH 47.06 (struck 48.3) · FOCUS ON IDEAS 49.2 · MAKE IT HAPPEN 50.76 |
| 14 | 52.2–57.4 | Well drains, grid flattens, wireframe cube rises 54.4, fills solid pink 55.76 | → (290,830) | NEVER DONE 3D? 53.72 · TOTALLY FINE 55.76 |
| 15 | 57.4–63.0 | Cube → sphere 57.84 → torus 58.64; 40 nodes rise and link 59.3; 160 blocks stack into a spiral tower 61.1 | (290,830) | LEARN 57.84 · TRY NEW THINGS 58.64 · MEET PEOPLE 59.3 · BUILD BIGGER 61.1 |
| 16 | 63.0–69.6 | Tower blows into a tangled swirl of blocks and wires 65.96; camera pulls back | → (1630,250) 63.0 | DON'T OVERTHINK IT 65.38 · KEEP IT SMALL 67.4 |
| 17 | 69.6–72.7 | Tangle collapses to one sphere 69.76; cursor clicks it 71.6 → bounce + ripple | (1630,250) | START SIMPLE 69.76 · MAKE IT INTERACTIVE 71.26 |
| 18 | 72.7–78.6 | Ripple raises a ring of people-nodes; arcs and travelling pulses; colours shuffle 78.14; camera rises to top-down | → (1630,830) 72.7 | TALK TO PEOPLE 73.48 · SHARE IDEAS 74.98 · ASK QUESTIONS 75.96 · EXPERIMENT 77.7 |
| 19 | 78.6–85.6 | Match cut: node field top-down = Boston at night top-down; glide and tilt; new towers rise 81.6 | (1630,830) | SOMETHING BUILT 81.58 · SOMETHING LEARNED 82.92 · NEW FRIENDS 84.38 |
| 20 | 85.6–89.0 | Climb through cloud, burst above Earth, particles stream from Boston into the Sundai logo 88.6 | → (470,450) 1.55 | THANK YOU 87.46 |
| 21 | 89.0–93.4 | Picture pulls back into a browser window on the right (logo inside, drifting) | (470,450) 1.55 | WHAT WILL YOU BUILD? 90.66 |

BANNED: cross dissolves between worlds; text that moves after it lands; bounce on text; corner HUD
readouts; logo docked in a corner; floating/pulsing loops on UI; key text under the bubble; face covered.
QA: snapshot one frame per shot (mid-shot) plus each seam (24.0, 31.2, 35.2, 43.3, 78.6, 87.0); check the
cue frames 32.8, 34.3, 35.7, 37.2 show Boston traffic, weather, solar system, particles respectively.
