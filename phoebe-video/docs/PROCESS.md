# Process: the Phoebe run (2026-11-21)

Second use of the [short-form-video skill](../../.claude/skills/short-form-video/SKILL.md). The first run is recorded in
[../../solid-video/docs/PROCESS.md](../../solid-video/docs/PROCESS.md). Same product and script, new presenter, no reference video this time, so the
first run's reference skeleton (21 shots) and Zack's [preferences](../../solid-video/docs/PREFERENCES.md) were carried over.

## Steps

1. **Probe.** 20 `.mov` files, all 1080x1920, 8 to 73 s; one at 29.97 fps and three at 60 fps.
2. **Transcribe.** Every clip through mlx-whisper (large-v3-turbo) with word timestamps: [../research/transcripts/](../research/transcripts/).
   Nine clips are takes of the script; eleven have no speech (whisper output for those is noise or song lyrics).
3. **Contact sheets** of every clip: [../research/sheets/](../research/sheets/).
4. **Agents, in parallel, each writing a report:**
   - Opus: ranked the nine takes ([aroll-catalogue.md](../research/aroll-catalogue.md)).
   - Sonnet: catalogued the b-roll second by second ([broll-catalogue.md](../research/broll-catalogue.md)).
   - Sonnet: digested the existing generator and docs, including the Nate and Motion planning rules ([pipeline-digest.md](../research/pipeline-digest.md)).
5. **Rename** the raw files so the name says what each is; key in [../../Phoebe/README.md](../../Phoebe/README.md).
6. **Plan.** Script in [../SCRIPT.md](../SCRIPT.md), shot list in [SHOTLIST.md](SHOTLIST.md). Every cut is named by a word index.
7. **Prepare assets.** Used clips re-encoded to 30 fps H.264 with a keyframe every 10 frames; voice levelled from -34.6 dB mean to about -18 dB;
   music bed regenerated at the new length with the drop on "send connection requests" (25.53 s).
8. **Adapt the generator.** `build.mjs` and `variants.mjs` copied from solid-video; changed length, clip table, every word index, the sound-effect
   accents, and added per-clip framing defaults (`LOOK`). The voice take (`main`) is always placed in sync with the voice.
9. **Build one, look, then the rest.** Variant 01 checked and snapshotted shot by shot, two crops fixed, then all ten checked and rendered with
   `tools/render-all.sh`, and a contact sheet of each render read.

## Decisions

| Decision | Why |
|---|---|
| Take 01 (sofa) is the voice and main picture | Memorised, to camera, no stumbles. Take 03 has better sound but she reads off the laptop. |
| No pause trimming; videos are 46.6 s, not 44.5 s | Keeps lips and voice in sync with no extra cuts. |
| A-roll punched in 1.6x | The take is framed wide (face half-way down the frame). |
| B-roll covers five slots | Same outfit as the take, so it intercuts cleanly. The pink-blouse clips do not match and were left out. |
| Product beats are built scenes plus the first run's Solid screen recording | The new footage shows no LinkedIn, calendar, chat or dashboard. Only one clip shows a legible Solid screen. |
| The laptop close-up is cropped | Its bookmarks bar shows personal bookmarks. |
| Duplicate file kept but labelled | `broll-06-DUPLICATE…` has the same frames as `broll-06-standing-reading-phone…`. |

## Known flaws

See the hand-over notes at the bottom of this file once the renders are reviewed.

### Hand-over notes (after reviewing every render)

- All ten pass `hyperframes check` with 0 errors and render at 1080x1920, 46.6 s, with audio. A contact sheet of each is in
  [../research/sheets/renders/](../research/sheets/renders/).
- **Not listened to.** Voice level, music balance and sound-effect timing were measured or counted, not heard.
- **Invented:** every built scene (LinkedIn-style pages, calendar, group chat, recruiter brief, activity-log lines, sample names).
- **Reused from the first run:** the Solid screen recording behind "recruiter bot", "CEO bot" and "dashboards".
- **Soft picture:** the A-roll is enlarged 1.6x (2x on the jump cuts in variant 06) from a wide phone take.
- **Mismatch:** b-roll was shot against two other walls, so the background changes on those cuts. The outfit matches.
- The script as spoken says "her company" and has no "Asana"; captions follow the audio.
