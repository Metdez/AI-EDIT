---
name: short-form-video
description: Use when Zack wants new short-form or vertical video content made from footage, a voiceover or a reference video (ads, hooks, reels, variants of an edit). Covers the research-first workflow, the variant generator pattern and his standing edit preferences.
---

# Short-form video from footage

The workflow that produced the ten Solid ad variants. Adapt it; the content will differ each time.
Full record: `solid-video/docs/PROCESS.md`. Preferences in full: `solid-video/docs/PREFERENCES.md`.
Also invoke `/hyperframes` before writing any composition.

## 1. Set up

- Work in a new folder of its own. Leave the input folder untouched.
- Keep research in a `research/` subfolder and write it to disk as you go.

## 2. Look at everything before editing

- `ffprobe` every file. Phone clips may be stored landscape with a rotation tag and really be vertical.
- Transcribe every audio source with word timestamps, the reference included.
- Extract frames and contact sheets from every video.
- Send Sonnet agents in parallel, one question each, each writing a report: the reference's shot list
  and caption style; what is usable in each clip and which script beats have no footage; what any
  screen recording shows and what must stay off screen (names, emails, tabs); what the Nate and
  Motion systems suggest.
- Look at a contact sheet of the reference yourself as well.

## 3. Plan

- Match the reference's format, length and rhythm. Cut on words, a couple of frames early.
- List every script beat against the footage that covers it. For a beat with no footage, build it.
- Decide how the variants differ (captions, layout, motion, graphics, sound). Keep the script the same.
- For several variants, write the cuts as data and generate the projects from one script, as
  `solid-video/variants.mjs` and `solid-video/build.mjs` do. Reuse those files as the starting point.

### How the shot list is built

Do this on paper (or in the data file) before any composition exists.

1. **Number the words.** Turn the voiceover transcript into a word list with start and end times
   (`assets/words.json`). Every cut is named by the word it lands on, not by a timestamp, so the
   list survives a re-recorded voice take.
2. **Copy the reference's skeleton.** From the reference shot list, note for each shot: start, end,
   the words spoken, and what kind of picture it is (talking head, close-up, b-roll, screen, graphic).
   Count shots and average length. The Solid reference was 18 shots averaging 2.2 s, fast at the
   start, two long product holds in the middle, fast again at the end.
3. **Split the script into slots at the same points.** Break the new script at clause starts so the
   slots line up with the reference's (Solid: 21 slots). Each slot is "from word N to word M".
4. **Fill each slot from the footage catalogue.** One row per slot: words, source clip, in-point,
   kind of picture, any zoom. Use the usable ranges the footage agent reported and check that a
   clip's range is long enough for the slot. Alternate person and product as the reference does,
   and start a product shot on the word that names it.
5. **Mark the gaps.** Any slot with no footage is flagged to be built (mock UI scene, animation,
   graphic). Decide what it shows and write the on-screen text now.
6. **Check trims.** No two slots should reuse the same seconds of a clip unless intended, and no
   trim may run past the end of its clip. The generator asserts the second point.
7. **Then vary.** Each variant starts from this base list and overrides only what differs: extra
   cuts, a different layout for product shots, a different caption style.

The finished list for each Solid variant is the table in `solid-video/videos/NN-name/SPEC.md`, and
the base list is the `base()` function in `solid-video/variants.mjs`, with the spoken words as a
comment on every shot.

### When the footage is a pile of unlabelled takes (the Phoebe run)

- Transcribe everything first: the transcripts alone separate script takes (A-roll) from silent clips (B-roll) and give you the script.
- One agent ranks the takes (delivery, eye contact, stumbles, framing, things that must stay off screen); another catalogues the b-roll
  second by second with usable ranges. Check for duplicate files.
- If asked to label the files, rename them `aroll-NN-…` / `broll-NN-…` and leave a README key with the old names beside them.
- Pick one take as voice and main picture and keep it in sync with the voice (no pause trimming unless needed); cover the rest with
  b-roll in the same outfit and with built scenes. Wide takes need a per-clip punch-in (`LOOK` in `phoebe-video/variants.mjs`).
- With no new reference video, reuse the last reference's skeleton. Full record: `phoebe-video/docs/PROCESS.md`.

## 4. Build one, then the rest

- Re-encode footage with dense keyframes before using it.
- Build one variant, run `hyperframes check`, snapshot it and look at the frames. Passing the check is not enough.
- Fix what the frames show, then build the others and repeat for each.
- Render, confirm size, length and audio with `ffprobe`, and read a contact sheet of every render.

## 5. Zack's defaults

Apply these without being asked:

- Hook: a sound effect that draws people in, and a slight but visible zoom-in.
- Many sound effects in the first 10–20 seconds, then fewer. The first 5 seconds are the densest: an accent on
  nearly every stressed word (about 15 in the Solid cuts; see `DENSE` in `solid-video/build.mjs`).
- Background music under the whole video, modelled on the reference. He picked the "bright" bed
  (`solid-video/assets/music-bright.m4a`) over the darker ones.
- Product demos fill the frame. No crop floating in black space; build an animated demo where a clean crop is not possible.
- If real screen footage of a site looks poor, recreate the site as a built animation of browsing and clicking through it
  (typed URL, sign-in, search, profile, moving cursor). The LinkedIn scenes in `solid-video/build.mjs` (`li_open`,
  `li_signin`, `li_search`, `li_profile`) are the pattern to copy.
- End card shows the brand as its web address: the Solid logo followed by ".tech" ("Solid.tech"), not the bare logo.
- Fast cuts that follow the reference closely.
- Use the brand logo.
- Clean sans caption fonts; no italic serif.
- No chapter or step pill at the top of the frame.

## 6. Hand over

- Put the finished videos in a folder of their own.
- Say what was invented (mock UI, sample names, recreated third-party sites), what was measured and not heard (audio), and what does not match (off-colour clips).
- Update the docs if the process or the preferences changed.

## Go deeper: the two videos this process borrows from

Both are saved in the workspace with transcripts and written analyses. Read the analysis first; open
the transcript for exact wording; watch the video for what the edits look like.

| Video | What it covers | Video file | Transcript | Analysis |
|---|---|---|---|---|
| Nate Herk, "Opus 5.5 Just Changed Video Editing Forever (free skills)" (about 19 min) | Transcribe, cut dead air, plan beats ("when I say X, show Y"), build a skill from a reference video, render-look-fix loop | `Nate vid/videoplayback.mp4` | `Nate vid/transcript.md` | `hackathon-video/research/nate-vid.md` |
| GenHQ, "Claude as motion-graphics designer" (about 18 min) | Ingredients, numbered storyboard approved before animating, build, sound last | `Moption Vid/videoplayback (1).mp4` | `hackathon-video/transcripts/motionvid.txt` (`.srt` has timestamps; `Moption Vid/transcript.md` is empty) | `hackathon-video/research/motion-vid.md` |

- Side-by-side comparison of the two systems: `hackathon-video/research/frameworks.md`.
- What was taken from each for the Solid ad: `solid-video/research/systems-digest.md`.
- Frames from each video: `hackathon-video/research/frames-nate/` and `frames-motion/`.
- The source URLs of the two videos are not recorded anywhere in the workspace.
