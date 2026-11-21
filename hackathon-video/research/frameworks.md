# Code-to-video frameworks: HyperFrames vs Remotion (researched 2026-11-20)

Job: five 93 s, 1920x1080 fast-cut videos; three.js/WebGL scenes, kinetic type, a 1080x1920 25 fps talking-head clip in a moving circular bubble, word-timestamp sync. macOS, Apple M5 Max, Node 22, ffmpeg 6, no Homebrew.

Legend: [V] = read on the primary doc/repo page this session. [S] = secondary source (blog, third-party repo, issue thread). [K] = general knowledge/practice, not verified against a source. [U] = could not verify.

---------------------------------------------------------------------------
## 1. HyperFrames (HeyGen)

Facts: Apache 2.0, no per-render fees, Node 22+ and FFmpeg required, ~86k GitHub stars, very fast release cadence (versions 0.6.x -> 0.9.x seen in issues). Renders by seeking each frame in headless Chrome (Puppeteer, HeadlessExperimental.beginFrame) and encoding with FFmpeg. [V] https://github.com/heygen-com/hyperframes , https://hyperframes.heygen.com/concepts/determinism.md

### Install / init / preview / render [V]
```
npx hyperframes init my-video            # scaffold (non-interactive flags: --non-interactive, --video file.mp4, --tailwind, --example <name>)
cd my-video
npx hyperframes doctor                   # checks Node, Chrome, FFmpeg
npx hyperframes lint                     # structure rules
npx hyperframes check                    # opens in headless Chrome: runtime/layout/media/contrast problems (use --json)
npx hyperframes snapshot --at 0,3,8      # PNG stills at those seconds
npx hyperframes preview                  # live browser editor
npx hyperframes render --output final.mp4
npx hyperframes render --quality draft --output review.mp4      # draft | looks (default, CRF16) | high/delivery
npx hyperframes render --workers 4 --fps 30 -o final.mp4        # workers 1-24, each ~256 MB Chrome
npx hyperframes render --docker -o final.mp4                    # pinned Chromium/fonts (needs Docker)
npx hyperframes benchmark                                       # tune workers/fps/quality for this machine
```
Sources: https://hyperframes.heygen.com/guides/rendering.md , https://hyperframes.heygen.com/packages/cli.md , https://hyperframes.heygen.com/help.md

Notes: the docs say "brew install ffmpeg" if FFmpeg missing; user already has ffmpeg 6 on PATH. Default new video is 1920x1080 @ 30 fps. `--browser-gpu / --no-browser-gpu` = host GPU for WebGL capture vs deterministic SwiftShader; default "auto" (probes WebGL once, falls back). `--gpu` is only hardware FFmpeg encode (VideoToolbox on Mac). `--experimental-fast-capture` (draw-element capture, ~2x faster) is on where it can engage. [V cli.md]. Rendered MP4s carry two metadata tags naming HyperFrames (strip with ffmpeg -map_metadata -1). [V]

### Project structure [V]
```
my-video/
  index.html                 # root composition: declares size/duration/variables, mounts scenes
  compositions/*.html        # one sub-composition per scene (referenced from index.html)
  assets/                    # media, fonts (assets/fonts/), vendor JS (e.g. three.module.js)
  hyperframes.json           # registry + paths config
```
Source: skill text https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/SKILL.md ; hyperframes.json shape from https://github.com/heygen-com/hyperframes/blob/main/docs/packages/cli.mdx

### Composition and timing [V]
Root: `data-composition-id`, `data-start="0"`, `data-width`, `data-height`, `data-duration` (explicit duration REQUIRED for Three.js / unbounded animation), optional `data-fps`. Timed element: `class="clip" id="..." data-start data-duration data-track-index`. `data-start` can be relative: `"intro"`, `"intro + 0.5"`. Track index is only an editor lane; paint order is CSS z-index. Each composition builds ONE paused GSAP timeline and registers it: `window.__timelines["<composition-id>"] = tl`. If a composition has no GSAP timeline add `data-no-timeline` or every render waits 45 s. Sources: https://hyperframes.heygen.com/reference/html-schema.md , https://hyperframes.heygen.com/concepts/data-attributes.md , README example:
```html
<div id="stage" data-composition-id="launch" data-start="0" data-width="1920" data-height="1080">
  <video class="clip" data-start="0" data-duration="6" data-track-index="0" src="intro.mp4" muted playsinline></video>
  <h1 id="title" class="clip" data-start="1" data-duration="4" data-track-index="1">Launch day</h1>
  <audio data-start="0" data-duration="6" data-track-index="2" data-volume="0.5" src="music.wav"></audio>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.from("#title", { opacity: 0, y: 40, duration: 0.8 }, 1);
    window.__timelines = window.__timelines || {}; window.__timelines.launch = tl;
  </script>
</div>
```
Contract rules from the skill (selected) [V]: every timed element needs `class="clip"`, `data-start`, `data-duration` in seconds; no `Date.now()`, unseeded `Math.random()`, network fetches, timers, or `repeat: -1`; never tween display/visibility/autoAlpha on a `.clip` (animate a child); no CSS transform on an element GSAP also transforms; never `play()/pause()/seek` media; a `<video>` is `muted` unless `data-has-audio="true"`; separate `<audio>` elements need an `id` or they are dropped from the mix; no `crossorigin` on media; only bundled fonts resolve by name, other families need `@font-face` to a file in `assets/fonts/`; asset paths are `assets/...` with no leading slash; no CSS filters for grades/grain/blur on footage (use `npx hyperframes media-treatment`).

### Video and audio embedding [V]
`<video src data-start data-duration data-media-start="4" muted>` trims the source (media-start = in-point). Keep clip sound with `data-has-audio="true"` and `data-volume`. "To move or scale a video, animate a wrapper around it, not the video itself." (https://hyperframes.heygen.com/guides/video-components.md). Under the hood, headless Chrome cannot feed decoded `<video>` frames to the compositor, so the engine pre-decodes frames with FFmpeg and injects an `<img class="__render_frame__">` per video each frame (PR #1403: https://github.com/heygen-com/hyperframes/issues/1403) [S]. Browser-hostile codecs (HEVC/ProRes) get proxies for preview only; the original stays the render source. [V rendering.md]. Audio is mixed by FFmpeg from `<audio>`/`<video data-has-audio>`; audio effects/ducking ("voiceover carve") exist (https://hyperframes.heygen.com/studio/audio-effects.md, not read in full). [U] how a 25 fps source is resampled to a 30 fps composition (expected: frame-nearest extraction by time; check visually on a 10 s test).

### three.js / WebGL / canvas: the seek hook [V + S]
HyperFrames ships a built-in `three` runtime adapter. It sets `window.__hfThreeTime` (seconds) and dispatches `hf-seek` (CustomEvent, `detail.time`) on every seek. You draw ONLY in that handler. Canonical pattern (OpenMontage copy of the HyperFrames skill, https://github.com/calesthio/OpenMontage/blob/main/.agents/skills/hyperframes-animation/adapters/three.md ; adapter source `packages/core/src/runtime/adapters/three.ts`):
```html
<canvas id="three-layer"></canvas>
<script type="module">
  import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.181.2/+esm";   // better: vendor into assets/ (no network at render)
  const canvas = document.getElementById("three-layer");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(1920, 1080, false); renderer.setPixelRatio(1);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 16/9, 0.1, 100);
  function renderAt(t) { /* pose everything from t */ renderer.render(scene, camera); }
  window.addEventListener("hf-seek", e => renderAt(e.detail.time));
  renderAt(window.__hfThreeTime || 0);
</script>
```
Other documented facts: GLTF clips -> `mixer.setTime(t)` for all mixers; pin three version identically in importmap and bare imports; preload models/textures/HDRIs before the first seek. HyperFrames' own path-traced example shows the full discipline (https://hyperframes.heygen.com/guides/path-tracing.md): one `window.__hf.buildReady` promise for setup (build scene, compile shaders, draw a throwaway frame, read a pixel back); frames drawn only in the `hf-seek` listener, registered with `event.detail.waitUntil(promise)`; seeded randomness; seeks may arrive in any order and across several workers. IMPORTANT (path-tracing page): during render `Date.now()` and `performance.now()` return the seek time and stay frozen between seeks, and `requestAnimationFrame` callbacks wait for a seek, so setup that waits for a rAF or the clock never finishes. Alternative for non-Three canvas code: `window.__hyperframes.registerFrameSource({element, ready, render(sourceTime, signal), dispose})` with `data-no-timeline` (https://hyperframes.heygen.com/guides/frame-sources.md). Custom host adapter interface `FrameAdapter {id, init, getDurationFrames, seekFrame, destroy}` is "experimental v0" (https://hyperframes.heygen.com/concepts/frame-adapters.md). Also: `data-vfx-chain` per-pixel WebGL2 kernels, HTML-in-canvas texture, shader-transition package.

### Claude Code skills and install [V]
- Plugin (recommended for Claude Code): `claude plugin marketplace add heygen-com/hyperframes` then `claude plugin install hyperframes@hyperframes`; invoke `/hyperframes:hyperframes`. 
- Standalone: `npx skills add heygen-com/hyperframes` (picker; choose "Core Skills"; non-interactive/agent runs install all 9) or `npx hyperframes skills update` (installs the core set matching the CLI version; preferred, registry blob can lag hours). `npx hyperframes init` also installs the core set if missing. Run from the video project folder.
- Core skills: `/hyperframes` (read first; contract + work loop), `/hyperframes-cli`, `/hyperframes-registry` (~450 ready blocks: transitions, kinetic type, captions, charts, maps, 3D, camera), `/media-use` (music, SFX, images, voice, avatar, transcripts, cutouts, mix), `/reverse-any-video` and `/style-sampling` (both "HyperFrames Pro"). On demand: `/figma`, `/slideshow`, `/remotion-to-hyperframes`. 
- Catalog: `npx hyperframes add <block>` / `npx hyperframes catalog --query ...` installs editable blocks. 
- [U] whether a standalone `three` skill is in the official 9. Third-party listings (mcp.so, skills.rest) show `npx skills add heygen-com/hyperframes --skill three`, and OpenMontage ships a copy under `hyperframes-animation/adapters/three.md`; the official README lists only the 9 above, with Three guidance presumably inside `/hyperframes` references. Check after install.
- Transcripts: `npx hyperframes transcribe clip.mp4 [--language xx]` runs local transcription (Parakeet/Whisper), gives word timing; imports .srt/.vtt or a transcript JSON (`hyperframes transcribe transcript.json --dir ./my-video`). [V voice-and-audio.md, captions-and-recuts.md]. Since word timestamps already exist, import them rather than re-transcribe.

### Render speed [V]
Docs example: 300 frames at 1920x1080 rendered in 9.8 s (25 s with one costly CSS declaration), median of 3 runs (https://hyperframes.heygen.com/guides/performance.md). Path-tracing page: 8 s 720p three.js raster export took 10.8 s on an M4 Max with hardware GPU (path-traced 810 s). Rough extrapolation (mine, [K]): 93 s x 30 fps = 2,790 frames per video, i.e. low single-digit minutes for simple scenes; heavy three.js (particles/traffic) cost depends on whether WebGL runs on the Metal GPU or SwiftShader. [U] No measured M5 Max numbers for a three.js-heavy 1080p comp. Run `npx hyperframes benchmark`. Lambda/Cloud Run distributed rendering exists but is not needed.

### Known limitations and gotchas
1. WebGL regressions have shipped: v0.6.80 broke Three.js renders (black frames in render, fine in preview) because the GSAP batching proxy dropped `tl.eventCallback("onUpdate", ...)` and `setTimeout`-deferred setup; reproduced on macOS arm64; fixed in later release (https://github.com/heygen-com/hyperframes/issues/1260 , fix PR #1279). A 2026 report that 3D "vanishes" in 0.9.2+ exports was open/unreproduced (PR #7020 https://github.com/heygen-com/hyperframes/issues/7020: renderer releasing WebGL context of a hidden clip whose window ended). [S] => PIN the CLI version (`npx hyperframes@<x.y.z>`), drive Three from `hf-seek` (not GSAP onUpdate), build scenes synchronously/early, and verify a frame mid-video after each upgrade. Do not `setTimeout`-defer setup.
2. When no hardware GPU is usable, WebGL falls back to SwiftShader (software, many times slower; one 8-parallel-browser test lost a WebGL context and returned blank frames silently: https://github.com/howardc38/motion-fx-lab [S]). Check the render log line `browserGpuMode probe -> ...`; run a short render with `--browser-gpu` and `--no-browser-gpu` and compare timings. [U] which mode "auto" picks on this M5 Max.
3. Multiple workers: each worker is its own Chrome page seeking frames in ANY order. A stateful simulation (traffic, particles with integration) must be a pure function of t, or replay deterministically from a seed with a cache, never "advance one step per frame".
4. Each overlapping scene needs its own source instance; many simultaneous WebGL canvases = many contexts (browser limit ~16). Prefer ONE persistent three.js canvas with scene groups toggled per shot over one canvas per scene. [K]
5. Fonts differ per machine; local render can shift by a pixel. Declare `@font-face` files in `assets/fonts/`. Docker render for byte-exact reproducibility.
6. Frame adapter API is experimental v0; docs and CLI change weekly. Motion blur is the stated exception to determinism.
7. MP4 default is 4:2:0; thin saturated text can fringe. `--chrome-subsampling 444` exists but doubles render time and many players cannot play it; use only for masters.
8. CDN imports at render time = network fetch; vendor three.js into `assets/vendor/` and import by relative path.
9. Telemetry on by default (`npx hyperframes telemetry disable`). Usage beacon call in skill sends skill name; account-linked only if signed in.
10. "HyperFrames Pro" skills and HeyGen avatars/voices/music catalog need a HeyGen account; not needed here (avatar clip exists).

---------------------------------------------------------------------------
## 2. Remotion (alternative)

Current: v4.0.542 (Nov 9, 2026) [S remocn.dev comparison table]; Chrome Headless Shell 158 from 4.0.540 [V https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell]. 5.0 not yet released as far as found; docs mention what changes at 5.0 (ANGLE becomes default) [V].

### Scaffold, install, render [V unless noted]
```
npx create-video@latest                  # [K] interactive scaffold (pick blank/TypeScript)
cd my-video && npm i three @react-three/fiber @remotion/three @types/three
npm run dev                              # Remotion Studio (npx remotion studio)
npx remotion browser ensure              # pre-download pinned Chrome Headless Shell
npx remotion render src/index.ts MyComp out/video.mp4 --gl=angle --concurrency=8
```
Install line from https://www.remotion.dev/docs/three ; render flags from https://www.remotion.dev/docs/cli/render ; macOS 15+ required [S promptsrush.com].

### @remotion/three with React Three Fiber [V]
- `<ThreeCanvas width height camera=...>` replaces R3F `<Canvas>`; use `useCurrentFrame()` and `interpolate()` directly in markup, NOT `useFrame()`. During rendering it forces `frameloop='never'` and re-renders via `advance()` per frame. If wrapped in `<Sequence>`, pass `layout="none"`. https://www.remotion.dev/docs/three-canvas , https://www.remotion.dev/docs/three
- Starter: `remotion-template-three`. `<ThreeWebGPUCanvas>` exists for WebGPURenderer/TSL.
- Video as texture: `useVideoTexture()`/`useOffthreadVideoTexture()` are deprecated; use `@remotion/media` `<Video headless onVideoFrame>`; with async texture updates call `advance(performance.now())` not `invalidate()`.
- Vanilla three.js (non-R3F) also works inside a normal component with `delayRender()`/`continueRender()` and a canvas redrawn from `useCurrentFrame()`. [K]

### Avatar video [V]
`<OffthreadVideo>` extracts the exact frame with FFmpeg outside the browser and shows it as `<Img>`; supports `startFrom/trimBefore`, `volume`, `muted`, `transparent` (PNG, slower; leave false). No `loop` prop. Docs now prefer `<Video>` from `@remotion/media` for new work, falling back to OffthreadVideo when it cannot embed. https://www.remotion.dev/docs/offthreadvideo , https://www.remotion.dev/docs/media/video . Circle bubble: wrapper `<div style={{borderRadius:'50%', overflow:'hidden'}}>` with the video `objectFit:'cover'`, position animated via `interpolate` on frame.

### Headless WebGL flag on macOS [V]
"Three.JS does not render with the default OpenGL renderer - we recommend to set it to `angle`" in Remotion 4.x; new projects' `remotion.config.ts` already has `Config.setChromiumOpenGlRenderer('angle')`. CLI: `--gl=angle`. Node API: `chromiumOptions: { gl: 'angle' }` in `renderMedia()/renderFrames()/selectComposition()` (config file does NOT apply to SSR API). Without it Chrome Headless Shell may output an empty canvas. In 5.0 ANGLE is default with SwiftShader fallback. `swangle` for no-GPU (default on Lambda). Known issue: ANGLE has memory leaks on long renders; split long renders. https://www.remotion.dev/docs/gl-options , https://www.remotion.dev/docs/three-webgpu-canvas . Since 4.0.534, Apple Silicon Headless Shell captures frames through shared memory (no JPEG), a speed-up (https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell). [U] measured speed for this workload.

### Licence for an individual [V]
Free for: an individual (personal or commercial), for-profit orgs of up to 3 people, non-profits, evaluation. No functionality difference between Free and Company licence; automation/batch rendering allowed under the Free licence. Companies with 4+ people pay (about $100/month minimum per a secondary table). Licence is source-available (not OSI open source) and "will change slightly in 5.0". https://www.remotion.dev/docs/license/pricing , https://www.remotion.dev/docs/license/faq . Telemetry page exists (https://www.remotion.dev/docs/telemetry).

Remotion downsides for this job: React/bundler/~950 MB node_modules [S HyperFrames comparison guide], more code per scene; but a single pure function of frame number is conceptually simpler and harder to get subtly wrong (even HyperFrames' own doc says so: https://hyperframes.heygen.com/guides/hyperframes-vs-remotion.md).

---------------------------------------------------------------------------
## 3. Recommendation

**Use HyperFrames, gated by a 15-second spike; fall back to Remotion if the spike shows black WebGL frames or software-GL speed.**

Why: (a) HTML + vanilla three.js is what an agent writes best and the spec ships a first-party Three seek adapter, so the solar system/traffic/particle scenes are plain three.js with a `renderAt(t)` function; (b) kinetic type and fast cuts are GSAP timelines, with ~450 prebuilt blocks (transitions, captions, kinetic type) and a Claude Code plugin that encodes the rules; (c) it handles `<video>` + `<audio>` mixing, word-timed captions via `hyperframes transcribe`, and sound design out of the box; (d) Apache 2.0, no build step. Remotion is the safer-maturity choice (ANGLE/Metal documented, Apple Silicon shared-memory capture, stable API, R3F integration), and equally free for an individual, so keep it as the fallback.

Risk to accept: HyperFrames is young; WebGL render regressions have shipped between minor versions. Pin the version.

### Minimal HyperFrames commands (scaffold + three.js + embedded video)
```
mkdir -p ~/vid && cd ~/vid
npx hyperframes@latest init demo --non-interactive      # note the version it prints, then pin it in all later commands
cd demo
claude plugin marketplace add heygen-com/hyperframes && claude plugin install hyperframes@hyperframes   # or: npx hyperframes skills update
cp /path/avatar.mp4 assets/avatar.mp4
curl -L https://cdn.jsdelivr.net/npm/three@0.181.2/build/three.module.js -o assets/vendor/three.module.js   # vendor it (mkdir assets/vendor first)
# edit index.html: 1920x1080 root, <canvas> + hf-seek three scene, <video class="clip" ... muted> inside a rounded wrapper, <audio id=...>
npx hyperframes lint && npx hyperframes check
npx hyperframes snapshot --at 0,1,5
npx hyperframes render --quality draft --output review.mp4     # smoke test, time it
npx hyperframes render --output final.mp4
```
Fallback Remotion:
```
npx create-video@latest && cd <name> && npm i three @react-three/fiber @remotion/three @types/three
npx remotion render src/index.ts Main out/final.mp4 --gl=angle
```

### Rules for deterministic three.js (both frameworks)
1. Every visible value = f(frame or t). Derive `t = frame / fps` (Remotion `useCurrentFrame()`; HyperFrames `event.detail.time`). Never read `Date.now()`, `performance.now()`, `THREE.Clock`, `clock.getDelta()`.
2. No `requestAnimationFrame` / `renderer.setAnimationLoop` / `useFrame()` as the clock. Render once per seek (HyperFrames: in the `hf-seek` handler; Remotion `ThreeCanvas` forces `frameloop='never'`).
3. Seeded RNG only: replace `Math.random()` with a mulberry32/sfc32 seeded per object (e.g. seed = scene id + index). Seed before building the scene because three's object uuids also use Math.random (path-tracing page).
4. Stateful sims (traffic, particles, weather): compute positions analytically from t, or precompute a fixed-timestep trajectory table from the seed (e.g. 1/60 s steps) and interpolate by t. Must be valid for out-of-order seeks and parallel workers; never "step on each frame".
5. Pin renderer size and `setPixelRatio(1)`; match canvas to 1920x1080; fixed camera aspect.
6. Preload/await all assets (GLTF, textures, fonts, HDRI) before the first frame is requested (HyperFrames: ready promise/synchronous build; Remotion: `delayRender`/`continueRender`). No fetches at seek time; vendor libraries locally.
7. GLTF/AnimationMixer: `mixer.setTime(t)`, not `update(delta)`. Camera moves: functions of t (spline/ease), never OrbitControls damping.
8. No post-processing that uses previous-frame history (TAA, afterimage, trails/motion-blur accumulation) unless reconstructable from t.
9. Avoid `Math.sin(Date.now())`-style shaders: pass `uTime` uniform = t.
10. Verify: snapshot t=4, t=0, t=4 again and require identical pixels (HyperFrames: `npx hyperframes snapshot --at 4,0,4 --no-end`); render twice and diff a frame.

---------------------------------------------------------------------------
## 4. Look and sound best practices (mostly [K]; tool-specific claims cited)

### Circular avatar bubble
- Mask: wrapper `div` with `width=height=D; border-radius:50%; overflow:hidden; border:4-6px solid <accent/white>; box-shadow: 0 8px 30px rgba(0,0,0,.45)`; video `width:100%;height:100%;object-fit:cover; object-position:50% 25%` (portrait 1080x1920 cropped into a circle: slide the focal point up to keep the face centred, test on a still). Animate the WRAPPER (HyperFrames docs say never animate the video element itself; Remotion fine either way). Add a thin outer ring/glow pulse driven by speech if desired. Avoid CSS filter on footage in HyperFrames (use media-treatment).
- Size: ~240-320 px diameter at 1080p (about 22-30 % of frame height); 60-80 px safe margin from edges; keep out of the caption band and key graphics.
- Motion: reposition only on cuts or beat accents, 0.4-0.7 s, `power3.inOut`/`expo.out`, slight scale overshoot (1.0 -> 1.06 -> 1.0), cycle corners TL -> TR -> BR -> BL or choose the emptiest corner per shot; optionally enlarge to ~400 px for emphasised lines. One persistent `<video>` element for the full 93 s (one frame-extraction pipeline) moved by one GSAP timeline; do not instantiate one per scene.
- Lip-sync: the avatar's audio must stay locked to the picture. Use the clip's own audio (`data-has-audio="true"` / `<Video>` audio) or a single `<audio>` of the same file; do not mix both. Convert 25 -> 30 fps by letting the renderer pick the nearest source frame, or set composition fps to 25 if sync is critical [U: not verified how HyperFrames resamples].

### Captions from word timestamps
- Group words into 2-4-word chunks (about 12-20 characters/line, max 2 lines), break at phrase boundaries; show the chunk from first-word start to last-word end (+0.1-0.2 s hold); highlight the active word (colour/scale pop 1.05-1.15x) by switching at each word's `start` time; build one GSAP tl.set/.to per word at absolute word.start. Lead the visual by ~1-2 frames (33-66 ms) because audio perception lags. Bottom third (y 75-88 %), large (56-72 px at 1080p), heavy sans (Inter/Montserrat/Poppins), white with dark stroke or pill background, safe from the bubble. Emphasis words get accent colour sparingly (HyperFrames guidance: highlight the 2-3 key words, embed only the peak words; cut first, then caption, or captions drift) [V captions-and-recuts.md]. Proof names/numbers against the transcript.
- HyperFrames `/hyperframes-registry` has ready caption blocks to start from [V]; supplied timestamps can be fed in as JSON via `hyperframes transcribe transcript.json --dir ...` [V].

### Pacing for fast cuts
- 93 s at 2-4 s per shot = roughly 25-45 shots; something visibly changes (cut, camera move, type pop, bubble move) every ~1-1.5 s; hold 4-6 s only for a key stat. Cut on the beat or on the word that starts a clause; use J/L cuts (graphics change just before the line). Vary shot type (3D scene / type card / data card / avatar-forward). Open with a hook under 3 s. Land text 0.1-0.2 s before the spoken word it illustrates. Use hard cuts plus 4-8-frame whip/shader transitions (HyperFrames `@hyperframes/shader-transitions`), not long dissolves.

### Free sound effects and music (check licence per file; keep a credits file)
- Pixabay Content License: free use, no attribution required, modification allowed; cannot resell standalone; watch for recognisable trademarks/people. [V https://pixabay.com/service/license-summary/]
- Freesound: filter to CC0 (do what you like) ; CC-BY needs credit; avoid CC-BY-NC for anything commercial. [V https://freesound.org/help/faq/]
- YouTube Audio Library: tracks marked "attribution not required" are fine; Creative-Commons tracks require crediting in the video description; Content-ID-safe. [V https://support.google.com/youtube/answer/3376882] (licence is for use on YouTube-hosted videos in practice; confirm if distributing elsewhere [K]).
- HyperFrames bundled SFX set plus Openverse search, local Kokoro TTS, and a 10,000-track catalog only with a HeyGen account. [V voice-and-audio.md]
- Others from memory, NOT verified this session [U]: Kenney.nl (CC0 game SFX), Mixkit (free licence), Incompetech/Kevin MacLeod (CC-BY, attribution required), Uppbeat free tier (attribution).
- Mix: music about -18 to -24 dB under voice (duck 6-10 dB while speaking; HyperFrames has a voiceover carve), SFX on visible actions (whoosh on cuts, tick on counters), final loudness about -14 LUFS integrated, true peak -1 dBTP; check with `ffmpeg -i out.mp4 -af loudnorm=print_format=summary -f null -`. [K]

---------------------------------------------------------------------------
## Not verified
- Actual render speed of a three.js-heavy 1080p scene on the M5 Max for either tool; whether HyperFrames "auto" uses Metal-backed WebGL on this machine.
- How HyperFrames resamples 25 fps video to a 30 fps timeline; frame-accuracy of the avatar/audio lock.
- Whether the official HyperFrames skill set contains a dedicated `three` skill (third-party listings suggest yes).
- `npx create-video@latest` exact prompts/flags; Remotion 5.0 status; exact Remotion Company licence price.
- Free-asset licences beyond Pixabay, Freesound, YouTube Audio Library.
- Nothing was installed or rendered; all code above is from docs, untested.
