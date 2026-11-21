# Builder brief (shared by all five videos)

You are building one finished video. Your concept is the numbered section of `PLANS.md` you were given.
The beat sheet in `PLANS.md` and `assets/words.json` (`[{w, s, e}]`, seconds) are the timing truth.

## The job
- 1920×1080, 30 fps, exactly 93.4 s (root `data-duration="93.4"`), voice track `assets/voice.m4a` from 0.
- The speaker is almost never full screen. He lives in a circular bubble (`assets/avatar_square.mp4`,
  720×720, face-centred, muted; one persistent `<video>` for the whole film) that moves, resizes and
  reacts. Graphics own the frame. The bubble may go big (up to ~half height) for the hello (0–5 s)
  and the sign-off (85.6–93.4 s). Never cover his face; never let key text sit under the bubble.
- Lots of fast cuts and motion graphics: something visibly changes at least every 2–3 s, and what is on
  screen illustrates the words being said at that moment (cue times are in the beat sheet).
- three.js scenes must show the spoken examples: Boston traffic, weather, solar system, a thousand
  particles — plus "real world → how it works → browser" and "AI writes the physics and math".
- Sundai logo (`assets/sundai-logo.png`, white + orange on transparent, dark backgrounds only) appears
  at ~7.2 s and ~88.6 s. Brand colours: pink #EC8796, orange #F6B04A, purple #8F7FD6, navy #111827.
- Captions: not full subtitles. Punchy 1–4 word kinetic callouts on the key phrases, timed from words.json.

## Craft rules (from the two reference videos — see `research/`)
- Write `SPEC.md` first: a numbered shot list with start/end seconds, what the 3D scene does, where
  the bubble is, and the on-screen words. Then build. Do not stop to ask for approval.
- Every shot transforms into the next: morph, fly-through, wipe by an object. No cross dissolves.
- Subject dead centre, one light direction, always some camera drift. Words slide up; no bounce on text.
- Dark background, bold type, a dark scrim or glass card behind any text over busy 3D.
- Bloom only on the brightest points. Keep text inside the 80% title-safe box.

## Technical rules (verified on this machine — the template renders correctly)
- Start: `cp -R ../../template .` is already done for you; your folder is a working HyperFrames project.
  Read its `index.html` first — it shows the working pattern: local three.js via importmap, the
  `hf-seek` listener, the bubble wrapper animated with GSAP `x/y/scale`, the `<audio>` voice.
- Load the `/hyperframes` skill and follow its contract; read its `references/types/3d.md`,
  `runtimes.md`, `format.md`, `overlays.md`, `captions.md`, `motion.md`. Search `/hyperframes-registry`
  before hand-building a named effect.
- three.js: keep ONE WebGL canvas in the root `index.html`, drawn only inside the `hf-seek` listener
  from `e.detail.time`. Put each scene in `scenes/<name>.js` exporting `init(THREE, renderer)` and
  `render(t)`; the root picks the scene(s) by time. Frames render out of order across 8 workers:
  `render(t)` must be a pure function of `t`. Simulations (traffic, particles, weather) are either
  closed-form in `t` or precomputed once at load into arrays and looked up. Seeded PRNG only
  (mulberry32 in the template); no `Math.random()`, `Date.now()`, `requestAnimationFrame`, timers.
  `renderer.setPixelRatio(1)`. More three.js addons are in `../../vendor/node_modules/three/examples/jsm/`
  — copy what you need into `lib/three/addons/`. No CDN imports besides the GSAP tag already there.
- HTML overlays (type, cards, HUD) are timed `.clip` elements; more than 3 timed elements in one file
  warns, so put each chapter's overlays in its own `compositions/<chapter>.html` sub-composition
  (transparent root). Captions: one sub-composition with `data-track-kind="captions"`.
- Fonts bundled by name: Inter, Space Mono, Archivo Black, Oswald, Montserrat, JetBrains Mono, etc.
  Anything else (e.g. VT323) needs a file in `assets/fonts/` + `@font-face`.
- Sound: voice is the priority. Add a quiet music bed and a few whooshes only if `/media-use` gives
  them free and local; no paid generation, no sign-in. If not, ship voice-only and say so.

## Verify before you finish (mandatory)
1. `npx hyperframes check` — fix every error.
2. `npx hyperframes snapshot --at <one time per shot>` — Read the contact sheet. Fix: black or empty
   frames, text under the bubble, face covered, unreadable text, a shot that does not match the words.
3. `npx hyperframes render -o out/final.mp4`, then confirm with ffprobe: 1920×1080, ~93.4 s, has audio.
   Pull a contact sheet from the MP4 itself (`ffmpeg ... fps=1/4,scale=480:-1,tile=6x4`) and Read it —
   the render can differ from snapshots.
4. Write `REVIEW.md`: what you built, what you checked, and anything that is weak or unfinished.

Final message: path to `out/final.mp4`, a 5-line description, and an honest list of flaws.
Stay inside your own folder; do not touch `template/`, `assets/` or other videos.
