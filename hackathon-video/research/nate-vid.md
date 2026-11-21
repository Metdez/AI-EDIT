# Research: Nate Herk "Opus 5.5 Just Changed Video Editing Forever (free skills)"

Source: `Nate vid/transcript.md` (full read), `Nate vid/videoplayback.mp4` (640x360, ~19:15). Frames in `hackathon-video/research/frames-nate/` (`sheet_01..08.jpg` = contact sheets, 1 frame / 5 s, 6x5 each, so frame N of sheet S is at ~ ((S-1)*30+N)*5 s; `f_NNNN.jpg` = full-res single frames at second NNNN).
Note: model names in the transcript ("Opus 5.5", "Fable 5.1", "GPT-6 Astra") are what the speaker says / auto-captions; I do not verify them.

## (a) Workflow, tools, prompts

### Tools / repos / skills named
- **HyperFrames** (github `heygen-com/hyperframes`, tagline on screen: "Write HTML. Render video. Built for agents."). Claude writes HTML + animates it (GSAP per his kit README), renders to MP4. Repo has `agents/skills`, `claude-plugin`, `codex-plugin`, `cursor-plugin`, `examples`, `packages`, `registry`. Setup = paste the GitHub URL to Claude Code: "Hey, set up Hyperframes so that we can use it to animate videos."
- **Claude Code / Claude desktop app** with Opus 5.5 at **High** effort (status bar shows "Opus 5.5 / High"; he says all examples ran on high). Intro prompt starts with the `/goal "<path to mp4>"` command (f_0062).
- **Hyperframes Student Kit** (his free repo, via his Skool community; not public link). Visible files (f_0100): `AGENTS.md`, `CLAUDE.md`, `DESIGN.ais-example.md`, `MOTION_PHILOSOPHY.md`, `README.md`, `THIRD_PARTY_NOTICES.md`, `package.json`, `skills-lock.json`. README: "reusable video-editing kit for Codex and Claude Code. Bring your own footage. Cut dead air, review mistakes, plan the story, and build motion graphics with HyperFrames and GSAP." Contains skills + finished examples.
- **Self-made skill "motion show reel"**: he downloaded a reel by "Ken" (seen on X, made with HyperFrames + Opus), told Claude "analyze this video ... figure out why this is so good", then "Turn that into a skill", then "use that skill, create me a show reel about YouTube".
- **Transcription**: ElevenLabs API (faster, pay per use) or Whisper (local, free, slower). Needed so graphics land on exact words.
- **Asset generation**: "key.ai" (as written in the auto-transcript; likely kie.ai - unverified) to generate images/videos; **Kling** for image-to-video (generated still, then sent to Kling, then returned to Claude). Also scraped screenshots, website images, real thumbnails, screen recordings as B-roll.
- **Scrollcraft**: his free website-design skill (unrelated to video).
- Sound design/music: the agent generates/sources it itself ("music, sound effects", "sync the music to the beats"). No specific library named. Could not determine the source.
- Reference: Claude "Show reel" prompt from X: "Make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are, like it's your showreel for a resume. Go all out."

### His 5-step method (end of video, slide on f_? sheet_07/08)
1. **Transcribe** (Whisper/ElevenLabs) so beats land on exact timing and the AI can tell a story.
2. **Cut** - remove mistakes and dead air using the transcript.
3. **Plan the beats** - be explicit "at this point I want this to come in"; more specific = more aligned; leave room for creativity or say "only these beats, nothing else".
4. **Use skills** - build skills from inspiration videos; after each run give feedback ("liked this, didn't like that") and have it update the skill. "If you ever find yourself repeating something, throw it in the skill."
5. **Verification loop** - agent renders, takes screenshots/frame strips, looks at them, fixes, re-renders (output 5-6 not output 1) before handing over.

### Quoted prompts
Intro (talking-head with overlays), one prompt, input was the raw mp4:
> "I need you to edit this to be super engaging and clean with hyperframes. We need Apple style super clean motion graphics and animations. The first step is for you to transcribe the video so you can make sure that the motion graphics and animations come in at the exact perfect time. Then you will build the animations based on my instructions. When I say super powerful models like Fable 5.1 and GPT-6 Astra, what I want you to do is have animations come in where I'm pointing. So when I say Fable 5.1, I point to the left side of the screen... [logo research, animate the logo] ... make sure there's some sort of liquid glass card behind the element as it's animated. Otherwise, it will be hard to read and see against the background. ... When I say best outputs ever, I want you to have all three of those words at the bottom and highlight them [overlay under the text so it's readable]. ... For the rest of the video, when I'm talking about B-roll and screenshots and generating images and videos, I want you to have things come in on the left and right side of the screen. Once again, they should have some sort of overlay behind or liquid glass ... go off and get a B-roll screen recording and grab a screenshot and pull in stuff because I want you to prove to the viewers that you're able to do all of this ... prove it in real time."
(Also on screen near the end: "look back at the frames ... make sure that my face is never being covered" - face-safe zone check.)

Show reel from inspiration: "Analyze this video, which was created by Opus 5.5. Figure out why this is so good ... pacing and the types of frames and the energy that it gives off." then "Turn that into a skill." then "Create me a 15-second reel, based on this skill ... Collect B-roll images, any assets you need. Make sure the whole thing feels branded to YouTube. Typography, design, language, colors, branding ... should be unmistakable in the show reel."

Whiteboard: "I want you to edit this using hyperframes. I'm looking for a simple and clean whiteboard hand-drawn style animation ... as if you're trying to explain to a kid ... If you need to generate any assets ... use key.ai. Some scenes should be a full screen whiteboard takeover and some scenes should just be the left half is the whiteboard and the right half is my face."

Course style: "I need you to edit a course style video for me using hyperframes. My camera will start off full screen and then I want it to be a rounded crop. The background is going to be super simple, super minimalistic. ... bullet points with important takeaways, not too wordy, and they should be big. And then visual aids should just be AI generated images, very simple, very light motion graphics to help illustrate concepts."

Short-form (vertical): "Generate the assets you need. Have it be engaging. Have it be fast-paced, easy to understand." (no skills used, one shot). Lululemon: described emotion only: "high energy, fast-paced, engaging, sync the music to the beats, sound effects".

Follow-up edit prompt seen in desktop app: "make a vertical 9:16 cut for Reels".

### Verification approach as shown
Agent final messages: "I pulled frame strips from the rendered file across every transition and checked them. The first render had a blue laser line stuck across most of the ..."; "I checked the rendered file itself: all 795 frames show the camera, the audio is there, and your whole face stays inside the frame"; "checked it from rendered frames and audio measurements, but couldn't listen to it" . Pattern: render, extract frame strips at transitions, inspect, audio-level check, fix, re-render. Also checks face never covered by graphics.

### Pitfalls / tips
- Put a liquid-glass / dark overlay card behind every inserted element or it is unreadable on a busy background.
- Be emotional/vibe-specific when you do not know specifics; supply a reference video and have the agent distil it to a skill.
- Not perfect: awkward speech cuts, tiny eggs / glaze only on one slice (quality of generated assets); the agent cannot listen, so audio is checked via measurements only.
- Agent added unrequested but good details: subtle slow zoom-in on the avatar, CLAUDE-style terminal UI for "one prompt", a verification-screenshots animation.

## (b) Key frames

All paths under `/Users/zackhanna/Desktop/AI video/hackathon-video/research/frames-nate/`.

| # | Time | File | On screen | Technique to steal |
|---|------|------|-----------|--------------------|
| 1 | 0:02 | f_0002.jpg | Plain talking-head, full frame 16:9, neon "AIS" behind | Baseline: speaker full-frame, centred, head in upper-middle third. Graphics must leave face region clear. |
| 2 | 0:06 | f_0006.jpg | Pill label "Fable 5.1 / Anthropic" with logo, left mid, frosted-glass rounded rect | Liquid-glass pill (blur + translucent grey, ~16px radius, logo + 2-line text), placed beside head at the side where speaker points; spring in. |
| 3 | 0:25 (also sheet_01) | f_0025.jpg | Two glass cards left/right, bottom: "Generated image" and "Screenshot" with caption labels and icons, face centre uncovered | Symmetric left/right glass cards flanking the head; thumbnail + caption label row; keeps centre column clear. |
| 4 | 0:30 | f_0030.jpg | Two small glass pills "Motion design" / "Sound design" at head height | Minimal keyword pills (icon + 2 words) timed to spoken words; small, not full cards. |
| 5 | 0:38 | f_0038.jpg | Single glass pill "Amazing taste" with sparkle icon, left | Same pill style reused for emphasis words; consistency. |
| 6 | 0:14 | f_0014.jpg | Full-screen dark reel frame: glowing red playhead bar, HUD corners ("YOUTUBE / MOTION REEL", 1080p60, 129 BPM, timecode 0:01/0:15, scene tag "01 PLAYHEAD") | Full-screen takeover cuts (speaker disappears) with camera-HUD chrome: mono small caps, corner brackets, progress bar bottom, scene index. Great for "graphics full-screen" beats. |
| 7 | 0:19 | f_0019.jpg | 3D-tilted wall of ~35 real thumbnails, red underline per tile, HUD "03 - THE FEED" | Perspective grid of real screenshots; slow camera drift; asset-dense = "feed" feeling. |
| 8 | 0:23 | f_0023.jpg | Chrome 3D play-button with spec-readout callouts (material, IOR, tier) | Hero 3D object + thin leader lines and mono data labels = "premium" tech feel. |
| 9 | 0:21 (f_0021) | f_0021.jpg | Particle-built "500+" with caption "HOURS OF VIDEO UPLOADED EVERY MINUTE" | Big-number stat as particles assembling; wide-tracked caption under. Use for key stats. |
| 10 | 0:25 (f_0025 shows glitch; actual f_0025 earlier) / 0:27 | f_0027.jpg | End card: logo + "BROADCAST YOURSELF / SHOWREEL 2026" with hairline rule | Logo lockup end screen, wide-tracked caps, hairline divider. Pixel-mosaic transition (frame at 0:25 in sheet_01 idx 5 region) between scenes. |
| 11 | 2:58 | f_0180.jpg | Agent-made intro played back: bottom-left rounded 9:16-ish bubble of presenter (desktop recording cam), inside video: bold white caption "Best outputs ever" with underline highlight on words | Word-by-word caption bottom third with underline highlight on emphasis word + dark scrim for legibility. |
| 12 | 1:30 | f_0090.jpg | Desktop screen recording: speaker in rounded-rect cam bubble LEFT, GitHub repo in a large rounded window with drop shadow on wallpaper | Presenter bubble left (rounded rect ~110x200 at 640 wide), content window right. A layout for "avatar small, graphics big". |
| 13 | 7:40 | f_0460.jpg | AIS reel: 3D camera over a grid of course/event tiles (glass cards, glow outline on active tile), HUD tag "03 3D CAMERA", TC, BPM | Grid-of-tiles with one highlighted tile and camera push-in; card chrome with rounded corners + glow stroke. |
| 14 | 9:40 (sheet_04 idx 15-20 / f_0575) | f_0575.jpg | Event reel: video clip inside a rounded bordered frame on dark noisy bg, name tag, big italic bold caption lines with underline accent ("I LITERALLY LOGGED OFF YESTERDAY JUST BUZZING.") | Clip-in-frame + kinetic uppercase italic caption, one word underlined in accent cyan. |
| 15 | 11:40 | f_0700.jpg | Whiteboard scene: step badge "2 Let it sit", red-X "Soggy!" handwritten label vs hand+marker drawing | Hand-drawn style with marker-hand drawing strokes; numbered green badge header. Split compare (wrong/right). |
| 16 | 11:30 (via f_0690) | f_0690.jpg | Agent output preview: left half whiteboard, right half presenter, split 50/50 | The "left half graphics / right half face" layout he requested. |
| 17 | 13:15 | f_0795.jpg | Course layout: dark navy bg, tiny mono "AVOCADO TOAST" label + 4-segment progress, "STEP 03" blue kicker, huge bold white title, blue rule, one bullet, photo top-right (rounded, shadow), presenter in a CIRCULAR/oval crop bottom-right | Closest to our target: small round face bubble in the corner over full-screen graphics; strong title hierarchy, progress segments, one photo. |
| 18 | 14:30 | f_0870.jpg | Vertical short: full-bleed B-roll, top pill progress tracker "7/7 DONE" with dot per step, captions mid with highlighted word in yellow ("AND THAT'S HOW"), tiny circular face bubble bottom-left | Full-screen B-roll + small round avatar bubble + top step tracker + 2-3 word yellow-highlight captions. Exactly our concept. |
| 19 | 14:20 (f_0860) | f_0860.jpg | Vertical short: eggs B-roll, tracker "2/7 EGGS", caption "THE PAN" with yellow word, face bubble bottom-left | Same system; bubble moves little between scenes, caption position fixed mid-frame, tracker increments per step. |
| 20 | 14:50 (f_0890) | f_0890.jpg | Another short variant: split vertical, B-roll top, presenter bottom, "BOTH SIDES CRISPY" caption with emoji | Alternate layout: stacked split. |
| 21 | 1:40 | f_0100.jpg | Student Kit repo: files `AGENTS.md CLAUDE.md DESIGN.ais-example.md MOTION_PHILOSOPHY.md skills-lock.json`, README text | Project structure to mimic: AGENTS/CLAUDE.md rules, a DESIGN.md (palette/typography), MOTION_PHILOSOPHY.md. |
| 22 | 1:02 | f_0062.jpg | Claude desktop app with `/goal "<mp4>"` and the intro prompt, "Opus 5.5 / High" | Confirms the prompt format and effort level. |

(Frame time labels in rows 10, 14 and 22 are approximate; file names are exact seconds.)

## (c) Recommendations for our 93 s avatar video

1. **Stack**: HyperFrames (HTML + GSAP, rendered to MP4) driven by Claude Code at high effort. Install by giving Claude the `heygen-com/hyperframes` URL. Check whether `agents/skills` in that repo has a ready skill; use it rather than hand-rolling.
2. **Pipeline order** (his 5 steps): transcribe 93 s with word timestamps (Whisper local is fine at this length; ElevenLabs if a key exists), cut dead air, write a beat sheet (one row per beat: start-end seconds, spoken words, layout, asset, animation, SFX), build, render, verify.
3. **Layout system** (two modes only, switch on every beat for pace):
   - FULL-GRAPHIC: graphic fills frame, avatar as a ~15-20% circular bubble (frames 17, 18, 19). Move bubble between a few anchor spots (bottom-left, bottom-right, top-right) with a spring; keep it out of caption zone.
   - AVATAR-LED: full-frame avatar with glass pills/cards flanking head (frames 2-5) for intro/outro and emphasis words.
   - Occasional pure full-screen takeover with HUD chrome (frames 6-10) for hero stat/logo beats.
4. **Typography/colour**: dark navy/near-black bg, bold white geometric sans titles, one accent (his YouTube reel red; course blue; shorts yellow highlight), tiny mono-caps labels with wide tracking for HUD/kickers, step progress indicator. Word-by-word kinetic captions, 2-3 words, highlight one word in accent (frames 11, 14, 18). Always a scrim/glass card behind text or inserted assets.
5. **Motion/transitions**: spring-ins for glass cards, slow push-in zoom on avatar and on B-roll (he got this unprompted), pixel-mosaic / glitch wipe and fast cuts between scenes, particle-assemble for big numbers, perspective grid of screenshots for "lots of X". Cut every 1.5-3 s to feel fast.
6. **Assets**: real screenshots/logos scraped from the subject's site where possible; generate stills if needed; image-to-video (Kling) only if budget/time allows; otherwise use Ken-Burns on stills.
7. **Sound**: add a whoosh/hit per cut and a bed track tied to beat grid; ffmpeg loudness check to verify audio since the agent cannot listen.
8. **Verification loop (mandatory)**: after each render, extract frame strips at every transition (e.g. `ffmpeg -vf fps=... tile`) plus mid-beat frames; check (a) avatar face never covered, (b) text legible, (c) no stray artifacts (his run found a "blue laser line stuck across the render"), (d) audio present/levels, (e) duration = 93 s. Iterate until clean, only then deliver.
9. **Prompt style to reuse**: give the video path, say "transcribe first", describe beats as "when I say X, show Y at position Z", demand overlay behind every element, state vibe and brand constraints, allow creativity on the rest. Persist rules in `CLAUDE.md`/`DESIGN.md`/`MOTION_PHILOSOPHY.md` so they are not repeated.
10. **Skill-ify**: after v1, write what worked into a skill and re-run (his compounding loop).

## Could not determine
- Exact sound-effect/music source or library; the exact name/URL of "key.ai" (the transcript spells it "key.ai", possibly kie.ai); contents of his private Student Kit and motion-show-reel skill (only file names visible); exact on-screen text of the full intro prompt beyond what is quoted (it is partly unreadable at 640x360); precise layout numbers (all estimates from 640x360 frames); whether the avatar bubble in the intro demo (0:11-0:27) ever appears - that segment is only full-screen reel cuts, the bubble layouts come from the later course/short examples.
