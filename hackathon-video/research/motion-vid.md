# Research: "Claude as motion-graphics designer" tutorial (GenHQ)

Source: `Moption Vid/videoplayback (1).mp4` (640x360, 1078 s). Transcript: `hackathon-video/transcripts/motionvid.srt`. Frames: `hackathon-video/research/frames-motion/` (`sheet_01..08.jpg` contact sheets at 1 frame / 5 s, `f_NNNN.jpg` = full-res frame at NNNN seconds).

Caveat: the creator never shows the contents of his skill or the finished-clip code. Everything below is what is said or visible on screen.

## (a) Workflow, tools, prompts

### Tools named
- **Claude desktop app** (Opus 5.5, "Medium" effort, project/folder picker, "Reply to Claude" box). Shot 1-2 work happens in this chat. Level 3 happens in "the Claude Code chat".
- **Claude Skill**: "Claude SaaS Animation Skill" (`saas-animation.skill`, free, link in description, not shown or quoted). Described as "all of the knowledge that we have built up over the last two weeks of testing". Dropped into the project folder. A Finder view (sheet_02) shows `SKILL.md`, a `references/` folder, `scripts/` (`compose_into_clip.py`, `contact_sheet.py`, `render.py`, `synth_sfx.py`, `grid.py` etc.), `templates/` (`storyboard.html`, `template-final.html`), and a `blender/` folder with `example_scene.py`. Also `engine-2d-puppet.md`, `engine-3d-blender.md`, `style-rules.md`, `sound-and-music.md`, `into-footage.md`. This is the best structural hint of how the skill is laid out, but the frames are small and these filenames are my reading of low-res text, so verify by looking at `sheet_02.jpg` row 1 cols 4-5.
- **Blender** (free, run headless by Claude, user never opens it). Version 5.2.3 LTS download page shown.
- **ElevenLabs connector** inside Claude (voiceover). **Suno** (music; Claude writes the Suno prompt). **Ocular Sounds** (paid SFX pack, about 500 GBP) or **Artlist** (cheaper subscription) for sound effects dropped into the folder.
- Compositing into real footage via a script (`compose_into_clip`-type step). Not explained.
- No AI image/video generation used except where he supplies his own images (GenHQ puppet-animation example).

### Three levels
1. Prompt only inside Claude (Spotify, Candy Crush). Pure 2D/shape animation, about 8-10 min render.
2. Add AI tools: ElevenLabs voice, Suno music, existing AI illustrations that Claude cuts out and "puppet tool" animates (GenHQ ad).
3. Add Blender for real 3D lighting (AirPods ad, "30 minutes for $2").

### Four-step pipeline
Ingredients (folder: skill + hi-res logo + app screenshots) -> **numbered storyboard, approve/iterate** -> Claude builds animation -> sound design (SFX, music, VO).

### Quoted prompts and instructions
- Storyboard prompt (typed on screen, f_0245): "Create a numbered storyboard that breaks out the sequence of all of the things that are going to happen in the video." Claude returns an HTML storyboard grid (8 numbered shots with captions) and says "Approve this, or tell me what to change, before I animate anything."
- Before approving: tell Claude "every shot should transform into the next one", "each of the storyboard frames should seamlessly transition into the next frame", "no cross dissolves", "there should always be some sort of motion, whether that is an object or a shape transforming into one another". On screen (f_0275): Tip 3 "Every Shot Transforms. No cross dissolves. One shape always turns into the next."
- Centre: keep the action "in the dead center" so eyes never hunt around the screen (Tip 4, f_0375).
- Text animation (Tip 9): "no bouncing, no letters fading in. Each word just slides up in place one after the other."
- Voiceover (Tip 10): "OK, Claude, here is our 15 second animation. I now want you to create a voiceover that fits inside this 15 second animation." Claude writes timed lines per shot and generates audio through ElevenLabs.
- Music: "Write me a Suno prompt that is the exact length of the video." Then he gives Claude the resulting track and asks it to mix volume.
- SFX: point Claude at the uploaded sound-effect folder and "place them in the exact correct moments".
- AirPods Blender prompt (partly readable, sheet_07): "I need you to build a SaaS animation for the AirPods, build the storyboard, and do all of that. At the end, it should seamlessly transition into the white background clip. I want to keep a white background for the entire video, but [...] the background can be black with white [...] and then the end frame of the SaaS animation should be this still here." (attached: the reference silhouette still).
- No exact prompt for the Candy Crush camera work, but he says he prompted for "more interesting camera movement" and "a specific shallow depth of field".

### The 12 tips (on-screen lightbulb callouts)
1 Use real high-quality asset references (logo PNG, screenshots) or Claude fakes a bad logo from shape layers. 2 Storyboard first, approve before animating (saves credits). 3 Every shot transforms into the next, no cross dissolves. 4 Keep it dead centre. 5 Always some motion, even slow camera drift. 6 Visuals first, sound last (changing visuals breaks sound sync). 7 Shallow depth of field for a cinematic look. 8 Know your call to action (end card, app store, etc.). 9 Words slide up, no bounce or fade. 10 Connect voice to Claude so VO is timed to the finished animation. 11 One light source (Blender single-light = cinematic; lights everywhere = flat). 12 Compare against the real product and tell Claude what is wrong (first AirPods case had stems clipping through it).

### Verification approach
- Human review of storyboard before render (the main gate).
- Visual compare to the real product, then ask Claude to fix specific defects.
- A/B "no sound vs with sound" side-by-side to demonstrate impact.
- The Claude skill includes a `contact_sheet.py`-style script (probably so Claude can inspect its own render). Not confirmed on screen.
- Renders did not pass first time (AirPods). Iteration expected.

### Pitfalls he states
Cropped logo from a screenshot looks awful; generic short prompt gives generic output; lighting from shapes looks fake; cross dissolves look cheap; changing visuals after sound breaks sync; Claude may build wrong product details.

## (b) Frame table

All paths are under `/Users/zackhanna/Desktop/AI video/hackathon-video/research/frames-motion/`.

| t | File | On screen | Technique to steal |
|---|------|-----------|--------------------|
| 0:12 | f_0012.jpg | Cold open: talking head, white room, red sweater, hat | Open on result clips first, face only to explain |
| 0:35 | f_0035.jpg | Talking head full frame | Full-frame face for pure explanation, centred, head-and-shoulders |
| 0:35 (sheet) | sheet_01.jpg (row 1) | "Level 1 / Level 2 / Level 3" triptych cards with small circle face bottom-left | Three-up comparison cards with labelled headers; avatar stays in the same bottom-left circle |
| 1:40 | f_0100.jpg | 2x2 mosaic of finished clips (Spotify, GenHQ ad, Candy Crush, AirPods) with face circle bottom-left | Montage of outputs as proof in 1 frame |
| 2:58 | f_0180.jpg | Finder window, spotify-logo.png dragged into project folder; face bubble bottom-left | Screen recording as full-bleed, face as 60 px-ish circle with white ring |
| 3:05 | f_0185.jpg | Folder now holds skill + logo + screenshot | Show inputs as simple file icons: "ingredients" |
| 4:05 | f_0245.jpg | Claude chat, "Create a numbered storyboard..." typing | Big readable typed prompt, centred UI crop, zoomed so text is legible at 640 px |
| 4:15 | f_0255.jpg | Claude returns HTML storyboard grid (8 numbered shots) | Storyboard as a numbered contact-sheet image we can also use for our own approval step |
| 4:35 | f_0275.jpg | Face full frame, bottom lower-third "Tip 3: Every Shot Transforms" | Rounded black pill lower third: teal bulb icon, bold white title, teal one-line subtitle |
| 5:10 | f_0310.jpg | Spotify logo morphs into music player mid-transition ("Neon Rain"), green glow | Shape-to-shape morph in place instead of cut. Brand colour glow on near-black, subtle vignette, dark teal floor gradient |
| 6:15 | f_0375.jpg | Lower third "Tip 4: Keep It Dead Centre" | Same tip pill style, over face; hand gesture visible |
| 6:55 | f_0415.jpg | "Step 4" badge, split "No Sound / With Sound" with desaturated right pane | Split-screen A/B with dimmed inactive pane and labelled speaker icon |
| 9:00 | f_0540.jpg | Candy Crush 3D macro, bokeh, sparkle on candy | Macro push-in + shallow DoF + particle glints makes 2D-ish assets feel cinematic |
| 9:35 | f_0575.jpg | Candy Crush with "Tip 7: Shallow Depth Of Field" pill, face bubble still bottom-left | Tip pill coexists with bubble; both anchored bottom |
| 10:05 | sheet_05.jpg (r0) / f_0640.jpg | GenHQ billboard illustrations (flat vector street scene, word-by-word headline on billboard) | Per-scene flat-colour palette (orange, green, yellow, cyan), billboard headline as the text carrier |
| 10:35 | f_0635.jpg | "GenHQ - Where AI creatives" wordmark with gradient on near-black | Gradient accent on 2 letters of the logo, centred, headline sliding in word by word |
| 13:50 | f_0830.jpg | "Level 3" with AirPod rotating through the numeral 3, face bubble bottom-left | Object interacting with the typography (3D object passes through/around the text) |
| 15:10 | f_0885.jpg | Wait: this timestamp is a Claude Blender chat; see sheet_06 row 4 | Terminal-style progress UI as proof of automation |
| 15:20 | f_0905.jpg | Not reviewed (likely 3D comparison); see sheet_07 | 3D vs flat comparison "Without Blender / With Blender" |
| 15:25 | f_0925.jpg | Lower third "Tip 11: One Light Source" over face | Same pill component reused for every tip |
| 15:35 | f_0950.jpg | Blender storyboard grid of AirPods shots with numbered frames, timecodes under each ("1 0.0s Macro along the seam...") | Storyboard with per-shot time + camera note. We should produce the same for our 93 s |
| 16:05 | f_0968.jpg | Split: "The Animation" (AirPods case, black bg) -> arrow -> "Reference Frame" (white silhouette of him with AirPod) | Last frame of the animation is pre-agreed with a still, so the cut into live footage lands exactly |

Note: f_0885, f_0905 and f_0640 were extracted but I did not open them; descriptions for those rows come from the contact sheets and may be slightly off. Everything else I viewed at full res.

### Layout facts that matter for us
- Face-in-bubble: **circle, about 18% of frame height, bottom-left, ~2% margin, white outline ring, no motion** (the bubble does not move in this video; our "moving bubble" would be our own addition). The face switches to full-frame for explanation beats and to the bubble whenever any graphic or screen recording is up.
- Graphics are **full-frame, 16:9**, with the bubble overlaid. Never split-screen except for deliberate A/B comparisons.
- Visual identity: near-black backgrounds, brand-colour radial glow, thin dark teal gradient at the bottom edge, Inter/Poppins-style bold sans, generous whitespace, single centred subject.
- Tip pills: dark rounded rectangle (about 40% frame width), teal bulb icon, bold white title, small teal body text, bottom-centre, appears over the face for ~3-5 s.
- Pacing: graphics held 3-10 s each; face segments 5-15 s; a new visual every ~5 s in intros and demos. Each "level" starts with a card title, shows the output, then explains.
- Transitions: shape-morph (logo to player to playlist to phone), push-in, no dissolves. Cuts between face and graphic are hard cuts, not wipes.
- Sound design: heavy SFX per transition; he says the A/B is "massive".

## (c) Recommendations for our 93 s video

1. **Storyboard gate first.** Have the agent emit a numbered storyboard (shot id, start/end second, which transcript line it covers, graphic type, transition into next shot) and save it as an HTML/PNG contact sheet. Lock it before any rendering. This is the biggest quality lever he claims. Per-shot time and camera/lens notes (f_0950) are worth copying.
2. **Hard rule: no cross dissolves.** Every graphic must end by morphing into the start of the next (shared shape, shared colour block, camera pass-through). In our three.js scenes, make the end state of scene N equal the start state of scene N+1 (same camera, same object) and cut on motion.
3. **Anchor to the transcript.** Our edit is driven by speech, so each shot's in/out should map to word timings from Whisper (use the `.json` word timestamps). Keep a graphic on screen for 2-6 s for a 93 s piece; the creator's own graphics average 5-8 s but ours is "fast-cut" so target 2-4 s with more cuts back to the face bubble.
4. **Avatar framing.** Circle bubble, white ring, bottom-left default, about 18-22% frame height. For our brief ("small moving bubble"), animate between preset corners with an ease (200-400 ms) whenever it would collide with graphic content. Keep the avatar full-frame for the first 2-3 s and the final CTA only. Do not cover centre.
5. **Centre-weighted compositions.** Primary subject centred; text on the optical centre; secondary elements radiating around it. Avoid lower-left clutter (bubble) and lower-third (tip pills) overlaps.
6. **Motion always.** Slow camera drift or scale 1.0 to 1.06 on every static card; particles/glints for sparkle; shallow DoF in three.js (BokehPass or fake blur on background layers).
7. **Typography.** One bold geometric sans. Headline words slide up one after another, no bounce and no per-letter fades (his Tip 9). Gradient accent on one word. Keep text to 3-6 words per beat.
8. **Colour.** Per-video brand palette on near-black (or one flat colour per scene for the illustrative style), with a soft radial glow behind the hero object and a subtle bottom gradient. Use one light direction in 3D (his Tip 11).
9. **Real assets.** Feed the agent actual logos/screenshots/product images, not requests to draw them (Tip 1). If we do not have them, say so in the storyboard and use abstract shapes instead of faked branding.
10. **Sound last.** Lock picture, then add SFX on every transition and a bed of music at low volume under speech; avatar audio must stay dominant. Do A/B check with and without sound.
11. **Self-verification loop.** Build the render script to dump a contact sheet (1 frame per second) and compare to the storyboard, then fix specific defects (he does this by eye against the real product; we can have the agent review contact sheets automatically). Check bubble never overlaps key text, no frame has text smaller than ~5% frame height, no frames are black unintentionally.
12. **Time budget.** Claims: 8-10 min render for a 2D clip, "30 minutes for $2" for the Blender clip. Our three.js approach is cheaper to preview; render headlessly via Puppeteer/Playwright frame capture plus ffmpeg.
13. **Fix-to-ref endings.** If we want a clean exit, pre-agree the last frame (like his silhouette reference) and tell the agent that the last shot must land on it.

## Not determined
- The actual text of the "Claude SaaS Animation Skill" (never opened), so its exact rules and script behaviour are unknown.
- How the clip was composed into the 3D live-footage ending beyond "provide a reference frame".
- The full AirPods prompt (partially visible on screen only, text was too small for a complete transcription).
- Whether the bubble in the source video is added in post by him (very likely; it is a static circle overlay), or built by Claude.
- Frames f_0640, f_0885 and f_0905 were not opened individually.
