# Systems digest: Nate + Motion video + HyperFrames facts + workspace pitfalls

Prepared for: 10 variants of a 45 s, 1080x1920 talking-style ad (real camera footage, screen recording, voiceover, captions, SFX).
Sources read in full: `Nate vid/transcript.md`; `hackathon-video/research/{nate-vid,motion-vid,frameworks}.md`; `hackathon-video/BRIEF.md`; Motion video text from `hackathon-video/transcripts/motionvid.txt` (NOTE: `Moption Vid/transcript.md` is a 0-byte empty file; the same video's transcript lives in `hackathon-video/transcripts/motionvid.{txt,srt}`); ~9 frames from `frames-nate/` and `frames-motion/`; HyperFrames skill refs (`vertical.md`, `sound.md`, `captions.md`, `overlays.md`, `motion.md`, `format.md`, `SKILL.md`); `media-use` SKILL + `references/{audio,resolve,mixing,media-treatments,operations}.md` + `audio/references/{sfx,transcribe}.md` + `audio/assets/sfx/manifest.json`; `reverse-any-video/SKILL.md`; the five `REVIEW.md` files; `template/{index.html,package.json}`. I also ran `npx hyperframes@0.9.72 catalog --tag caption-style|transition` in `template/` to get real registry names.
Caveat: model names in Nate's transcript ("Opus 5.5", "Fable 5.1", "GPT-6 Astra") are as spoken/auto-captioned; not verified.

---------------------------------------------------------------------------
## 1. Nate's system (Nate Herk, "Opus 5.5 Just Changed Video Editing Forever")

### Tools
- HyperFrames (his words: "it's completely free and we give Claude Code this tool and it basically writes HTML and animates it"). Setup prompt: "Hey, set up Hyperframes so that we can use it to animate videos." (paste the github.com/heygen-com/hyperframes URL).
- Claude Code / Claude desktop, Opus 5.5 at **High** effort ("pretty much all these examples I've been running on high"). Prompt began with `/goal "<path to mp4>"`.
- Transcription: ElevenLabs API (quicker, pay per use) or Whisper (local, free, slower). "Transcribe is essential."
- Asset gen: "key.ai" (spelling from auto-transcript, likely kie.ai, unverified) for images/video; Kling for image-to-video. Also scraped screenshots, website images, real thumbnails, screen recordings as B-roll.
- His private "Hyperframes Student Kit" (files seen: `AGENTS.md`, `CLAUDE.md`, `DESIGN.ais-example.md`, `MOTION_PHILOSOPHY.md`, `skills-lock.json`). Contents not visible. Pattern to copy: persist rules in CLAUDE.md / DESIGN.md / MOTION_PHILOSOPHY.md.
- Sound/music: the agent produced them; he names no source. Source of his SFX is unknown.

### The 5-step method (his closing slide; "you could basically give the transcript of this section to your AI agent")
1. **Transcribe** "so that the beats can come in at the right time and so that the AI knows how to tell a story".
2. **Cut**: "If it's mistakes, cut out the mistakes... 20 seconds of dead space, cut out the dead space." Often he uses AI only for this and then takes the clip himself.
3. **Plan the beats**: "Hey, at this point, I want this to come in. I want this to come in." More specific = more aligned. Say "These are the only beats I want... nothing else" if you want no extras; otherwise let it be creative.
4. **Use skills**: build a skill per format (reels etc.); show it a reference video ("analyze this video... figure out why this is so good", then "Turn that into a skill"); after every run give likes/dislikes and "update the skill"; "If you ever find yourself repeating something, just throw it in the skill."
5. **Verification loop** (his "most important"): agent renders, screenshots, looks, fixes, re-renders until "output number like five or six". Agent final messages he shows: "I pulled frame strips from the rendered file across every transition and checked them. The first render had a blue laser line stuck across..."; "all 795 frames show the camera, the audio is there, and your whole face stays inside the frame"; "couldn't listen to it" (audio checked by measurement only).

### Quoted prompt structures
- Talking-head overlay prompt: "I need you to edit this to be super engaging and clean with hyperframes. We need Apple style super clean motion graphics and animations. The first step is for you to transcribe the video so you can make sure that the motion graphics and animations come in at the exact perfect time. Then you will build the animations based on my instructions. When I say [X], I want you to have animations come in where I'm pointing... make sure there's some sort of liquid glass card behind the element as it's animated. Otherwise, it will be hard to read... When I say 'best outputs ever', I want you to have all three of those words at the bottom and highlight them... for the rest of the video, when I'm talking about B-roll and screenshots... have things come in on the left and right side of the screen... prove it in real time."
  Structure = (1) input file, (2) "transcribe first", (3) "when I say X, show Y at position Z", (4) a legibility rule applied to every inserted element, (5) permission to be creative on the rest. Agent added unasked: subtle slow zoom-in on the speaker, terminal UI, a verification-screenshots animation.
- Vibe-only prompt (when you lack specifics): "high energy, fast-paced, engaging, sync the music to the beats, sound effects" (Lululemon). Short-form one-shot: "Generate the assets you need. Have it be engaging. Have it be fast-paced, easy to understand."
- Style prompts: "whiteboard hand-drawn... some scenes full screen takeover and some scenes left half whiteboard and right half my face"; "course style: camera starts full screen then a rounded crop... bullet points with important takeaways, not too wordy, and they should be big".
- Reel prompt: "Make a dynamic 15-second motion graphics video... Go all out" + "Make it about our company. Use real assets and logos from our products when possible."
- Follow-up seen in app: "make a vertical 9:16 cut for Reels".

### Rules of thumb (quotable)
- Always put a glass/dark card behind inserted text or assets.
- Real assets: "pulled pictures from our website", real thumbnails, real product pages beat generated.
- One-shot first, then iterate; v2.1 = one prompt + one round of feedback + one fix.
- Known flaws he accepts: awkward speech cuts, tiny generated objects, agent cannot listen.
- Vertical short example (frames f_0860, f_0870): full-bleed B-roll, top pill progress tracker ("2/7 - EGGS", dot per step), mid-frame caption 2-3 words with ONE word highlighted yellow ("AND THAT'S HOW"), tiny circular face bubble bottom-left. Alt layout f_0890: B-roll top, presenter bottom.

### What the frames showed (viewed)
f_0870/f_0860 vertical short as above (bubble is ~12% of frame width, never moves). f_0180 agent-made intro: bottom-third bold white caption with underline on key words, glass cards beside head. f_0575 clip in rounded bordered frame on dark noisy ground + uppercase italic caption with one cyan-underlined word. f_0025 pixel-mosaic red/pink transition between reel scenes (a "pixelate" wipe).

---------------------------------------------------------------------------
## 2. The Motion video's system (GenHQ, "Claude as motion graphics designer")

### Tools
Claude desktop (Opus 5.5, Medium effort) / Claude Code; a free "Claude SaaS Animation Skill" (never opened on screen; folder seen: SKILL.md, references/, scripts/ incl. `contact_sheet.py`, `synth_sfx.py`, templates/storyboard.html; likely files `style-rules.md`, `sound-and-music.md`, `into-footage.md`; low-res reading, verify); Blender headless (level 3, not needed for us); ElevenLabs connector (VO); Suno (music); Ocular Sounds (~GBP 500 paid SFX pack) or Artlist (subscription) for SFX.

### Pipeline (4 steps, quoted)
"you give Claude the ingredients. It then gives you a storyboard that you can approve, and Claude goes away and builds that physical storyboard into a sequence. Then it adds the sound design, the music, and the voiceover."
1. Ingredients folder: skill + hi-res logo + screenshots.
2. Storyboard gate. Prompt: "Create a numbered storyboard that breaks out the sequence of all of the things that are going to happen in the video." Claude returns an HTML grid of numbered shots. "Approve this, or tell me what to change, before I animate anything." Rationale: "Otherwise you're just going to waste your credits."
3. Build.
4. Sound LAST.

### The 12 tips (on-screen)
1 Real high-quality assets (a logo cropped from a screenshot "looked awful"; without a hi-res logo Claude draws a fake from shapes). 2 Storyboard first, approve before animating. 3 Every shot transforms into the next, "no cross dissolves... always some sort of motion... an object or a shape transforming into one another." 4 Keep action dead centre so the eye never hunts. 5 Always some motion, even slow camera drift. 6 Visuals first, sound last ("if you change the animation... it can mess up your sound design"). 7 Prompt for a specific shallow depth of field. 8 Know your call to action. 9 Text: "no bouncing, no letters fading in. Each word just slides up in place one after the other." 10 Make Claude write the VO to the finished animation's length: "here is our 15 second animation. I now want you to create a voiceover that fits inside this 15 second animation." 11 One light source (3D only). 12 Compare to the real product and tell Claude what is wrong.
- Music: "Write me a Suno prompt that was the exact length of the video"; then give Claude the track and have it mix volume.
- SFX: put the pack in the project folder, "ask it to go inside the folder, look at the sound effects... and place them in the exact correct moments". A/B demo no-sound vs sound: "Massive difference."
- "If you give it a short generic prompt, you're going to get a generic output."
- Pre-agreed last frame: give a reference still and tell Claude the animation must end on it, so a cut into real footage lands exactly.
- Layout facts (viewed f_0275, f_0415, f_0255): face = circle ~18% frame height bottom-left with white ring, static; tip pill = dark rounded rect, teal icon, bold white title + teal one-line subtitle, bottom centre; A/B split with dimmed inactive pane; storyboard = grid of numbered frames with per-shot time + camera note.

---------------------------------------------------------------------------
## 3. Applicable to a 45 s fast-cut vertical footage edit (checklist)

Process
- [ ] Transcribe the VO/footage first (word timings) and drive every caption, cut and SFX from word `start` times. (Nate 1; Motion "anchor to transcript")
- [ ] Cut dead air/mistakes from the transcript before designing anything (Nate 2). Tooling: `media-use/scripts/transcript-cut.mjs` (see sec. 4).
- [ ] Write a numbered storyboard/beat sheet first (shot id, start-end s, spoken line, footage source + in-point, layout, caption words, SFX, transition into next). Lock it, then build (Motion 2; BRIEF says write SPEC.md first).
- [ ] Be explicit "when I say X show Y" per beat; state "only these beats" or allow extras (Nate 3).
- [ ] Visuals locked first, SFX/music last (Motion tip 6). Voice priority; sound measured not heard.
- [ ] Verification loop: snapshot per shot, check face never covered, text legible, no stuck artifacts, audio present; render, contact sheet from the MP4; iterate to "output 5-6" (Nate 5).
- [ ] After v1 write what worked into a per-ad skill/DESIGN.md and reuse for variants 2-10 (Nate 4). For 10 variants: one shared design file + per-variant SPEC.md, and use `data-composition-variables` (headline/CTA/media as variables, see sec. 4).

Hook / pacing
- [ ] Frame 0 = face, result or one bold line; never black or a logo (HF vertical.md). Open on the payoff/result then explain (Motion cold open).
- [ ] Shots 1-2 s, new beat every 2-4 s, payoff before the swipe (vertical.md). Contrast speeds; hold 0.3-0.75 s before the payoff (motion.md). Something changes at least every 1.5-3 s (BRIEF).
- [ ] Punch-ins on emphasis, B-roll cut on the sentence, face never under a card (vertical.md).
- [ ] Slow constant drift/zoom on every static card or screen recording (Nate unprompted zoom; Motion tip 5). Note motion.md warns against "slow creeping scale on a title"; keep drift on media, titles land dead still.
- [ ] Muted-viewing safe: captions carry the hook.

Captions
- [ ] 2-3 words per group for high energy; ONE accent word highlighted (Nate yellow; HF "one highlighted word in the accent colour"). Uppercase heavy sans, scrim/glass behind.
- [ ] Words slide up one after another, no bounce, no per-letter fade (Motion 9). Vary entrance style across the film (motion.md Titles).
- [ ] Portrait caption bottom edge at least y=1248 (672 px from bottom); inside the 80% title-safe box; never over the face.

B-roll / screen recording
- [ ] Real product/UI footage over generated; hi-res logos only, never redrawn (Motion 1; media-use `resolve --type logo`).
- [ ] Screen recording as full-bleed with a face bubble, or stacked split (B-roll top, presenter bottom: Nate f_0890; HF `Stack, video above` portrait = 0,0,1080x844).
- [ ] Step/progress tracker pill at top for list-style ads (Nate f_0870), kept inside the safe band.
- [ ] Dark glass base (`rgba(15,16,22,.78)`, `backdrop-filter: blur(22px)`) + scrim behind any card over bright footage (overlays.md).

Transitions
- [ ] No cross dissolves (Motion 3); 3-5 transition kinds, each with a cause; at most 1/3 of seams hard cuts; hard cuts inside a scene (punch-ins) (motion.md). Pixel-mosaic/glitch wipes (Nate f_0025) = registry `grid-pixelate-wipe`, `glitch`.
- [ ] Match direction/speed at the seam; cut at the fastest frame of a move.

SFX / music
- [ ] SFX only with an on-screen cause: whoosh on a cut/large card, pop on a badge/number, tick on typing, riser into ONE impact (sound.md table). Rotate 2-3 takes of a repeated sound; a peak lands one frame AFTER its picture.
- [ ] Music bed ~0.14 volume under VO (sound.md), duck while speaking, mix -16 to -14 LUFS, true peak <= -1 dBTP, check with `npx hyperframes audio <video> --json`.
- [ ] CTA end card, hold at least 2 s for the last line (motion.md Holds; Motion tip 8).

---------------------------------------------------------------------------
## 4. HyperFrames technical facts (all taken from the reference files, quoted exactly)

Pinned CLI in this workspace: `hyperframes@0.9.72` (`npx --yes hyperframes@0.9.72 <cmd>`). Skill-doc commands are written `npx hyperframes <command>`.

### 4.1 Declaring vertical 1080x1920
- Root: `<div id="root" data-composition-id="main" data-start="0" data-duration="45" data-width="1080" data-height="1920">` (format.md "Shape of a project" example uses 1920/1080; swap the numbers). Every sub-composition host AND its `<div id="root" data-composition-id="..." data-width="1080" data-height="1920">` inside the `<template>` must carry the same size. `SKILL.md`: "A new video is 1920×1080 at 30 fps"; vertical.md: "Made at 1080×1920 when the request or the platform says vertical". Template also sets `<meta name="viewport" content="width=1920, height=1080" />` and `html, body { width:1920px; height:1080px }`: change these to 1080/1920 (my inference; not stated in the skill). Scene root styling: "Size the scene root with `inset: 0`, never hard-coded pixels" and style it as `#root`.
- Fps: `data-fps` optional on root (reverse-any-video: "`data-fps` is its rate"); default 30. CLI render flags from frameworks.md: `npx hyperframes render --quality draft|looks|high --workers N --fps 30 -o out/final.mp4`.
- Safe zone (vertical.md): the `check` warning `outside_safe_zone` = keep words and product inside "from 288 to 1248 px down and 120 to 888 px across, narrowing to 780 px below 840 px". Platform-specific: `--safe-zone tiktok`, `reels` or `shorts`. Ads "reserve more at the bottom". Outside the zone only texture/decoration.
- Type sizes: titles about x1.35 vs landscape, stats x1.4, "nothing meant to be read under 28 px", about 5 English words max per claim line (vertical.md, overlays.md). Padding 24-36 px.

### 4.2 Placing a `<video>` clip with a trim
Attribute names (format.md "Attributes you'll use most"):
| Attribute | Meaning |
|---|---|
| `data-start`, `data-duration` | seconds, local to the file that declares the element |
| `data-media-start` | "Offset into the source media (a trim)" = in-point in the source |
| `data-playback-rate` | "Constant speed, 0.1–10" (picture and pitch preserved) |
| `data-has-audio="true"` | "A `<video>` keeps its own sound; a timed `<video>` with neither this nor `muted` fails lint" |
| `data-volume`, `data-fade-in`, `data-fade-out` | gain (1 = 0 dB, up to 3.98 = +12 dB) and edge fades |
| `data-track-index` | Studio lane only; paint order is CSS `z-index` |

Pattern (composed from format.md "Adding media" + frameworks.md README example; `<video>` must be a timed `.clip`; "Time the `<video>`, never its wrapper"):
```html
<!-- silent B-roll, source 12.0 s in, plays 2.4 s starting at 5.0 s on the timeline -->
<video id="b1" class="clip" src="assets/cam.mp4" muted playsinline
       data-start="5.0" data-duration="2.4" data-media-start="12.0" data-track-index="1"
       style="position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover"></video>
<!-- speaker footage that keeps its own audio -->
<video id="a1" class="clip" src="assets/cam.mp4" playsinline data-has-audio="true"
       data-start="0" data-duration="3" data-media-start="0.8" data-volume="1" data-track-index="1"></video>
```
- Muting: `muted` attribute (silent footage: "`muted playsinline`"); sound kept only with `data-has-audio="true"` (lint `video_missing_muted`). Voice/music/replacement sound/J-L cuts are a separate `<audio>` (SKILL contract 7).
- Rate: `data-playback-rate` constant 0.1-10; speed ramp via `data-automation` lane `{"target":"rate", ...}` ("`t` in clip seconds, `v` 0.1–10; overrides the constant rate"); "give a video and its paired audio the same value" (mixing.md).
- Move/scale/punch-in: "Tween `scale` and `x`/`y` on a wrapper inside the clip, never on the timed media element" (motion.md). Crop/mask reveal: tween `clip-path` on an inner wrapper. Wrapper rule: "To move or scale a video, animate a wrapper around it" (frameworks.md citing docs). Freeze mid-source: export a still first, place as its own clip.
- Several cuts from one source file: use one `<video>` element per cut, each with its own `id`, `data-start`, `data-duration`, `data-media-start`. Not explicitly documented as a pattern, but each element is independent (my inference). A trim never needs a new file ("In-composition trimming usually needs no new file", media-use operations.md).
- If a clip's `data-duration` is omitted the media plays full length; `<img>` default 3 s (format.md). Clamp ends/root `data-duration` to ffprobe length "or the render ends in black" (overlays.md).
- Linked video+audio: `data-link` / `data-sync-origin`; "Prefer one `<video data-has-audio="true">`" (format.md).
- Never `play()`/`pause()`/seek media (contract 7). No `crossorigin` on media.
- Frame-accurate seeking / codec: overlays.md: "Footage with keyframes more than about 1 s apart freezes on seek: re-encode with `-g <fps>`." So: `ffmpeg -i in.mov -c:v libx264 -crf 16 -g 30 -pix_fmt yuv420p -c:a aac out.mp4` (command composed by me from that rule, not quoted; drop audio with `-an` for silent B-roll). Workspace precedent: the splat bake used `-vf fps=30,format=yuv420p -c:v libx264 -crf 14 -g 30` (04 REVIEW.md). HEVC/H.265: "need no conversion for render (FFmpeg pre-decodes all input video) or for preview (auto-proxy...)" (operations.md); preview proxy off with `--no-proxy`. Phone footage VFR/25 fps: how a source fps maps to a 30 fps composition is NOT documented (frameworks.md marks it unverified); test a 10 s clip. Rotated phone footage (rotation metadata) is not mentioned in any reference: check with a snapshot.
- Reframe 16:9 to 9:16 (operations.md): `ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" out.mp4`; non-destructive alternative is `object-fit: cover` or `clip-path` on the element.

### 4.3 Portrait layout numbers for footage (overlays.md, 1080x1920)
Video rectangle: Split (video beside card) 0,960,1080x960; Stack (video above) 0,0,1080x844; Overlay full frame. PiP 28 px from edges: 9:16 source 738,28,312x555; 16:9 source 690,28,360x203. Card zones: lower third = bottom 30%; side panel = bottom 40%; glass card slot 24,1280,1032x564. Cards fade in 0.4 s `power2.out`, out 0.35 s `power2.in`; "Re-frame the video (0.5–0.7 s) only in a gap between cards"; static card dead after ~8 s. "Lower-third, overlay and picture-in-picture scenes need a transparent root, or they hide the speaker."

### 4.4 Audio tracks and SFX declaration
- `<audio>` must have an `id` ("Every `<audio>` has an `id` or it is left out of the mix"); `class="clip"`, `data-start`, `data-duration`, `data-volume`, `data-track-index`. Working example from `05-type-storm/index.html`: `<audio id="voice" class="clip" src="assets/voice.m4a" data-start="0" data-duration="93.4" data-volume="1" data-track-index="4"></audio>`.
- SFX precedent (`05-type-storm/compositions/sfx.html`): a sub-composition `<div id="root" data-composition-id="sfx" data-width=... data-height=... data-no-timeline>` containing many `<audio id="sfx-N" class="clip" src="assets/sfx/whoosh.mp3" data-start="3.25" data-duration="0.56" data-volume="0.2" data-track-index="0">`, mounted from index.html with `data-composition-src="compositions/sfx.html" data-start="0" data-duration="<root>"`. This produced only the harmless warning `nested_media_start_basis_ambiguous` on each (05 REVIEW.md).
- Lanes (format.md): "Every sound effect: one lane; a second only where two overlap. Music: its own lane. Voice: its own lane."
- Levels: SFX volume ~0.35 max per sfx.md of media-use ("SFX sit UNDER voice + BGM"; workspace used 0.2-0.35); hits "3-6 dB over the bed"; music under voice "around 0.14 volume" (sound.md). Fades: `data-fade-in`/`data-fade-out`. Ducking: `data-automation='{"version":1,"lanes":[{"target":"volume","points":[{"t":0,"v":1},{"t":2.5,"v":0.35}]}]}'` on the music; "A `volume` lane multiplies `data-volume`, so write the level in one of them"; "Don't also tween `volume` with GSAP". Then `node <SKILL_DIR>/audio/scripts/carve.mjs --comp index.html` (needs ffmpeg; `--dry-run`) to carve the bed; never carve a voice track. Effect chain attribute: `data-fx-chain` (highpass 80 Hz for rumble, `limiter` last, etc.). Group buses: `data-audio-group="voiceover|music|sfx"` + `<hf-audio-group id="..."></hf-audio-group>`.
- Measure: `npx hyperframes audio <file-or-video> --json` ("reports where it hits... loudness"); level-match: `npx hyperframes normalize-audio`. Target true peak <= -1 dBTP, -16 to -14 LUFS (sound.md). Whole-clip check: `ffmpeg -i out.mp4 -af loudnorm=print_format=summary -f null -`.
- Beat grid if a music track is used: `npx hyperframes beats`.

### 4.5 Where sound effects come from (exact, from `media-use/audio/references/sfx.md`)
- "There is no `npx hyperframes sfx` command. SFX is never generated; it is retrieved from Openverse (online) or taken from the bundled library (offline)."
- Command: `npx hyperframes media-use resolve --type sfx --intent "whoosh" --project .` prints `resolved sfx_001 → .media/audio/sfx/sfx_001.mp3 (sfx, 0.57s)`. `--local-only` skips Openverse (bundled only). `--candidates` lists reusable assets first. Name effects concretely ("glass shatter", not "dramatic sound"). A weak match prints `media-use: low-confidence match`. No match = `no sound effect matched`.
- Batch engine: `node <SKILL_DIR>/audio/scripts/audio.mjs --request ./audio_request.json --out ./audio_meta.json` with `lines[].sfx: ["whoosh","ui click"]`; writes `assets/sfx/<slug>.<ext>`, `audio_meta.sfx[]` with `file, offset_s, duration_s, volume (0.35), license, credit`. Run `--only tts,bgm,sfx` for subsets.
- Openverse: anonymous 20 searches/min, 200/day; only CC0 and CC BY used; CC BY credits go to `assets/sfx/CREDITS.md`, "Tell the person to include those credits wherever the video is published."
- Bundled library: 21 files at `/Users/zackhanna/.claude/skills/media-use/audio/assets/sfx/` (+ `manifest.json` with per-effect placement hints, + `CREDITS.md`). Files: chime, click-soft, click, error, glitch-1, glitch-2, glitch-3, impact-bass-1, impact-bass-2, key-press, notification, ping, pop, riser (10.03 s, trigger at `climax − 10.03`), sparkle, typing, whoosh-cinematic (~2.6 s), whoosh-short, whoosh (0.57 s). Manifest durations e.g. click 0.37, key-press 0.4, ping 1.32, chime 2.5, glitch-1 2.64, impact-bass-1 2.12, impact-bass-2 2.59. Workspace's videos copied these into each project's `assets/sfx/` (noted as "Pixabay-licence" in their CREDITS.md).
- Music: `npx hyperframes media-use resolve --type bgm --intent "upbeat tech launch" --project .` uses the HeyGen catalog and needs `npx hyperframes auth status` / free HeyGen sign-in. Not signed in = deliver silent or use the user's own track (sound.md: "With no music source... deliver silent and say so"; "The person's own track first, as given"). Workspace BRIEF: no paid generation, no sign-in; 05 shipped no music bed. Voice: user's own recording via audio.mjs `lines: [{ id, audio: "take.m4a" }]`; Kokoro local TTS `npx hyperframes tts`.
- Tip from Motion: a paid pack (Ocular Sounds, Artlist) dropped in the folder makes the best sound design; not available here.

### 4.6 Captions sub-composition pattern from a word-timing JSON
- Word JSON shape: `[{ "id": "w0", "text": "Hello", "start": 0.0, "end": 0.5 }, ...]`. NOTE the workspace's `assets/words.json` uses `{w, s, e}` (`[{w, s, e}]`); convert to `{text,start,end}` or read `w/s/e` in your own script.
- Produce timings: `npx hyperframes transcribe <file> --model small.en` (always pass `--model`; default `small.en` "silently translates non-English"; `--model medium.en` for speech over music; writes `assets/transcript.json`, overwrites next run; `--to srt|vtt` for a sidecar). Import existing: `npx hyperframes transcribe subtitles.srt|.vtt|openai-response.json`. Whisper pitfalls (captions.md): invents "Thank you." over silence (drop words starting inside final silence: `silencedetect=noise=-35dB:d=0.6`); more than 20% `♪`/`�` tokens = failed; never two words in one timed entry; match by position not text.
- Host: one sub-composition mounted in index.html with `data-composition-src="compositions/captions.html" data-track-kind="captions" data-start="0" data-duration="<root>" data-track-index="2" data-composition-id="captions"` (workspace 05 line: `<div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="93.4" data-track-index="2" data-track-kind="captions" data-width="1920" data-height="1080"></div>`). Make width/height 1080/1920.
- Scene file: everything inside `<template>`; `<div id="root" data-composition-id="captions" data-width="1080" data-height="1920">`; style `#root {position:absolute; inset:0}`; one paused `gsap.timeline`; `window.__timelines["captions"] = tl` at the end. Use `fromTo` not `from` in scenes. Never `add()` a scene timeline to the root's.
- Groups: 2-3 words high energy; break at sentence end, 150 ms pause, or the word limit; one group visible at a time; group opens at or before first word start (start 0.1-0.3 s in, not at 0 s), closes at or after last word end; hard kill each group:
```js
tl.to(group, { opacity: 0, duration: 0.12, ease: "power2.in" }, end - 0.12);
tl.set(group, { opacity: 0, visibility: "hidden" }, end);
```
  Fit: `window.__hyperframes.fitTextFontSize(text, { fontFamily, fontWeight, maxWidth })` returns `{ fontSize }` (portrait default `maxWidth` 900; base 78; min 42; step 2; divide maxWidth by emphasis scale). Full-width absolute centred container; never `left:50%; transform:translateX(-50%)`; `overflow: visible`; position each group absolutely; fade the group OR its words not both; gradient fills on the inner span. Self-lint snippet in `media-use/audio/references/captions/authoring.md` (seek to `group.end+0.01`, warn if still visible).
- Portrait place: caption bottom edge >= y 1248 (672 px from bottom), inside 80% title-safe, never over the face. Over footage: blend by brightness behind (under 60 `screen`, 60-180 `overlay`, over 180 `normal`); plain subtitles above brightness 60 get a 30-40% scrim sized to the text.
- Footage with burned-in subtitles: "scan a 1 fps contact sheet before placing captions".
- Text behind the speaker: `npx hyperframes remove-background` cutout above the captions (z-index); `data-layout-allow-occlusion` on the cutout; first run downloads 168 MB, about 2 fps at 1080p CPU; big word best 30-55% covered.
- Registry caption styles (verified by running `catalog --tag caption-style --json` in the template folder): caption-highlight ("Red background sweep behind each active word, TikTok-style"), caption-pill-karaoke, caption-kinetic-slam (full-screen single word, alternating directions), caption-editorial-emphasis, caption-emoji-pop, caption-clip-wipe, caption-gradient-fill, caption-glitch-rgb, caption-neon-glow, caption-neon-accent, caption-weight-shift, caption-particle-burst, caption-parallax-layers (behind-subject), caption-texture, caption-matrix-decode, caption-camera-follow. Install: `npx hyperframes add <name>` then wire as a sub-composition via `data-composition-src` (`hyperframes add <name> --dir <project> --no-clipboard --json`; inspect the returned host).
- Registry transitions worth using (same method): whip-pan, whip-pan-cut, glitch, grid-pixelate-wipe, cinematic-zoom, flash-through-white, editorial-flash-overlay, beat-freeze-cut (speed ramp + freeze + hard cut, music-led), cut-the-curve (velocity-matched hard cut), match-cut, morph-swap, iris-reveal, sdf-iris, ripple-waves, light-leak, text-match-cut, type-match-cut, rubber-band-bumper. Search: `npx hyperframes catalog --query "<name>" --json`, `--tag transition|camera|motion-primitive|caption-style`. Shader transitions come from `@hyperframes/shader-transitions` (frameworks.md); note format.md: "A fill on the composition root is dropped when the video has shader transitions or HDR media; put it on a full-bleed child."

### 4.7 `media-treatment` (what it does)
Persists color grade, LUT, grain, vignette, blur, pixelate, VHS/halftone/ASCII/etc. on real `<img>`/`<video>` as a nested `data-color-grading` attribute, rendered by a realtime shader (Rec.709/SDR only; not HDR/LOG). Contract rule 11: "Grades, grain, blur and vignettes on footage go through `npx hyperframes media-treatment`, never CSS filters." Commands:
- `hyperframes media-treatment --capabilities --json` (overview), `--capability <id> --json` (controls/recommended values), `--selector "#hero" --analyze --json` (clipping/signal evidence), `--selector "<sel>" --grading '<nested JSON patch>' --apply --json`, `--clear`, `--selector-index N`.
- Tested recipes in `media-use/references/media-treatment-recipes.md` (read only `## <heading>`): Natural Portrait (talking head), Product Polish, UI Fidelity (screen capture), Creator Camcorder (UGC handheld), Film Memory, VHS Playback, Social Flash / Editorial Reveal, etc. Process: `hyperframes snapshot <project> --frames 3 --no-end --output snapshots/treatment-before`, apply, snapshot "after", compare contact sheets. Whole-media only (cannot isolate a face/region). Multipass effects (Blur, Bloom, Kuwahara) are costly; more than two full-frame multipass layers needs a playback check. Colour grade resolve: `npx hyperframes media-use resolve --type grade --intent "warm daylight" --project . --json`, `--for <file>` measures adjustments.
- Not documented: whether `media-treatment` affects the speed of 10 simultaneous variants; no render cost figures for vertical.

### 4.8 Boilerplate (workspace `template/`)
`package.json` scripts: `"dev": "npx --yes hyperframes@0.9.72 preview"`, `"check": "... check"`, `"render": "... render"`. `index.html`: GSAP tag `<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js">` (the only CDN import), root `<div id="root" data-composition-id="main" data-start="0" data-duration="12" data-width="1920" data-height="1080">`, timed `.clip` elements each with `data-track-index`, one `<video id="avatar" class="clip" ... muted playsinline data-start data-duration data-track-index>` inside a wrapper moved by GSAP `x/y/scale`, `<audio id="voice" class="clip" ...>`, `window.__timelines["main"] = tl`. three.js (not needed for the ad): `hf-seek` event, `renderer.setPixelRatio(1)`.
Scaffold: `npx hyperframes init <dir> --skip-skills --skill=hyperframes` (SKILL.md) or `--non-interactive --video file.mp4 --example <name>` (frameworks.md). Skills install: `npx hyperframes skills update`.

### 4.9 Commands you will run (from SKILL.md / frameworks.md / BRIEF.md)
```
npx hyperframes doctor                         # Node, Chrome, FFmpeg
npx hyperframes lint
npx hyperframes check [--json] [--safe-zone tiktok|reels|shorts]
npx hyperframes timeline --json                # every clip with absStart/absEnd/src/playbackRate
npx hyperframes snapshot --at 3.5,7.2          # PNG stills; also --range 2,4 --frames 8, --review, --composition <id>, --zoom '#id'
npx hyperframes keyframes --json [--selector '#id']
npx hyperframes preview --background           # agent-safe Studio (--status, --stop); `npm run dev` is for humans
npx hyperframes render --quality draft -o review.mp4     # draft | looks (default, CRF16) | high; --workers N; --fps 30
npx hyperframes render -o out/final.mp4
npx hyperframes audio out/final.mp4 --json     # sound present/levels
npx hyperframes benchmark
ffprobe -v error -show_entries stream=width,height,r_frame_rate,duration,codec_name out/final.mp4
ffmpeg -i out/final.mp4 -vf fps=1/3,scale=270:-1,tile=6x4 out/contact.jpg   # contact sheet from the MP4 itself (BRIEF used fps=1/4,scale=480:-1,tile=6x4)
```
Workflow gates: SKILL.md says "Before the delivery render of a new video, open the Studio preview"; 05 REVIEW notes this was skipped in autonomous runs. Render quality: 05 produced 230 MB at 93 s ("looks"); expect ~100 MB for 45 s vertical.
Not documented / unverified: motion-blur attr `data-motion-blur="on"` exists (motion.md) but cost "on two real films it cost more than capture"; a `data-vfx-chain`/shader-transition package exists (frameworks.md) but exact attrs not read.

### 4.10 Lint/check rules most likely to bite (format.md + SKILL.md + workspace)
- `video_missing_muted`: every timed `<video>` needs `muted` or `data-has-audio="true"`.
- `media_missing_id`: every `<audio>` needs an `id`; `media_crossorigin_breaks_preview`: no `crossorigin`.
- `timeline_track_too_dense`: more than 3 timed elements in one file warns "whatever their lanes": split overlays per chapter into sub-compositions (many `<video>` cuts in index.html will trigger this: put cut groups in `compositions/<chapter>.html`; the SKILL says "the root holds only scene hosts, media and audio", so 10+ video cuts at root is the documented form but expect the warning; decide by running `check`).
- `video_nested_in_timed_element`: time the `<video>`; its wrapper stays untimed.
- `gsap_animates_clip_element`: never tween display/visibility/autoAlpha on a `.clip`; animate a child or opacity. `gsap_css_transform_conflict`: use `fromTo`, no CSS `transform` on an element GSAP also transforms. Do not tween `left/top/width/height`.
- `clip_ends_past_root_duration`: raise root `data-duration` (root length is 45; overrun is cut).
- `missing_data_no_timeline`: a root/host with no timeline (e.g. an SFX-only sub-comp) needs `data-no-timeline` or "every render waits 45 s". Host id must equal scene root `data-composition-id` and its `window.__timelines` key, or each render waits 45 s per scene then shows static frames.
- `font_family_without_font_face`: only bundled fonts resolve by name (Inter 400/700/900, Montserrat, Outfit, Nunito, Oswald, League Gothic, Archivo Black, Space Mono, IBM Plex Mono, JetBrains Mono, EB Garamond, Playfair Display, Source Code Pro, Noto Sans JP, Roboto, Open Sans, Lato, Poppins); others need `@font-face` to `assets/fonts/...`; `font_face_local_only` warns for `local()`-only.
- `outside_safe_zone` (vertical), `text_below_floor` (under ~28 px), `line_unread` (text on screen too briefly: hold about 0.5 s + 0.3 s per word), caption-zone/occlusion/overflow findings (silence with the narrow `data-layout-allow-*` attrs, table in format.md). `text_occluded`: a `<video>` counts as opaque over its whole box, so captions behind a person cutout need `data-layout-allow-occlusion` on the cutout.
- `sweep_static`: a 3 s+ video with no visible change.
- `nested_media_start_basis_ambiguous` warnings on SFX audio in a sub-composition at host start 0: harmless in this workspace (05 REVIEW).
- Asset paths: `assets/...` no leading slash, in sub-comps too. Inside a scene "Keep ids unique across the assembled page (prefix them)". `data-start="intro + 0.5"` relative starts silently resolve to 0 on a typo: snapshot them. A clip shows over `[start, start+duration)`, an end state landing exactly on its end is never rendered. `<template>`: only scene files; a standalone composition wrapped in `<template>` is an error (`standalone_composition_wrapped_in_template`). `subcomposition_root_styled_by_class`: style the root as `#root`.
- Determinism (still applies without three.js): no `Date.now()`, unseeded `Math.random()`, fetches, timers, `repeat: -1`; everything is a function of timeline time.

### 4.11 Registry / other skills worth knowing
`/hyperframes-registry` (~450 blocks), `/media-use`, `/hyperframes-cli`. `reverse-any-video` is HyperFrames **Pro** (needs `npx hyperframes reverse start <video> --dir <project>`, may refuse and ask for an upgrade; you never run `billing`). It rebuilds a reference video frame-for-frame; useful here only to clone a reference ad's cut structure: its `npx hyperframes measure cuts <video>` (every cut with its frame, including jump cuts and punch-ins) and `npx hyperframes measure frames --range a,b --roi x,y,w,h` are the reusable parts for timing analysis of a reference vertical ad (write times as frame/fps rounded down). Whether these two measure commands need Pro: not stated.

---------------------------------------------------------------------------
## 5. Pitfalls recorded in this workspace (REVIEW.md x5, BRIEF.md, CLAUDE.md)

- **Audio was never heard**, only measured (mean/peak dB, LUFS); every REVIEW says so. Do not claim a mix "sounds good". Measured: 05 mean -18.2 dB, peak -1.6 dB; 02 -15.2 LUFS, -1.0 dBFS TP; 03/04 -16.1 LUFS.
- **No music bed** in 05 and 01's chiptune was homemade; the free music catalog needs a HeyGen sign-in (`npx hyperframes auth login`, user must type it). Plan for voice + SFX only, or the user's own music.
- **Transition variety low** (05: nearly every seam the same morph; brief wants 3-5 kinds). Seams that read as joins: haze/dip (03 weakest seam = dipped match cut).
- **Half-typed/half-slid caption frames**: captions that animate in over 0.4 s leave a paused snapshot with half a word; 01 and 02 and `check` info items reported it. Land captions fast (0.1-0.2 s) and check snapshots just after each word start.
- **Text too small** for phones: 24 px code/URL/HUD text flagged (`text_below_floor`); keep reading text >= 28 px (even more at 1080 wide).
- **Pink/accent drift**: 05 used the accent on ~10 words; enforce ONE accent colour per film.
- **Banned defaults** used on purpose (glass cards, corner brackets, HUD readouts) in 02; keep banned list in the SPEC.
- **Heavy overlay elements in captions file** (49 clip-path/overlay elements) "known to cause black capture": 01 removed clip-path notches and clip-path typewriter (per-letter opacity instead). Avoid clip-path-heavy captions at scale.
- **Short shots are unreadable**: 1.3 s hops (04), 0.7 s (01), 1.6-1.8 s (02) "just readable"; the morph/transition eats ~0.5 s of each. In a 45 s ad plan 1-2 s shots with transitions under 0.3 s.
- **Preview skipped**: Studio preview was skipped in every autonomous run despite the skill asking; contact sheets from the MP4 were the substitute.
- **Large files**: 216-230 MB for 93 s at default quality; 75 MB for a simple one (01: 42 s render). 10 variants x 45 s: budget disk, use `--quality draft` for review renders.
- **Bubble/face rules (BRIEF)**: never cover the face, never let key text sit under the bubble; for a talking footage ad this becomes: nothing over the face region, face-safe check (Nate's agent confirmed "your whole face stays inside the frame").
- **Version churn / WebGL regressions** (frameworks.md): pin the CLI (`hyperframes@0.9.72`), re-verify a mid-video frame after any upgrade. Not WebGL relevant unless a variant uses three.js.
- **Fonts**: anything not bundled (e.g. VT323) needs a file in `assets/fonts/` + `@font-face`; renders can shift a pixel across machines.
- **Stay in your folder; template/ is read-only**; each video is a self-contained project with its own `assets/` copy (CLAUDE.md). For 10 variants: copy a verified base project per variant, do not share one `assets/`.
- **Mandatory verification (BRIEF)**: check -> snapshot per shot (read the contact sheet) -> render -> ffprobe (dimensions, ~duration, audio stream) -> contact sheet from the MP4 -> REVIEW.md with honest flaws. For 1080x1920/45 s ad: expect `ffprobe` width 1080, height 1920, duration ~45.0.
- **Unverified in this workspace**: how a non-30 fps source (25 fps avatar clip, phone 29.97/VFR) is resampled; render speed with several footage `<video>` elements; the SFX Openverse route (workspace only used the bundled files).
