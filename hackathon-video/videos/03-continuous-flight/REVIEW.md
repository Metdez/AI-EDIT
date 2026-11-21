# 03 — One Continuous Flight · REVIEW

## What I built
A 93.4 s, 1920×1080, 30 fps HyperFrames film driven by one three.js canvas. One camera never cuts:
it moves through three worlds (SPACE, CITY, STUDIO) and every change of world happens where something
fills the frame (Earth's surface, a storm cloud, a white-hot point, a grid matched to a street grid).

Route, on the spoken cues:
- 0–9.6 s: 6,000 particles drift around the big bubble, then assemble the real Sundai logo from its own
  pixels and colours; the crisp PNG locks in at 7.24 s.
- 9.6–23 s: the same particles become a wireframe cube (build), a torus knot (experiment), a colour
  shell (fun), giant "3D", a browser-window outline (web), a three.js-style Sierpinski triangle (three.js + AI).
- 23–30.5 s: particles fall into orbit rings, the Sun ignites, planets appear; dive to a real-texture Earth
  (real world 26.46), a wire shell sweeps over it with velocity/gravity arrows (how it works 27.18), the
  whole picture pulls back into a browser window (browser 29.86).
- 30.5–35.2 s: fly back through the window, dive into Earth at Boston's real lat/long (night lights),
  descend to street-level light trails (Boston 32.72), tilt up into rain and lightning (weather 34.26),
  burst out above Earth's cloud tops and pull back to the solar system (solar 35.6), planets dissolve
  into 1,000 particles flying round the camera with a counter (thousand 36.9).
- 39–43.3 s: brand-colour spiral galaxy (creative), collapse to a point (the cool part).
- 43.3–53.6 s: the point becomes a star in a gravity-well grid; three bodies orbit with trails and arrows
  while a code card types the physics (AI coding tools / physics & math, struck through); 24 bodies spiral
  out (ideas → make them happen).
- 53.6–78.6 s: hello cube (wire → solid), sphere, torus, 40 people-nodes link up, a 160-block spiral
  tower, a tangle (overthink), one simple sphere, a cursor click with a ripple (interactive), a people
  network with arcs and travelling pulses (talk / share / ask / experiment).
- 78.6–93.4 s: dip-matched into Boston top-down, towers rise (something built), climb through the storm,
  burst out above Boston, particles stream off Earth into the Sundai logo (88.6), and the whole film pulls
  back into a browser window on a desk next to the big bubble: "WHAT WILL YOU BUILD?".

Bubble: one persistent muted `<video>`, big (scale 1.6) at 0–5.1 and 85.6–93.4, a 210 px satellite the rest
of the time, moving between corners on chapter changes so it never covers captions or the code card.
Captions: 39 kinetic 1–4 word callouts from `assets/words.json` (generator: `tools/gen_captions.py`).
Sound: voice; HeyGen-catalog music bed (`ebab080d`, "epic cinematic space ambient", 88 s, from 5.4 s at
0.10); 9 bundled Pixabay whooshes/hits on the big camera moves.

## What I checked
- `npx hyperframes check`: 0 errors, 0 warnings in the final pass (earlier warnings fixed: caption
  initial-hide set, 20–24 px code/credit text raised to 28 px).
- Snapshots of every shot (mid-shot) and every seam (24.0, 30.9, 31.1, 31.3, 35.15, 35.3, 43.05, 43.35,
  78.45, 78.75, 86.9, 87.1) and the cue frames 32.8 / 34.3 / 35.7 / 37.4 — each shows Boston traffic,
  storm, solar system, particles respectively. Fixed after looking: washed-out city windows, white-out
  lightning flash, over-thick atmosphere, Earth not dissolving with the planets, shapes sitting in the
  caption band, a white blob at the Boston stream, a square bloom blob at the collapse point, a too-small
  hello cube, a cropped tower.
- Rendered MP4: ffprobe and a contact sheet pulled from the file (see below).

## Weak spots / honest flaws
- The audio was measured, not heard. Music volume (0.10) and SFX levels are set by numbers only.
- Seams use a brief coloured haze (atmosphere, cloud, white flash, dark dip) as the fly-through; the
  studio→city seam (78.6 s) is a dipped match cut on grid lines, the least seamless of the joins.
- Earth texture is 2k, so the last 0.3 s of the dive into Boston is soft before the city takes over.
- The city is procedural "Boston-like" (grid, Mass Ave-style diagonal, Charles River strip), not real
  map data; it only reads as Boston because of the caption and the Earth dive to Boston's coordinates.
- The three.js-style triangle is a Sierpinski triangle, not the actual three.js logo.
- The bubble at 88–89.4 s briefly overlaps the browser window's left edge while the window shrinks.
- Shallow depth of field is faked on particles only (no real DOF pass on meshes).

## Render
`out/final.mp4`: h264 1920×1080 30 fps, 93.40 s video, AAC audio 93.42 s, integrated loudness −16.1 LUFS,
216 MB (CRF 16 "looks" quality), rendered in 50 s on the hardware GPU. A 1-frame-per-4-s contact sheet
pulled from the MP4 (`.media/sheet/contact.jpg`) matches the snapshots: no black or frozen frames, no
caption under the bubble, face never covered.
