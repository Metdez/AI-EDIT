# 04 — World Hopper · REVIEW

## LICENCE FLAG — confirm before publishing
The film uses a **World Labs Marble sample world**, "Narrow European cobblestone lane" (500k-splat SPZ,
`assets/worlds/cobblestone_lane_500k.spz`), downloaded from
https://wlt-ai-cdn.art/example_exports/narrow_european_cobblestone_lane/narrow_european_cobblestone_lane_500k.spz
and linked from https://docs.worldlabs.ai/marble/export/specs. That page only says the files are
"example scenes and export files to test against". **No licence is stated.** It is on screen from 17.85 s to
33 s (shots 4–8). Before publishing, confirm with World Labs, or generate your own world on a paid Marble
plan and swap the file (same path, and the code needs no change).
Spark (`lib/spark/`, MIT, licence copied there) and three.js are MIT. SFX are bundled Pixabay-licence
files from the media-use skill (`assets/sfx/CREDITS.md`).

## What I built
93.4 s, 1920×1080, 30 fps. One WebGL canvas. Seven three.js worlds in `scenes/` (hub, splat, city,
storm, solar, particles, blocks), each `init(THREE, renderer)` plus a pure `render(t)`. Each scene renders into
a render target, and a full-screen **portal compositor** (index.html) opens a ring-rimmed hole from one
world into the next. Then bloom (threshold 0.82) and the output pass. 12 portals are the transitions. There are no
cross-dissolves.
- The bubble is a traveller. It sits inside the hub's gate ring for the hello and the sign-off, and dives
  into the portal on the big hops (T1, T2, T7, T10). It squashes on the fast hops.
- A prompt bar types each world ("a rainy old-town lane", "boston traffic at night", "a crazy storm",
  "a solar system", "1,000 particles", "a spinning cube", "make it interactive"), and Enter opens the portal.
- **The real Gaussian-splat world works, but it is baked, not live.** Spark 2.4.0 renders it in the same
  three.js pipeline (`scenes/splat.js`). The hf-seek handler awaits `spark.update()` until the sort matches the
  exact camera, then draws, using `e.detail.waitUntil`. In `snapshot` this is deterministic: two renders of one
  frame, taken out of order in separate runs, were bit-identical. **`render` does not survive it:** the engine
  runs chrome-headless-shell in deterministic BeginFrame mode, and the first splat frame stalled the capture
  (frame 536/2802). Making three's fence-polling readback synchronous was not enough (the next stall is
  somewhere in Spark's worker/sort path). That was 3 attempts, so I stopped debugging. Instead,
  `const BAKE = true` in index.html renders only the splat world (with its rain, grid and arrows) through the
  same bloom and tone mapping. `snapshot` dumped frames 17.8–33.0 s (457 frames), and they were encoded to
  `assets/splat_bake.mp4` (CRF 14, 1 s GOP). In the film that clip is a `<video>` above the canvas, masked by the
  portal radius (circle for T1, hole for T2), and sized per seek to follow the browser-window shrink. To change
  the splat shot: set BAKE = true, re-run the snapshot at those times, re-encode, and set BAKE = false
  (commands in "How to re-bake" below). The camera stays within ~1.3 units of the capture point, because the
  splats smear past ~1.5.
- One line explains the world model: "AI that generates a 3D world you can move through", plus a tag:
  "REAL AI-GENERATED WORLD · World Labs Marble · 500k splats · Spark + three.js".
- "Real world → how it works → browser": a measuring grid, rain and force labels overlay the splat
  world, then the whole frame shrinks into a browser window (localhost:5173/my-world), and the next portal
  zooms back in through it.
- The spoken examples: Boston (night grid, Charles River strip, two landmark towers, 1,800 car-light
  streaks on closed-form lanes), weather (cloud deck, 7k rain streaks, tornado funnel, timed lightning),
  solar system (6 planets on Kepler-ish closed-form orbits), and exactly 1,000 particles that form "1000" and burst.
- "AI writes the physics and math": the solar system switches to a physics view (gravity lines, velocity
  arrows). An AI-assistant card types the gravity code and highlights the formula, then turns into "your
  idea → RUN", which switches on the planet light-trails.
- Blocks: the hello cube, then 420 cubes build a tower, which tangles into chaos ("overthink"), collapses
  back to one cube, and a cursor drags it ("make it interactive"). The cube's rotation and the cursor share
  one curve.
- People: 24 traveller nodes around the bubble, with links that grow on talk / share / ask, and colours that
  swap on "experiment".
- Sundai logo out of the gate at 7.24 s and below the bubble at 88.6 s. 46 kinetic callouts are timed from
  words.json (words slide up from masks, blur-out exit).
- Sound: voice plus 19 quiet SFX (whooshes on portals, typing under prompts, sparkle on logos, a
  low hit when "1000" forms). **No music bed**: no free, local, sign-in-free music was available.

## What I checked
- `hyperframes check`: 0 errors. Warnings kept on purpose:
  - `UniformsUtils: render-target textures cannot be cloned` (×2): ShaderPass clones uniforms; I rebind
    the textures right after, so this is harmless.
  - `nested_media_start_basis_ambiguous` (×19): the SFX sub-composition starts at 0, so local = film time.
  - `text_below_floor`: the browser URL text is 30 px but shown inside the 0.8× browser window (24 px), and
    the AI prompt line is 28 px inside a card. Both are short and secondary.
- Snapshots: I looked at 40+ frames covering every shot and most portal seams, in five passes. Fixed: the
  caret position, the prompt bar colliding with the browser chrome, the grid and arrows hidden behind the
  splats (render order), buildings straddling streets in the city (an off-by-half-block bug), the city camera, a
  washed-out storm sky, the lightning flash whiting out the frame, Saturn peeking in under the caption, and
  the code snippet covering the cube.
- Rendered MP4 `out/final.mp4`: ffprobe gives 1920×1080, 30 fps H.264, AAC audio, 93.42 s. Integrated loudness
  −16.1 LUFS (measured, not heard). I read two 24-frame contact sheets pulled from the MP4 (every 4 s, offset 0
  and 2 s). Every shot is present, there are no black or blank frames, and the baked splat clip, its portals and
  the browser framing match the snapshots.

## How to re-bake the splat clip
1. In index.html, set `const BAKE = true;`.
2. Run `npx hyperframes snapshot --no-end --timeout 120000 -o <dir> --at "$(python3 -c "print(','.join(f'{17.8+i/30:.4f}' for i in range(457)))")"`.
3. Concat the PNGs in frame order: `ffmpeg -f concat ... -vf fps=30,format=yuv420p -c:v libx264 -crf 14 -g 30 assets/splat_bake.mp4`.
4. Set BAKE back to false.

## Weak spots / honest flaws
- **Sample-world licence unknown** (above).
- The splat world plays as a pre-rendered clip, not a live Spark render in the final pipeline (see above). It is
  still the real Marble world rendered by Spark + three.js, just captured through `snapshot` instead of `render`.
- The splat world is used for ~15 s with only a short dolly. The splats show slight brush-stroke smearing
  near the camera at the far end of the move (around 30–32 s, inside the browser frame).
- The fast hops (city → storm → solar → particles) last 1.3 s each, by design, to match the speech. Each
  world is only just readable.
- Body-text sizes in the code card (24 px code) are small for phone viewing. The caption carries the
  meaning there.
- The "how it works" force arrows are thin and partly hidden behind their labels. The grid, rain and labels carry it.
- The prompt bar's caret is static (no blink, on purpose: no idle loops).
- The SFX levels were measured by the CLI, not heard. Nobody has listened to the mix.
- Weakest shot: 13.5–16 s (portals rising in the hub). It's pretty but generic. With more time I'd make
  each portal pop open on its own word.
