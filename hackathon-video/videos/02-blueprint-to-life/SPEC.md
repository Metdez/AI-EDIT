# SPEC — 02 Blueprint to Life

GOAL:    a hacker leaves the welcome thinking "I can take something real, draw how it works, and run it in a browser today".
OUTPUT:  HyperFrames, 1920x1080, 30 fps, 93.4 s (2802 frames). Voice `assets/voice.m4a` from 0; bed `assets/bgm/bed.m4a` at 0.13; bundled Pixabay SFX.
LOOK:    camera-HUD over a blueprint world.
         ground #0A1022 (blueprint navy) with fog; grid lines #1B2B52 minor / #2C4580 major every 5 units.
         blueprint ink #9CC2FF (all wireframes, 1 px lines). Fill = MeshStandard in brand pink #EC8796, orange #F6B04A, purple #8F7FD6, bone #EDE6DA.
         scan sheet / wipe bar = pink #EC8796 (the one moving accent). HUD numbers = orange.
         type: Inter 900 uppercase callouts 84–120 px, tracking -1%; Space Mono 700 caps 28 px tracking .12em for HUD/labels; Space Mono 400 30 px code.
         glass card = rgba(10,16,34,.78) + blur 18 px + 1 px #9CC2FF33 border + 4 corner brackets (18 px, 2 px, ink).
         light: one warm key from upper-left (#FFF1E0, 2.4), cool rim behind (#8FB8FF, 1.0), hemi fill .55. No bloom pass.
OBJECTS: primitives (box, icosa, torus, cone, knot, cylinder); block tower; low-poly planet with satellites; basketball on a floor;
         night city grid with cars + light trails; storm clouds + rain + lightning; sun + 6 planets + orbits; 1,000 particles;
         sun + Keplerian particle disc; one cube with dimension lines; knot tangle -> one sphere + 3D cursor; 42-node people network -> geodesic dome.
MOTION:  the medium is drafting: lines draw on (drawRange), a pink scan plane sweeps and the solid fills in behind it, then the thing moves.
         enter expo/power3.out 0.4–0.6 s; exits power2.in 0.2–0.3 s; camera power2.inOut; words slide up out of a mask 0.07 s apart, no bounce.
         Shot seams: (a) pink scanner-bar wipe in WebGL (L->R, R->L, bottom->top), (b) browser frame zoom-through, (c) particle collapse -> white flash -> sun, (d) in-scene scan sweep.
BUBBLE:  one <video> in a circular mask with an ink ring + "HOST · LIVE" tag; moves only between cards (0.6 s power3.inOut).

## SHOTS (seconds, global)
| # | in–out | 3D scene | bubble (centre, diameter) | on-screen words |
|---|---|---|---|---|
| 1 | 0.0–5.1 | grid: grid floor draws out from centre, 6 primitives draft in as ink wire, scan fills them at "hackathon" 3.5 | big (1340,520) 470 | WHAT'S UP, EVERYONE? / WELCOME TO THE HACKATHON |
| 2 | 5.1–10.6 | grid: camera dives low; ring flung out then pulled in on "together" 7.9 | (1600,270) 280 | HUGE SHOUT OUT, Sundai logo glass card 7.24, BRINGING US TOGETHER |
| 3 | 10.6–16.0 | build: wire blocks drop into a tower (10.8), re-stack into a spiral on "experimenting" (12.2), fill in brand colour + spin on "fun" (15.0) | (300,820) 260 | BUILD SOMETHING COOL / EXPERIMENT / HAVE FUN |
| 4 | 16.0–23.4 | web: lat/long wire globe drafts, fills at "3D" 18.1, satellites start orbiting on "simulations"; browser frame lands 19.6; chips three.js 21.1, AI 22.3 | (1620,260) 240 | 3D SIMULATIONS / ON THE WEB / THREE.JS + AI |
| 5 | 23.4–30.4 | ball: shaded basketball bounces (real world 26.5); scan sweeps L->R to blueprint with trajectory, v and g arrows (how it works 27.2); sweeps back to solid as browser frame lands (29.0) | (290,830) 250 -> docked in frame (1520,820) 220 | PRETTY SIMPLE / REAL WORLD / HOW IT WORKS / LIFE IN YOUR BROWSER + step tracker + live h/v/g card |
| 6 | 30.4–33.35 | traffic: top-down blueprint city -> fill -> 260 cars with trails accelerate | docked in frame | TRAFFIC IN BOSTON + card (vehicles, cars/min, mph) + typed code |
| 7 | 33.35–35.15 | weather: wire clouds fill, slanted rain, lightning 34.4 | docked | CRAZY WEATHER + card (wind, precip, hPa) + code |
| 8 | 35.15–36.75 | solar: orbits drawn, planets fill and orbit | docked | SOLAR SYSTEM + card (real orbital periods) + code |
| 9 | 36.75–39.2 | particles: wire volume, 0->1,000 particles burst and swirl | docked | 1,000 PARTICLES + live counter + code |
| 10 | 39.2–43.4 | particles: browser frame zooms through; swarm morphs cube -> sphere -> torus on "creative"; collapses to a point, white flash | (300,270) 260 | WHATEVER IT IS / BE CREATIVE / HERE'S THE COOL PART |
| 11 | 43.4–54.1 | gravity: flash becomes the sun; blueprint orbits + force arrows while code types; equations float; disc of 1,500 bodies fills and spins on "ideas" 49.2 | (1650,860) 230 | AI CODING TOOLS / PHYSICS + MATH (struck through) / FOCUS ON IDEAS / MAKE THEM HAPPEN |
| 12 | 54.1–58.3 | simple: one cube draws edge by edge with dimension lines, fills pink + spins on "totally fine" 55.8 | (470,540) 340 | NEVER WORKED WITH 3D? / TOTALLY FINE |
| 13 | 58.3–63.0 | network: 42 people-nodes pop, edges draw on "meet" 59.3, nodes fly into a geodesic dome on "build" 61.1 | (1600,800) 260 | LEARN. TRY NEW THINGS / MEET COOL PEOPLE / DIDN'T THINK YOU COULD |
| 14 | 63.0–72.75 | simple: knots pile up into a tangle (complexity meter), collapse to one sphere on "simple" 70.7, 3D cursor drags it on "interactive" 71.6 | (1600,270) 240 | DON'T OVERTHINK IT / NOT THE MOST COMPLICATED / START SIMPLE / MAKE IT INTERACTIVE |
| 15 | 72.75–78.0 | network: nodes ring the speaker, spokes + pulses carry ideas | centre (960,540) 300 | chat cards: TALK / SHARE IDEAS / ASK QUESTIONS / EXPERIMENT |
| 16 | 78.0–85.6 | build: wire tower drops in, fills on "built" 82.4, dimension lines on "learned", pawns pop on "friends" 85.1 | (300,820) 250 | END OF TODAY + checklist SOMETHING BUILT / SOMETHING LEARNED / NEW FRIENDS |
| 17 | 85.6–93.4 | grid: all primitives solid, camera rises | big (1340,480) 460 | HUGE THANKS / Sundai logo 88.6 / & ALL OF YOU / WHAT WILL YOU BUILD? |

Persistent HUD 0–93.4: corner brackets, "SUNDAI // 3D SIM HACK", "● REC 1080P30", running timecode, shot label.

BANNED: crossfades between worlds; bounce on text; text moving while read; floating particles as decoration; bloom; logo on light ground;
        text under the bubble; face covered; any callout over 4 words.
QA: snapshot one frame per shot (mid-shot) + each seam; contact sheet from the final MP4.
