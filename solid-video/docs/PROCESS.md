# How the ten Solid videos were made

A record of the steps, in order. Preferences that shaped them are in [PREFERENCES.md](PREFERENCES.md);
file locations are in [README.md](README.md).

## 1. Inventory

Listed the drive-download folder and probed every file with `ffprobe`.

- Six camera clips (`.MOV`), stored landscape with a rotation tag, so they are really vertical 1080×1920.
- One 224 s screen recording of the Solid app (1920×1080).
- Two voice takes (`.m4a`, about 45 s each), the reference video (720×1280, 40.3 s) and the Solid logo.

## 2. Transcription and frames

- Converted every audio track to 16 kHz WAV and transcribed it with `mlx_whisper` (large-v3-turbo) with word timestamps. Output: `research/transcripts/`.
- Both voice takes follow the reference script word for word, with "AI", "agents" and "Solid" swapped in. The camera clips' own audio is set chatter.
- Extracted frames from every video into `research/frames/` and contact sheets into `research/sheets/`.

## 3. Research agents (four, in parallel, Sonnet)

| Report | Question it answered |
|---|---|
| [reference-breakdown](../research/reference-breakdown.md) | Shot list, cut times, caption style and pacing of the reference |
| [footage-catalogue](../research/footage-catalogue.md) | What is usable in each camera clip, and which script beats have no footage |
| [screen-catalogue](../research/screen-catalogue.md) | What the Solid recording shows second by second, and what must stay off screen |
| [systems-digest](../research/systems-digest.md) | Nate's and Motion's workflows, plus the HyperFrames rules that apply |

Main findings: the reference is 18 hard-cut shots averaging 2.2 s with one white word at a time just below
centre; it has no logo or graphics. There was no footage for the recruiter, calendar, group chat, CEO bot,
Asana or Slack beats. The screen recording shows real third-party names and emails that must be cropped out.

## 4. Asset preparation (`solid-video/assets/`)

- Re-encoded every clip to 30 fps H.264 with a keyframe every 15 frames so frame seeking is exact.
- Chose voice "Take two", trimmed its leading silence and normalised it.
- Built `words.json` (160 words with start and end times) from the transcript; fixed "her company" to "our company".
- Made a white version of the logo and a mark-only crop. Copied the HyperFrames bundled sound effects.

## 5. Plan

- Output: vertical 1080×1920, 30 fps, 44.5 s (the voice take's length).
- One cut skeleton of 21 shots mirroring the reference: person and product alternate, and every cut lands
  two frames before a word.
- Ten variants differ in treatment (captions, layout, motion, graphics, sound), not in script.
- One generator instead of ten hand-built projects: [`variants.mjs`](../variants.mjs) holds the cuts as
  data and [`build.mjs`](../build.mjs) writes a HyperFrames project per variant.

## 6. Build and verify loop

1. Built variant 01 alone, ran `hyperframes check`, took snapshots and looked at them.
2. Fixed what the frames showed (crops too small to read, captions colliding with graphics).
3. Defined the other nine, then for all ten: check, snapshot sheet, look, fix. Bugs caught this way: a
   white flash that stayed on screen in 06, an oversized 3D hexagon in 09, captions outside the TikTok safe area.
4. Rendered each to `videos/NN/out/final.mp4`, confirmed size, length and audio stream with `ffprobe`,
   and read a contact sheet of each render.

## 7. Feedback rounds

| Note from Zack | Change |
|---|---|
| Demo crops leave black space; build animated demos | Every product beat got a full-frame "stage": Solid header, product card, animated activity log, turning hexagon. The typing crop became a built animation. |
| Hook needs a sound that draws people in | Impact plus a second sound at frame 0 on every variant |
| Hook needs a slight zoom | Hook push-in raised from 5% to 14% |
| Many sound effects in the first 10–20 s | 21 accents on stressed words up to "recruiter bot" |
| Background music like the reference | Measured the reference (about 89 BPM, quiet pad, bass drop near 23 s) and synthesised three beds with [`tools/music.py`](../tools/music.py) |
| Use number 9's music everywhere | All ten now use the "bright" bed |
| Number 5's font is ugly | Italic serif replaced with a bold rounded sans |
| Remove the "1/5 THE HOOK" pill on number 4 | Removed |
| The real LinkedIn footage is not good; recreate it as browsing and clicking through LinkedIn | Every LinkedIn screen-recording shot replaced with built scenes (`li_open`, `li_signin`, `li_search`, `li_profile` in `build.mjs`): typed URL, sign-in, search with results, profile with Connect, all with a moving cursor |

| A nice amount of sound effects within the first 5 s | Accents raised from 7 to 15 in the first 5 s of every variant |
| End on "Solid.tech", not just the logo | ".tech" set beside the logo on the end card of all ten |

## 8. Delivery

Final files are in `solid-video/out/` and copied to `Solid final videos/`.

## Limits to know about

- The audio was measured, never listened to.
- The music is synthesised, not a licensed track.
- The recruiter, calendar, group chat and CEO-bot scenes and the activity-log lines are built illustrations with fictional sample content.
- The CTA clip is dim and orange and does not match the other shots.
- The full list is in [../README.md](../README.md#known-weak-points).
