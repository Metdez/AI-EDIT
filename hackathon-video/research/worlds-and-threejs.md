# Research: Sundai, world models, three.js techniques, free assets
Compiled 2026-11-20. "VERIFIED" = read on a fetched/searched page. "FROM MEMORY" = not re-checked online; check before relying on it.

## 1. Sundai

- What: Boston/Cambridge nonprofit hacker community "born at MIT and Harvard". Sundai Club meets every Sunday and builds a new AI app from scratch by end of day (110+ consecutive weekly hacks as of 2026; Hack 143 was Oct 4 2026). Founded Jan 2024 by Serge Vasylechko, Leandra Tejedor, Artem Lukoianov, Gabriela Torres Vives. 501(c)(3). 1,500+ members, 300+ AI MVPs, 100+ hacks, "$20M+ raised" (their own claims). Address: Cambridge, MA 02139; team@sundai.club. VERIFIED
  - https://www.sundai.foundation  (org site)
  - https://www.sundai.club  (club, events, projects)
  - https://www.sundai.foundation/about  (story)
  - https://www.sundai.club/events/boston/sundai-hack-143-biomarkers-of-aging-hack  (typical event page)
- Taglines (all verified on their pages):
  - "Building & Launching AI Prototypes Every Sunday." (sundai.club)
  - "A hacker community in Boston" (foundation)
  - "Ship an AI-first app EVERY Sunday."
  - Mission line: "Push the envelope of what is possible to do with AI in a day."
  - Vision: "A world where hacking with AI tools is the new literacy."
  - Principles: Build. Ship ("Get off localhost"). Shortcuts. Motto: "rapid prototyping with AI". They say "hack", not "hackathon".
- Visual style (scraped from sundai.foundation with Firecrawl branding extraction, confidence ~0.9):
  - Primary/accent/link: pink `#EC8796`; secondary: dark navy `#111827`; background white `#FFFFFF`; text black.
  - Fonts: headings VT323 (pixel/terminal), body Space Mono (monospace). Both are Google Fonts, SIL OFL 1.1 (https://github.com/googlefonts/spacemono, https://fonts.google.com/specimen/VT323).
  - 0px border radius, squared buttons, grey 1px borders, playful low-energy "retro hacker terminal" tone. Event pages use sparkle emoji section headers. The foundation site links a "Brandbook" page; I did not find/read it, so official logo usage rules are unverified.
  - Logo file: https://www.sundai.foundation/_next/image?url=%2Flogos%2Fsundai_logo_dark.png&w=64&q=75 (check usage rights before putting a logo in the video; plain text "Sundai" in VT323 is safer).
- The specific three.js / 3D-simulation hack: NOT FOUND. Searched sundai.club, sundai.foundation, aiweek.boston, luma. Found only other recent hacks (Voice Agents Jun 7 2026; Recursive Learning, Sep 27 2026; Hack 143 Biomarkers of Aging Oct 4; Hackachusetts w/ Kiro Oct 24). Cannot confirm the date/venue/sponsors; rely on the speaker's script. Sundai's Mantis hack (visual AI) shows they have done visual themes before (luma.com/hwxuxliq).

## 2. World models (as of 2026-11-20)

One sentence: a world model is a generative AI system that simulates an environment you can look around in and move through (and that responds to actions), rather than producing a single image or a block of text.

### Main ones today
| Model | What it outputs | Access (as found) | Usable in three.js? |
|---|---|---|---|
| Google DeepMind Genie 4 (announced Oct 27 2026, https://deepmind.google/blog/genie-4-a-new-generation-of-world-simulation) | Real-time generated interactive video world with native audio, up to ~2 min consistency | Project Genie update Nov 18 2026 rolling out to eligible Google AI Ultra (18+) subscribers; Pro waitlist; no public API yet. https://blog.google/innovation-and-ai/models-and-research/google-deepmind/genie-4-now-available-project-genie | NO. Video stream only, no exportable 3D. Use screen-recorded clips as video textures at most. |
| Genie 3 (Aug 2025; Project Genie Jan 29 2026) | Same family, 720p/24fps, 3-min sessions in model picker | Google AI Ultra | NO (same reason) |
| World Labs Marble (Fei-Fei Li; Marble 1.1 since Apr 2 2026; World API since Jan 2026) https://worldlabs.ai/blog/marble-world-model | Persistent 3D world from text/image/video/pano; exports Gaussian splats (.spz/.ply, ~2M or ~500K splats), collider mesh GLB, HQ mesh GLB, pano, camera-path video | Web app free tier generates but CANNOT export; exports need Standard ($20/mo as of Aug 2026); HQ mesh + commercial rights need Pro. https://docs.worldlabs.ai/marble/export/gaussian-splat/index | YES, best fit. Spark renders the splats in three.js. |
| Odyssey (Odyssey-3) | Real-time interactive video | Public browser preview, API by request | No (video) |
| Decart Oasis 3 | Real-time interactive video, API | free credits | No (video) |
| Runway GWM Worlds 2 | Interactive video w/ audio | request access | No |
| Tencent HY-World 1.5 / 2.0 (Hunyuan) | Open weights (community licence); HunyuanWorld 1.0 makes 3D mesh scenes from text/image | self-host, big GPU | Possibly (meshes -> GLB); unverified |
| Skywork Matrix-Game 4.0 (Oct 15 2026) | Playable generated game video, open weights (Apache-2.0 per HF) | self-host | No (video) |
| NVIDIA Cosmos 3 | Robotics/AV world foundation models | n/a | No |
Sources: https://apidog.com/blog/project-genie-alternatives (as of Oct 29 2026), https://vidwip.com/blog/best-ai-world-models, https://hokai.io/hub/tools/marble, https://www.therundown.ai/tools/marble. These are third-party roundups; details like prices/frame-rates are not independently verified. I did not read Odyssey/Decart/Runway primary pages.

Key point for the video: only splat/mesh-producing models (Marble, Hunyuan) can live inside three.js. For Genie-style models, show the real generated footage as a framed "window"/portal video, or fake the look.

### Spark (three.js splat renderer)
- npm: `@sparkjsdev/spark` (MIT, by World Labs, v2.4.0 on CDN per docs; 2.x has streamed level-of-detail). https://sparkjs.dev/docs/ , https://github.com/sparkjsdev/spark , https://worldlabs.ai/blog/spark-2.0
- Formats: .ply (incl. compressed), .spz, .splat, .ksplat, .sog/.zip, .rad. WebGL2, works with plain `WebGLRenderer` (it is NOT WebGPU-dependent). Splats sort correctly alongside normal meshes.
- Minimal code (VERIFIED, from the official quick start):
```html
<script type="importmap">{"imports":{
 "three":"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js",
 "three/addons/":"https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/",
 "@sparkjsdev/spark":"https://sparkjs.dev/releases/spark/2.4.0/spark.module.js"}}</script>
<script type="module">
import * as THREE from "three";
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.01, 1000);
const renderer = new THREE.WebGLRenderer(); renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
const spark = new SparkRenderer({ renderer }); scene.add(spark);
const world = new SplatMesh({ url: "./world.spz" });   // .ply/.spz/.sog auto-detected
world.quaternion.set(1, 0, 0, 0);  // Marble/OpenCV coords -> OpenGL: flip Y and Z
scene.add(world);
renderer.setAnimationLoop(() => { /* move camera along a path here */ renderer.render(scene, camera); });
</script>
```
- Marble worlds are OpenCV axes (+y down, +z forward); the quaternion (1,0,0,0) flip above fixes "upside-down" (Marble docs, https://docs.worldlabs.ai/marble/export/specs).
- For deterministic video capture: drive the camera from frame number (`t = frame/fps`), not wall clock; splat sort is async in a worker so wait a few frames (or on-demand render, https://sparkjs.dev/docs/on-demand-rendering/) before grabbing each frame. This determinism point is my inference, test it.
- Spark examples worth copying: https://sparkjs.dev/examples/ (Particle Animation, Splat Reveal/Dissolve/Transitions, Procedural Splats, Depth of Field, Lofi Worlds, Streaming LoDs). Also World Labs tutorial: first-person splat game with Spark + three.js (https://www.youtube.com/watch?v=TiLRhSdGsqY).
- three.js itself also now ships a `webgpu_gaussian_splat` example (listed on https://threejs.org/examples); not inspected.

### Free splat/world files you can fly through
- BEST CHEAP ROUTE: Marble sample worlds listed on https://docs.worldlabs.ai/marble/export/specs ("Narrow European cobblestone lane", "Elegant library with fireplace", "Modern house with lush landscaping", "Rustic kitchen", "Warm traditional kitchen") with SPZ 2M / 500K and PLY links. These are offered "to test against". LICENCE NOT STATED on the page I read, so confirm with World Labs before putting them in a published video (or generate your own on a paid Standard plan; commercial rights need Pro per their docs).
- Spark's own sample assets e.g. https://sparkjs.dev/assets/splats/butterfly.spz (used in the docs; licence not stated; object-sized, not a world).
- CC0 splats (explicit public domain): steam studio photogrammetry PLYs, https://note.com/steam_studio/n/ne9736d94f162 (all CC0; scene scale/size not checked). Innerscene CC0 samples (cactus, objects trained from Poly Haven models): https://www.innerscene.com/tools/gaussian-splat-viewer
- Large scene datasets for research use (licences differ per source, check before use): https://huggingface.co/datasets/GaussianWorld/scene_splat_49k , https://github.com/manycore-research/InteriorGS . Classic 3DGS "garden/room/kitchen" scenes exist (Mip-NeRF 360) but their licence is non-commercial/unclear: avoid.
- Sketchfab/SuperSplat have splats but licences vary per upload (many CC-BY): attribute or skip.
- Fallback with no licence risk: build a procedural "world" (see section 3) and use Spark's Procedural Splats, or render your own capture.

## 3. Cheap, deterministic, impressive three.js techniques

General recipe for all: one `requestAnimationFrame`-free render function `render(t)` driven by the video frame number; seed every random with a fixed PRNG (e.g. mulberry32), never `Math.random()` or `Date.now()`/`clock.getDelta()`. Add `EffectComposer` + `UnrealBloomPass` (three/addons/postprocessing/) and `OutputPass` for the glow look. Pixel-ratio 1, fixed canvas size. Capture via frame-by-frame `canvas.toBlob`/Puppeteer screenshot or `MediaRecorder` only for rough previews.
Caveat: GPU-compute (WebGPU/TSL) demos are fast but need `WebGPURenderer` and a Chrome with WebGPU; headless capture may need flags. The CPU/ShaderMaterial versions below are the safest for deterministic rendering.

### 3a. GPU particle swarms (thousands to millions of points, flow fields, morphing to shapes/text)
- Approach: One `THREE.Points` with `BufferGeometry` (positions + a per-point seed attribute). Do all motion in the vertex shader as a pure function of (seed, uTime): curl-noise/flow-field displacement, then `mix(posA, posB, smoothstep(uMorph))` where posB is a target shape. Targets: sample points from a mesh surface (`MeshSurfaceSampler`, three/addons/math/) or from text drawn to a 2D canvas -> read `getImageData` -> pick lit pixels as x,y. Additive blending, `depthWrite:false`, size attenuation, bloom.
- Pure function of time = frame-exact and deterministic (no stateful simulation).
- Classes: `Points`, `BufferGeometry`, `ShaderMaterial`, `AdditiveBlending`, `MeshSurfaceSampler`, `EffectComposer`, `UnrealBloomPass`. For heavy sims: `GPUComputationRenderer` (three/addons/misc/) or WebGPU `instancedArray` + `Fn().compute()`.
- References (names seen in https://threejs.org/examples): webgpu "compute / particles", "tsl / compute / attractors / particles", "tsl / galaxy", "compute / points", "compute / birds"; webgl "points / waves", "points / dynamic". Tutorial for 1M-particle galaxy: https://threejsroadmap.com/blog/galaxy-simulation-webgpu-compute-shaders ; TSL field guide with attractors: https://blog.maximeheckel.com/posts/field-guide-to-tsl-and-webgpu

### 3b. Stylised solar system
- Approach: `Group` per planet orbiting at angle = `omega_i * t` (use made-up exaggerated speeds, not real scale). Sun = emissive `SphereGeometry` + a few additive sprite/glow shells + bloom. Planets = `MeshStandardMaterial` with equirectangular colour maps; Saturn rings = `RingGeometry` with alpha texture (remap UVs); orbit lines = `Line` with `EllipseCurve` points. Star field = 5-10k `Points` on a big sphere. A `PointLight` at the Sun; camera on a spline fly-by.
- Classes: `SphereGeometry`, `RingGeometry`, `MeshStandardMaterial`, `PointLight`, `Points`, `CatmullRomCurve3` (camera path), `UnrealBloomPass`.
- References: three.js "tsl / earth" and "tsl / galaxy" examples (https://threejs.org/examples); textures from Solar System Scope (section 4). Earth night-lights + clouds layer is the cheap "wow".

### 3c. Boston-like city / traffic
- Approach: Grid of streets (rotated a bit, add one diagonal "Mass Ave" and a curved river edge for a Boston feel). Buildings: one `InstancedMesh` of unit boxes, per-instance matrix (random height from seeded PRNG, taller toward the middle "downtown") and per-instance colour via `setColorAt`; emissive window texture or fake windows in a shader at night. Cars: one `InstancedMesh` (tiny box) with N=2-5k instances; each car has (lane polyline, speed, offset); position = lane point at `fract(offset + speed*t)`, written to the instance matrix each frame (or in a vertex shader with the lane data in a `DataTexture` so it costs nothing). Headlight/taillight = additive sprites or bloom on bright emissive. Add intersections that flash red/green on a time function.
- Classes: `InstancedMesh`, `InstancedBufferAttribute`, `Object3D` (dummy for matrices), `DataTexture`, `Fog`, `UnrealBloomPass`.
- Real data option: load real OSM building footprints for a few Boston blocks and extrude with `ExtrudeGeometry` into one merged mesh (section 4).
- References: three.js webgpu "generator / city" and "generator / building" examples (https://threejs.org/examples, not inspected); GitHub "git-city" (GitHub profile as a pixel-art 3D city): https://github.com/srizzon/git-city (licence not checked).

### 3d. Weather: rain, clouds, lightning, tornado
- Rain: `LineSegments` or instanced thin quads, y = fract(seedY - speed*t) wrapped in a box around the camera, in the vertex shader (deterministic). Add `FogExp2`, a dark blue background, wet-road reflections via `Reflector` or a fake mirrored emissive.
- Clouds: cheap = ~30-60 billboard `Sprite`s/instanced quads with a soft noise texture, slow drift, lit from below; impressive = raymarched volume in a `ShaderMaterial` on a `BoxGeometry` (fbm 3D noise, Beer-Lambert) at low resolution. Libraries: `@takram/three-clouds` (geospatial volumetric clouds, https://www.npmjs.com/package/@takram/three-clouds, needs `postprocessing` lib), https://github.com/mattatz/THREE.Cloud (MIT), https://github.com/CK42BB/procedural-clouds-threejs (WebGPU raymarched, WebGL fallbacks; licence not checked).
- Lightning: generate a jagged branching polyline from a seeded PRNG (recursive midpoint displacement), render as `Line2`/`LineSegments2` (fat lines, three/addons/lines/) with additive material; on the flash frame set `AmbientLight`/background intensity high and bloom strength up for 2-3 frames, then decay. Cheap and extremely readable. Three.js has an official `LightningStrike` addon (three/addons/geometries/LightningStrike.js, FROM MEMORY).
- Tornado: stack of ~50-80 rotating rings or a `Points` funnel: radius = r0 + k*y, angle = omega(y)*t + seed, plus noise wobble; additive dark-grey points + a few debris instances. Official reference: webgpu "tsl / vfx / tornado" example (https://threejs.org/examples). Also webgpu "compute / particles / rain" and "snow".
- Classes: `LineSegments`, `Line2`, `Points`, `Sprite`, `ShaderMaterial`, `FogExp2`, `UnrealBloomPass`.

### 3e. "Flying through a world" shots
- Procedural terrain: `PlaneGeometry` (e.g. 256x256 segments) displaced in the vertex shader by fbm noise of (x, z + speed*t) so terrain scrolls toward camera; colour by height; wireframe overlay or "synthwave" glowing grid lines via fwidth() on UVs. Camera on a slight sine bob. Reference: webgpu "tsl / procedural / terrain" and "tsl / raging / sea" on https://threejs.org/examples.
- Wireframe grid tunnel: `GridHelper` or repeated rings recycled with `mod(z - speed*t, L)`; add speed lines (stretched Points) for "hyperspace".
- Portal: render the destination scene to a `WebGLRenderTarget`, map it on a ring/disc mesh (see three.js example "portal" in the webgpu list; or the classic stencil trick), with an emissive swirling rim and bloom. Camera dolly through the portal, switch scene when it fills the screen. This is the best way to show a world model: the portal shows pre-rendered Marble/Genie footage (video texture) or a Spark splat scene.
- Classes: `PlaneGeometry`, `ShaderMaterial`, `WebGLRenderTarget`, `VideoTexture`, `CatmullRomCurve3`, `Fog`, `UnrealBloomPass`.

## 4. Free, licence-safe assets

- Boston/OSM data
  - OpenStreetMap extracts: ODbL. Must credit "(c) OpenStreetMap contributors" and make clear data is ODbL (link https://www.openstreetmap.org/copyright). Derived/adapted databases must stay ODbL; for a video you only need the on-screen credit. VERIFIED (https://www.openstreetmap.org/copyright, https://wiki.openstreetmap.org/wiki/Legal_FAQ)
  - How to get a small extract (FROM MEMORY, test): Overpass API query for `way["building"]` and `way["highway"]` inside a bbox around e.g. Back Bay/Downtown (~42.350,-71.080 to 42.365,-71.050), export as JSON, simplify to a few hundred KB and embed. Overpass Turbo: https://overpass-turbo.eu . Keep the bbox small (a few blocks) so the JSON is < 1 MB.
  - Other sources (existence verified via MIT GIS guide https://libguides.mit.edu/gis/buildings; licences not checked): Boston building outlines + heights (listed there), MassGIS (https://www.mass.gov/orgs/massgis-bureau-of-geographic-information), Analyze Boston open data hub https://data.boston.gov , Microsoft Building Footprints (ODbL, FROM MEMORY). I did not find a specific Boston "3D buildings" dataset page to cite.
  - Zero-risk option: procedural fake-Boston (seeded) with a nod, e.g. brick-red/brownstone palette, Charles River strip, Zakim-style cable bridge silhouette. Skip real data if time is short.
- Planet textures: Solar System Scope, equirectangular, CC BY 4.0 (commercial use OK with credit). https://www.solarsystemscope.com/textures ; also mirrored on Wikimedia Commons https://commons.wikimedia.org/wiki/Category:Solar_System_Scope (2k/8k Earth day/night/normal/specular, Jupiter, Mars, Saturn ring alpha, etc.). Credit line: "Textures: Solar System Scope (CC BY 4.0), based on NASA data". VERIFIED
- HDRIs / textures / models: Poly Haven, all CC0, no attribution required, 1K-16K HDR/EXR, free API. https://polyhaven.com/license VERIFIED. ambientCG is also CC0 (per a third-party summary, https://app.cinevva.com/guides/free-textures-hdris-materials).
- Fonts: Space Mono and VT323 (Sundai's own pair) are SIL OFL 1.1, free to embed in video. https://github.com/googlefonts/spacemono , https://fonts.google.com/specimen/VT323 . Three.js text options: `FontLoader` + `TextGeometry` with the bundled helvetiker JSON (three/examples/fonts, licence: see three.js repo; FROM MEMORY), or render text to canvas and use as a texture / particle targets (no font-file issue if you use OFL fonts).
- three.js itself: MIT. Spark: MIT.

## What I could not verify
- The specific Sundai three.js / 3D-simulation hack (date, venue, sponsors, name): not found.
- Sundai's official Brandbook page (logo rules); colours are from the live site CSS, not the brandbook.
- Licence of the Marble sample worlds and Spark's sample splats.
- Whether Genie 4 / Project Genie output can be downloaded or re-used in a published video (Google terms unchecked).
- Exact Boston 3D building dataset URL/licence; the Overpass query is from memory.
- three.js example pages were only seen as names in the index, not opened; check each exists in the r18x build you pin.
- Third-party world-model prices/specs (Odyssey, Decart, Runway, Matrix-Game) come from roundup blogs.
