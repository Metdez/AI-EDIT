# 01 — Pixel Sundae · REVIEW

## What I built
- 93.4 s, 1920×1080, 30 fps. Voice from 0; speaker only in a pixel-stepped circular bubble that hops
  between corners in `steps(6)` 8-bit moves (big on the left for the hello and the sign-off).
- One three.js canvas, one pool of 4,000 voxels (`scenes/engine.js`). Every shot is a *formation* of that
  pool (`scenes/intro|theme|examples|middle|outro.js`, ~50 formations); a new shot starts by the voxels
  flying from the old formation to the new one with a staggered arc, and the camera blends with them.
  So there are no cross dissolves anywhere: the sundae bursts into the logo's icon tiles, the tiles become
  people, the people become a tower, the city flies up into storm clouds, the clouds into a solar system,
  the planets into exactly 1,000 particles, and so on. WebGL draws at 960×540 and is upscaled ×2 with
  `image-rendering: pixelated` for real chunky pixels; a light scanline/vignette layer sits on top.
- All sims are closed-form in `t` (traffic loops, bounce physics, orbits, rain, fountain) or seeded at load
  (mulberry32 / integer hash). No `Math.random`, clocks or rAF.
- Overlays: 10 chapter sub-compositions (boot terminal, logo card, browser windows, 3-step pipeline HUD +
  gravity formula, sim HUD with numbers and a 0→1,000 counter, AI code editor that types the gravity code,
  pixel cursor click, speech bubbles, inventory screen, outro logo + PRESS START) and one captions
  sub-composition with 50 kinetic 1–4 word callouts timed from `words.json` (three alternating entrances:
  per-letter type-on, 8-bit step-up, blur-in).
- Brand: pink/orange/purple on navy, VT323 (OFL, fetched to `assets/fonts/` with its licence) + Space Mono.
  Sundai logo at 7.24 s (centre, in a ring of its own voxel icons) and 88.6 s (outro, under the voxel sundae).
- Sound: voice at 1.0; a chiptune bed I synthesised locally (`tools/chipbed.py`, seeded, no deps) at 0.11;
  27 bundled Pixabay SFX (whoosh, pop, impact, sparkle, typing, ping, chime, click) at 0.18–0.4 on visible hits.
  Pixabay licence notes are in `assets/sfx/CREDITS.md`.

## What I checked
- `hyperframes check`: 0 errors. 2 craft warnings kept on purpose: the boot line "> READY. PRESS START"
  (0.47 s, texture under the hello) and the browser URL "https://sundai.club/hack" (1.14 s, the beat is 1.3 s).
- Earlier check flagged 49 heavy-overlay elements in the captions file (known to cause black capture); I
  removed the clip-path card notches and clip-path typewriter (now per-letter opacity), which cleared it.
- Snapshots: one frame for every shot (51 frames), plus mid-morph frames at 13 transitions. Fixed from
  them: balls read as "+" signs, Boston cars invisible under tall buildings, the Sierpinski triangle and the
  3D cube sitting under their captions, typewriter typing bold words last, boot terminal overlapping the
  welcome line, formula label wrapping, trophy/outro framing.
- Rendered MP4 `out/final.mp4`: ffprobe 1920×1080, 30 fps, 93.418 s, AAC audio; 74.8 MB; rendered in 42 s.
  Two contact sheets pulled from the MP4 (every 4 s, offset 0 and 2 s, `.snap/mp4-sheet*.jpg`): no black or
  empty frames, bubble never over a caption, render matches the snapshots.
- Sound was measured, not heard: mean −18.3 dB, peak −1.2 dB for the full mix.

## Weak spots / not done
- The voxel people are simple 3×7 figures with cream block heads; they read as "little robots" more than people.
- Some shots are short by design (solar system 1.3 s, try-new-things 0.7 s); the morph eats ~0.5 s of each.
- The type-on captions take ~0.4 s to finish; a frame grabbed in that window shows a half-typed word.
- The talk-circle speech bubbles are placed by eye over the heads, not tracked to them.
- The chiptune bed is homemade and simple (I–vi–IV–V loop); it sits low under the voice but a real track
  would be better. SFX are bundled stock, not designed for this film.
- `scenes/<name>.js` deviates from the brief's "one scene per file with its own init/render": one shared
  engine owns the voxel pool (needed for the morph transitions) and each chapter file exports its formations.
