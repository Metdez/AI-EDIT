# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## First time here? Say "set up"

If the user says "set up", or the tools below are missing (`node`, `ffmpeg`, `mlx_whisper`, the
`/hyperframes` skill), follow [SETUP.md](SETUP.md) step by step. It installs Node, ffmpeg, Python, the
local Whisper model (`mlx-community/whisper-large-v3-turbo`) and HyperFrames. It also sets the
transcription command and lists which docs hold the editing conventions.

## What this is

A workspace (not a git repo at this level) for the Sundai "Building 3D worlds" three.js hackathon
(event page linked in `My vid/info.md`). Three projects plus source material:

- `hackathon-video/` — five alternative cuts of one 93.4 s welcome video, built with HyperFrames
  (HTML + GSAP rendered to MP4) and three.js.
- `sundai-3dworlds/` — the hackathon slide deck and starter prompts. This one **is** its own git repo.
- `solid-video/` — ten variants of a 44.5 s vertical ad for Solid, generated from one cut list.
  Raw inputs are in `drive-download-20261121T004318Z-1-001/`; finished files are in `Solid final videos/`.
- `phoebe-video/` — the same Solid ad cut again from a second presenter's footage (ten variants, 46.6 s). Raw inputs,
  renamed with a key, are in `Phoebe/`; finished files are in `Phoebe final videos/`.
- `My vid/`, `Nate vid/`, `Moption Vid/` — raw inputs: the avatar recording + logo, and two reference
  videos with transcripts. Analysis of the references lives in `hackathon-video/research/`.

## hackathon-video

### Read before touching a video

1. `hackathon-video/BRIEF.md` — the shared contract for all five videos (format, bubble rules, craft
   rules, technical rules, mandatory verification). It is authoritative.
2. `hackathon-video/PLANS.md` — the beat sheet (what is said when, cue-word times) and the concept
   for each of the five videos.
3. The video's own `SPEC.md` (numbered shot list) and `REVIEW.md` (what was built, known flaws).
4. Invoke the `/hyperframes` skill before writing or editing compositions. Each video folder also has
   a HyperFrames boilerplate `CLAUDE.md`/`AGENTS.md` (identical copies of `template/`'s).

### Layout

- `template/` — the verified starting project every video was copied from. Its `index.html` is the
  minimal working pattern. Do not edit it when working on a video.
- `videos/NN-name/` — one self-contained HyperFrames project per cut (01 pixel-sundae,
  02 blueprint-to-life, 03 continuous-flight, 04 world-hopper, 05 type-storm). Stay inside the folder
  of the video you are working on. Final render is `out/final.mp4`.
- `assets/` — shared masters (voice, square avatar, logo). Each video has its own copy under `assets/`.
- `transcripts/words.json` (copied to each video's `assets/words.json`) — word timings
  `[{w, s, e}]` in seconds; with the beat sheet, this is the timing truth.
- `vendor/` — npm install of `three` and `@sparkjsdev/spark`, used only as a source to copy files
  from: three.js addons go from `vendor/node_modules/three/examples/jsm/` into a video's
  `lib/three/addons/`. Videos load three.js locally via importmap; the only CDN import is the GSAP tag.

### Architecture of a video

- Root `index.html` owns **one** WebGL canvas, the persistent avatar `<video>` inside the `#bubble`
  wrapper (moved only with GSAP `x/y/scale`), the `<audio>` voice track, and the root GSAP timeline
  registered on `window.__timelines["main"]`.
- three.js draws only inside the `hf-seek` event listener, from `e.detail.time`. Scenes live in
  `scenes/<name>.js` exporting `init(THREE, renderer)` and `render(t)`; the root picks scene(s) by time.
- **`render(t)` must be a pure function of `t`.** Frames render out of order across 8 workers.
  Simulations are closed-form in `t` or precomputed at load and looked up. Seeded PRNG only
  (mulberry32, see template); no `Math.random()`, `Date.now()`, `requestAnimationFrame` or timers.
  `renderer.setPixelRatio(1)`.
- HTML overlays (type, cards, HUD) are timed `.clip` elements. More than 3 timed elements in one file
  triggers a lint warning, so each chapter's overlays are a transparent sub-composition in
  `compositions/<chapter>.html`; captions are one sub-composition with `data-track-kind="captions"`.
- Fixed format: 1920×1080, 30 fps, root `data-duration="93.4"`.

### Commands (run inside a video folder)

```bash
npm run check                          # lint + runtime + layout + motion + contrast; fix every error
npx hyperframes snapshot --at 3.5,7.2  # PNG frames at those seconds — look at them, check passing is not enough
npx hyperframes render -o out/final.mp4
npx hyperframes preview --background   # agent-safe Studio preview; --status to verify, --stop when done
npm run dev                            # foreground preview, for humans only
```

The CLI is pinned to `hyperframes@0.9.72` in each `package.json`.

After a render, verify the MP4 itself, not just snapshots: `ffprobe` for 1920×1080, ~93.4 s and an
audio stream, then a contact sheet (`ffmpeg ... -vf fps=1/4,scale=480:-1,tile=6x4`) and read it.
Update the video's `REVIEW.md` with what changed and what is still weak.

## sundai-3dworlds

- `deck.html` is the source of the deck (one `<section class="s">` per 1920×1080 slide);
  `threejs-hackathon.pdf` / `.pptx` are exports of it. Keep the "NN / 09" slide counters in sync when
  adding or removing slides.
- `python scripts/fx.py <source image> <output dir>` regenerates the FX preview tiles in `assets/fx/`
  (needs numpy and Pillow).
- `README.md` holds the starter prompts handed to hackathon participants.

## solid-video

- Read `solid-video/docs/README.md` first: it maps every file. `docs/PROCESS.md` records the steps taken and
  `docs/PREFERENCES.md` holds the user's standing preferences for short-form edits (hook sound and zoom,
  dense early sound effects, music bed, full-frame animated demos, recreated site browsing, "Solid.tech" end card).
- For new short-form content, use the `short-form-video` skill (`.claude/skills/short-form-video/SKILL.md`).
- The ten cuts are data in `variants.mjs`; `node build.mjs [NN]` regenerates `videos/NN-name/`. Never edit
  `videos/*` by hand, it is overwritten. Format is 1080×1920, 30 fps, 44.5 s.
- After a rebuild: `npx hyperframes@0.9.72 check` and `render -o out/final.mp4` inside the video folder, then
  copy the result to `solid-video/out/` and `Solid final videos/`.
- `tools/music.py` needs numpy; the whisper venv has it (`~/.local/share/whisper/venv/bin/python3.12`).

## phoebe-video

- A copy of the solid-video generator adapted to new footage. Read `phoebe-video/README.md` first; `docs/PROCESS.md` records the run,
  `docs/SHOTLIST.md` the base shot list, `SCRIPT.md` the script, `research/` the take and b-roll catalogues.
- `node build.mjs [NN]` regenerates `videos/NN-name/`; `tools/render-all.sh [NN]` checks, renders and copies to `out/` and `Phoebe final videos/`.
- The voice take is `assets/main.mp4` and is always placed in sync with `assets/voice.m4a`; per-clip framing lives in `LOOK` in `variants.mjs`.
