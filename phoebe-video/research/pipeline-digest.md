# Pipeline digest: solid-video generator, for the Phoebe run

Sources read in full: solid-video/build.mjs (450 lines), variants.mjs (160), docs/README, PROCESS, PREFERENCES, tools/music.py, README.md, hackathon-video/research/frameworks.md, solid-video/research/systems-digest.md. Line numbers refer to those files as they are today.

## 1. Everything tied to the old footage

### 1a. Asset filenames (all resolve to `assets/<name>`)
| File | Where referenced |
|---|---|
| `words.json` | build.mjs:9 (read), :351 (`used`) |
| `sfx/manifest.json` + `sfx/*.mp3` | build.mjs:10, :366, :430 (library is generic; reuse as is) |
| `voice.m4a` | build.mjs:351 (`used`), :401 (`<audio>`, data-start 0, data-duration 44.5, vol 1) |
| `music-bright.m4a` (also dark, minimal) | build.mjs:351, :402 (vol 0.45). Default `v.music \|\| "bright"`; no variant sets `music`, so only bright is used. The .wav-to-.m4a conversion is NOT in any script. |
| `solid-logo.png` | build.mjs:170 (watermark), :171 (cta), :351 |
| `solid-mark.png`, `solid-mark-white.png` | build.mjs:162, :163, :355 (stage header and watermark mark) |
| `hook.mp4`, `afterhook.mp4`, `run.mp4`, `thinking.mp4`, `laptop.mp4`, `last.mp4` | camera clips. Never named as a file in build.mjs; the name is the `src` string in variants.mjs (`cam("hook",...)` etc.) and build.mjs:43 builds `assets/${l.src}.mp4`. Used in variants.mjs: 21-41 (base), 80-94 (persist in 03/04), 114-122 (06). Variant 08/09 reuse via camFx (138, 147). |
| `screen.mp4` | variants.mjs:13 (`scr()` hard-codes `src:"screen"`); build.mjs:11 (`DIM.screen=[1920,1080]`), :25, :149 |
| `run.mp4` etc. are all assumed 1080x1920 | build.mjs:11 comment, :22 default `[1080,1920]`. Phone clips with rotation tags must be re-encoded upright (PROCESS step 1, 4: 30 fps, keyframe every 15 frames). |

### 1b. Clip lengths and trim assert
build.mjs:443: `LEN = { hook:4.8, afterhook:3.16, laptop:15.16, run:30.96, thinking:11.4, last:5.13, screen:223.7 }`. Assert (444) is `in + shotDuration*rate <= LEN + 0.02`; it is console.assert (prints, does not stop). Update LEN to the new ffprobe lengths. Add an entry for any new src name.

### 1c. Voice offset and hard-coded times
- No offset in code. voice.m4a was pre-trimmed of leading silence (PROCESS step 4) so words.json times start at 0 and data-start is 0. New take: trim the same way, regenerate words.json from it.
- `DUR = 44.5` build.mjs:8: used in T() (:16), captions last-group end (:193 `DUR-0.1`), progress bar (:175), tracker (:178), every sub-comp data-duration (:369-402), sfx clamp (:430). Set to the new voice length.
- `FPS=30`, `W=1080`, `H=1920` :8. T(w) = words[w].s - 0.06 (2 frames early); w<=0 gives 0; w>=words.length gives DUR (:16).
- Music: tools/music.py:6 `DUR=44.5`, `DROP=24.733` (comment: start of "send connection requests", word 84). Change both for the new take; the drop should land on the new word index equivalent (shot M(84,"connect") chapter change, "recruiter" bot section). Run music.py (needs numpy; whisper venv python3.12), then convert wav to m4a yourself.
- CTA/end: word index 152 hard-coded in build.mjs:170 (`T(152)` watermark end and re-show logic) and :358 (`sh.s > T(63)`: per-cut SFX only after word 63). All ten variants use `w:152` for the CTA gfx (variants.mjs 60, 68, 84, 97, 107, 124, 132, 140, 150, 158). Word 152 = "comment Solid ..." Re-map.
- Per-variant explicit seconds (not word indices): v10 title `at:0.1,dur:2.7` (158), watermark `at:3.0`; 05 hook list. `GFX.watermark` default `at 0.4`.
- Caption word lists keyed to script text: `PROPER` regex build.mjs:184 (AI, I, LinkedIn, HR, CEO, Asana, Slack, "Solid", a.k.a.), `KEYW` :206 (agents|six-figure|cloud|human|recruiter|LinkedIn|calendar|CEO|headache|night|Solid|scare|testing). Retune for the new script wording. Caption grouping `capGroups` (:186) is generic (uses words.json s/e).
- Hard-coded brand text: ".tech" in CTA (:171), `Comment “SOLID”` pill (:171), title `html` strings in variants 05 ("run by agents", :107) and 10 ("AI runs my business", :158), `chip` texts Asana/Slack/Recruiter bot (variants 46-50), stage titles/logs in every shot, MOCK content (Jordan Lee, Recruiter bot, CEO bot, LinkedIn). If the new script is not the Solid script, all of this is rewritten; if it is the same script with another presenter, only the numeric indices move.

### 1d. Word indices in base() (variants.mjs:16-43) and the DENSE list (build.mjs:338-343)
base() shots start at w = 0, 9, 17, 22, 29, 35, 47, 53, 56, 63, 68, 73, 84, 87, 94, 104, 117, 124, 132, 147, 152 (21 shots). Table in section 2.
DENSE = [word index, sound, vol] (first 5 s accents; applied for ALL variants; the index is converted by T(w), minus 0.04 s for "whoosh*"): 2 pop .22; 3 whoosh-short .16; 5 impact-bass-2 .18; 5 glitch-3 .12; 8 click .26; 9 whoosh-short .2; 11 click-soft .26; 12 pop .22; 13 key-press .24; 14 pop .2; 17 whoosh .18; 17 ping .14; 18 sparkle .14; 19 click .24; 21 impact-bass-1 .2; 22 whoosh-short .2; 25 click .26; 29 whoosh .18; 34 sparkle .14; 35 whoosh-short .2; 39 click .24; 41 click-soft .26; 45 pop .22; 47 whoosh .16; 50 ping .12; 53 key-press .26; 56 whoosh-short .2; 57 notification .14; 60 pop .22; 63 impact-bass-1 .18 (30 accents; 15 in the first 5 s, rule from PREFERENCES). Re-pick each on the matching stressed word of the new take.
Other word-index consumers: `stack` mock `atW:[118,121,122]` (build.mjs:126; v05 line 105, base S(117) line 37 `atW`), `st.atW` stage log timing (:157), `tools()` chips w 122/123 -> toW 127 (variants:47-48, defined but not used by any variant), `recruiter()` chip w66->73 (50; unused). Hook SFX at t=0.02 (build.mjs:351).

### 1e. screen.mp4 regions `R` (variants.mjs:4-10) and S vs M shots
R (px in a 1920x1080 recording, cropped to avoid third-party names): side {0,180,640,500} (18.3-19.9 s), type {560,640,900,400} (7-9 s; unused), agents {300,90,1260,900} (137.2-140.3 s), dash {150,80,1400,760} (173.6-176 s), dashTop {150,80,1400,560} (158.3-160.5 s).
Real-screen (S) shots: base S(63, in 18.3, "side") recruiter bot list; S(94, 137.2, "agents") agent-to-agent messages; S(117, 173.6, "dash") dashboard (atW 118/121/122). Variant-specific: v03 w47 `scr(158.3,"dashTop")` and w56 `scr(18.3,"side",{rate:.55})`; v06 w99 `scr(139.0,"agents",{zoom})`.
Mock (M) shots in base: M(29 li_open), M(53 li_signin), M(68 brief), M(73 li_search), M(84 connect), M(87 calendar), M(104 groupchat). v03 adds M(35 li_profile). v05 replaces S(94)->M(groupchat) and S(117)->M(stack) (and drops w104), so v05 already shows the pattern with NO screen footage except S(63 side).
No screen recording for Phoebe: replace the 3 S shots. Mapping: S(63 side) -> new mock or reuse `brief`/`connect`; S(94 agents) -> `groupchat` (as v05); S(117 dash) -> `stack` (as v05). Delete `scr`, `R`, the v03/v06 scr shots (use mock/ cam), `DIM.screen`, `LEN.screen`. stage() (build.mjs:148-151) treats a shot with no `sh.mock` as a screen layer and reads `layers[0].region`; mock shots skip it.

## 2. base() shot list (variants.mjs:16-43)
Kinds: C camera clip, S screen, M mock. Zoom/origin are camFx options (`zoom [from,to]`, `origin`); no option means default zoom [1,1.05] origin 50% 42%.
| # | w | Spoken words (comment) | Kind | Source, in-point | Options |
|---|---|---|---|---|---|
| 1 | 0 | AI is honestly starting to scare me a little | C | hook @0 | zoom 1->1.14, origin 46% 30% (hook zoom preference) |
| 2 | 9 | you can now run every part of a | C | afterhook @0.4 | zoom 1.22->1.3, 50% 32% |
| 3 | 17 | six-figure business entirely through agents | C | run @15.6 | default |
| 4 | 22 | because it has access to its own | C | run @20.6 | zoom 1->1.1 |
| 5 | 29 | computer that runs on the cloud | M | li_open | stage "Cloud computer", log: Virtual computer booted / Browser ready |
| 6 | 35 | it can use any website or app exactly like a human would | C | thinking @4.0 | default |
| 7 | 47 | meaning it does exceptionally well at | C | laptop @1.2 | zoom 1.05->1.12, 62% 30% |
| 8 | 53 | testing products end-to-end | M | li_signin | stage "Testing end-to-end" |
| 9 | 56 | managing communications on all platforms and more | C | laptop @3.2 | default |
| 10 | 63 | this is our recruiter bot | S | screen @18.3, region side | sfx click-soft .2, stage "Recruiter bot" |
| 11 | 68 | aka our official HR department | M | brief | stage "Recruiter bot" |
| 12 | 73 | every day its job is to scout talent on LinkedIn | M | li_search | stage "Scouting talent" |
| 13 | 84 | send connection requests | M | connect | stage |
| 14 | 87 | and book qualified candidates on my calendar | M | calendar | stage |
| 15 | 94 | I also have my recruiter interact with our CEO bot | S | screen @137.2, region agents | stage "Recruiter <-> CEO bot" |
| 16 | 104 | in a group chat who not only understands the vision of our company | M | groupchat | stage "Group chat" |
| 17 | 117 | but overlooks the performance dashboard, Asana, Slack | S | screen @173.6, region dash | atW [118,121,122], stage "CEO bot" |
| 18 | 124 | and everything that normally gives me a headache | C | thinking @8.6 | zoom 1.1->1.18 |
| 19 | 132 | it's crazy to me that I set up my whole team in a single night | C | laptop @6.4 | default |
| 20 | 147 | and now you can too | C | run @22.6 | default |
| 21 | 152 | comment "Solid" and I'll send you the link | C | last @1.6 | zoom 1->1.03 (CTA graphic w:152) |
Shot options elsewhere: `tx` ("punch" | "flash"), `rate`, `sfx`/`vol`, `box`, `radius`, `inset`, `t` (explicit seconds instead of `w`). base() params: camFx, scrFx, mockBox, tx, scrSfx.
In-points used in base: hook 0; afterhook 0.4; run in-points 15.6, 20.6, 22.6; thinking 4.0, 8.6; laptop 1.2, 3.2, 6.4. Each in-point + shot length must stay inside the new clip (LEN assert).

## 3. The ten variants (what each overrides)
Common: all use `shots: base(...)` and `gfx: [... cta w:152 ...]`.
1. 01-reference-cut: base() unmodified, caption `ref` y1046 (one small lowercase white word), bg #000, dark mock, only gfx = cta (y1210). Minimal SFX.
2. 02-punch-karaoke: `tx:"punch"` on every camera cut; caption `bold` y1180 (3-word yellow karaoke); cut SFX whoosh-short every 2nd (vol .14); gfx watermark pill + cta y860; screen shots rounded cards via stage on #0b0b0c.
3. 03-split-screen: `stageBox` BOT, light stage/mock; `put()` adds M(35 li_profile) and two real-screen shots (w47 dashTop, w56 side rate .55); `persist` TOP-half camera layers: thinking w29-56 @0.3, laptop 56-94 @1.0 rate .75, thinking 94-124 @2.6; caption `pill` y960; watermark + cta y1200.
4. 04-face-bubble: base(), `logX/logW`; `persist` 250 px round bubble (x760,y1330) from thinking w29-35, w53-56, laptop w63-124 (rate .5); caption `pill` y1210; sfx whoosh-short every 3rd; cta y880.
5. 05-clean-mock: drops w104, swaps S(94)->M groupchat, S(117)->M `stack` (atW 118/121/122); navy radial bg, accent #7cc4ff; caption `clean` (Outfit); `hook:["sparkle","whoosh"]`; gfx `title` "run by agents" w20-22 + cta.
6. 06-hyper-cut: 29 shots: `put()` adds jump-zoom camera splits at w 5, 20, 26, 42, 59, 128, 139, 143 and a w99 screen shot (tx flash, agents region); `tx:"punch"` base; caption `slam` (128 px one word, KEYW words cyan); cut SFX rotation whoosh-short/whoosh/glitch-3; hook glitch-1+impact-bass-2; flash gfx at w22, 63, 132 + cta y860.
7. 07-dark-terminal: border on screen layers (scrFx), scrSfx key-press; caption `mono` (JetBrains Mono, green #5cf2a5, "> " prefix); hook impact-bass-2+glitch-3; watermark + cta y860.
8. 08-teal-brand: camFx puts every camera shot in a rounded card box {60,420,960,1180} on #12D3E0; light mock/stage; caption `pillLight` y1170; scrSfx pop; hook whoosh+chime; watermark y330 + cta y900.
9. 09-hex-3d: `three:{bg,color}` field of 3D hex prisms (needs lib/three copied from hackathon-video/template); camera cards {90,330,900,1120}; caption `bold`; sfx whoosh every 3rd; hook impact-bass-1+sparkle; cta y880.
10. 10-title-hook: base(); caption `lower` (two-line, words light up); gfx progress bar, `title` "AI runs my business" at 0.1 for 2.7 s, flash w63 and w132, watermark at 3.0, cta y860; hook impact-bass-2+whoosh; sfx whoosh-short every 4th.

## 4. Building blocks
Mock scenes (MOCK, build.mjs:66-130; each takes (id,s,e), draws in a 1000x1000 box, auto-adds SFX):
- li_open: typed URL, LinkedIn-style feed loads, cursor to first post.
- li_signin: typed login, Sign in click, feed after.
- li_search: typed search, results slide in, open one, scroll.
- li_profile: profile opens, Connect to Pending, scroll.
- connect: three rows, Connect flips to Pending with clicks.
- calendar: interview block drops in, "Booked by Recruiter bot" toast.
- groupchat: four-message Recruiter bot / CEO bot thread.
- brief: prompt typed into a chat input and sent.
- stack: three tool rows (Performance dashboard, Asana, Slack) with ticks, `atW` word-timed.
Caption styles (CAPS :195-205): ref (1 small lowercase word), bold (Montserrat 3-word, yellow active word), slam (Archivo Black 128 px, KEYW cyan), pill (dark pill, cyan active word), pillLight (white pill), clean (Outfit, light-blue active), mono (JetBrains Mono terminal, green), lower (two-line, words light up).
GFX (:168-181): chip (text pill with dot, popped on a word), watermark (Solid logo pill at top, hidden during stage spans), cta (logo + ".tech" + "Comment SOLID" pill, bass hit), title (big stamped words), flash (white flash on a time), progress (top bar over full DUR), tracker (step pill; steps by word; user dislikes it).
Stage (:140-164): backdrop with Solid mark, header pill, animated checkmark activity-log rows around each product beat; split mode when `stageBox`. Layer options (layerHtml :21): box, region, to (pan between regions), zoom, origin, tx punch, rate, inset, radius, shadow, border, fy (vertical focus). Variant options: bg, mock light/dark, accent, stageBg, stageTheme, headY, logX/logW, noHead, hook (SFX pair at 0.02 s), sfx {cut,every,vol,lead,extra}, persist, three, music.

## 5. Input paths and a minimal fork recipe
Paths: hard-wired. `ROOT = path.dirname(fileURLToPath(import.meta.url))` (build.mjs:7): reads `ROOT/assets/words.json` (9) and `ROOT/assets/sfx/manifest.json` (10); writes `ROOT/videos/<id>/`; hard-links `ROOT/assets/<used files>` into each project (435; hard links need the same volume); imports `./variants.mjs` (448); for three.js copies `ROOT/../hackathon-video/template/lib/three/*` (436) and always copies `ROOT/../hackathon-video/template/hyperframes.json` (439). No env var, no CLI root; CLI args are only variant id prefixes (`node build.mjs 01 03`). package.json pins hyperframes@0.9.72 (437).
Minimal edits to run a copy at `phoebe-video/` (with its own assets):
1. Copy build.mjs, variants.mjs, tools/music.py into phoebe-video/; make `phoebe-video/assets/` hold: words.json, voice.m4a, music-bright.m4a, sfx/ (copy whole folder incl. manifest.json), the logo/mark PNGs (still the brand being advertised? else swap), and the camera clips under the names used (or rename `src` strings in variants.mjs).
2. build.mjs: set `DUR` (:8) to the new length; update `LEN` (:443); fix the two `../hackathon-video/template` paths (:436, :439) to absolute paths into the real workspace, e.g. `${ROOT}/../hackathon-video/template/...` still works if phoebe-video sits beside hackathon-video (it does) so NO edit needed there.
3. variants.mjs: re-map every word index (base, DENSE in build.mjs, CTA `w:152`, `T(152)` at build.mjs:170, `T(63)` at :358, v05/v03/v06 overrides) against the new words.json; replace `scr()` shots with mocks; retarget camera `in` points.
4. tools/music.py: set DUR and DROP; run; convert wav to m4a.
5. `node build.mjs 01` first, then `cd videos/01-reference-cut && npx hyperframes@0.9.72 check`, snapshot, render, ffprobe 1080x1920 and duration, contact sheet.

## 6. Standing preferences (docs/PREFERENCES.md) as a checklist
- [ ] Research first: parallel agents look at every file (frames, audio, images), write findings to disk before editing.
- [ ] Transcribe every audio source, including any reference.
- [ ] Study the reference plus Nate and Motion systems and borrow from them.
- [ ] Work in a new folder of its own; save all research to disk.
- [ ] Copy the reference closely: fast cuts, same rhythm.
- [ ] Make many variants (ten), not one.
- [ ] Beat with no footage: build it (HyperFrames, three.js); do not skip it.
- [ ] Use the brand logo.
- [ ] Hook: attention-pulling sound effect on every variant.
- [ ] Hook: slight but visible zoom-in on every variant (14% in the Solid cut).
- [ ] Sound effects required, many in the first 10-20 s; first 5 s has an accent on nearly every stressed word (15 there).
- [ ] Background music under every video modelled on the reference track; use the "bright" bed on all.
- [ ] Product demos: no screen crop floating in black; frame is full; where a clean crop is impossible build an animated demo; poor real site footage is recreated as built browsing/clicking animation.
- [ ] Look: no italic serif captions (clean sans only); no chapter/step pill at the top ("1/5 THE HOOK").
- [ ] End card: brand web address, logo with ".tech" ("Solid.tech"); adapt to the brand actually advertised.
- [ ] Deliver finished videos in a folder of their own; document the process and link the documents; say when done; update the skill and preferences after feedback.
Standing caveats from the old run: audio was measured never heard; music is synthesised; mock people and activity logs are fictional; CTA clip was dim.

## 7. Planning rules from the Nate and Motion videos that apply
- Transcribe first and drive every caption, cut and SFX from word start times (Nate step 1). Already true here: new words.json is step zero.
- Cut dead air and mistakes before designing (Nate 2); trim the new voice take's leading silence.
- Write a numbered beat sheet / storyboard with shot id, time span, spoken line, source + in-point, layout, SFX, and approve it before building (Motion tip 2; Nate "when I say X, show Y"). Say "these are the only beats" if no extras wanted. Here: lock the new base() table (section 2 format) before touching code.
- Verification loop is the key step (Nate 5): render, snapshot, look, fix, re-render ("output 5 or 6"); check face stays in frame, text legible, no stuck artifacts, audio present; contact sheet from the MP4 itself.
- Visuals first, sound last (Motion tip 6): lock cuts, then place SFX/music; SFX need an on-screen cause; music about 0.14 vs voice in the HyperFrames guide (this build uses 0.45 on a quiet bed; measure).
- Real assets over generated; never redraw the logo from shapes (Motion tip 1); use the hi-res logo files. Always put a glass/dark card behind inserted text/assets (Nate), already how stage rows work.
- Every shot transforms into the next, no cross dissolves, always some motion, slow drift on static media (Motion 3, 5; Nate unprompted zoom). Keep the action centred (tip 4). Text: words slide up in order, no bounce or per-letter fade (tip 9).
- Know the CTA and hold the end card at least 2 s (Motion tip 8).
- Vertical short layouts from Nate: full-bleed b-roll, small face bubble, 2-3 word caption with ONE highlighted word, B-roll top / presenter bottom (already variants 04 and 03). His top step pill conflicts with the user's "no pill" preference; skip it.
- Write the VO to the finished length (tip 10): here the voice sets the length (DUR); set DUR from the new take.
- After v1, write what worked into a skill/DESIGN note; one shared design plus per-variant SPEC.md (Nate 4); compare against the real product and say what is wrong (Motion 12).
- Safe zone (vertical): words/product inside y 288-1248 and x 120-888; run `check --safe-zone tiktok`. The old lower-caption variants sit below the line (known weak point).
- Pitfalls to avoid: half-typed caption frames (land captions in 0.1-0.2 s), text under 28 px, one accent colour per film, 1-2 s shots with transitions under 0.3 s, pin hyperframes@0.9.72, check how non-30 fps phone footage is resampled on a 10 s test, rotated phone clips (verify with a snapshot).
