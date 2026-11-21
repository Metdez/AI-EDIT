# Solid video docs

Start here. These files explain how the ten Solid ad variants were made and how to make more.

| File | What it holds |
|---|---|
| [PROCESS.md](PROCESS.md) | Every step taken, in order, from raw folder to ten rendered videos, including the three feedback rounds |
| [PREFERENCES.md](PREFERENCES.md) | Zack's standing preferences for short-form video edits |
| [../README.md](../README.md) | Project layout, rebuild commands, the variant table, known weak points |

## Where everything is

| Thing | Path (from the workspace root `AI video/`) |
|---|---|
| Finished videos | `Solid final videos/` (copies) and `solid-video/out/` |
| The ten cuts as data | `solid-video/variants.mjs` |
| Generator (data → HyperFrames projects) | `solid-video/build.mjs` |
| Generated projects (do not hand-edit) | `solid-video/videos/NN-name/`, each with a `SPEC.md` shot table |
| Footage, voice, logo, sounds, music | `solid-video/assets/` |
| Music synthesiser | `solid-video/tools/music.py` |
| Research reports | `solid-video/research/*.md` |
| Transcripts with word timings | `solid-video/research/transcripts/*.json` |
| Frame sheets used for review | `solid-video/research/sheets/` |
| Original inputs (untouched) | `drive-download-20261121T004318Z-1-001/` |
| Reusable workflow skill | `.claude/skills/short-form-video/SKILL.md` |
| Workspace guide for Claude | `CLAUDE.md` |

Research reports, each written by one research agent:
[reference-breakdown](../research/reference-breakdown.md) ·
[footage-catalogue](../research/footage-catalogue.md) ·
[screen-catalogue](../research/screen-catalogue.md) ·
[systems-digest](../research/systems-digest.md)

## The two videos the process borrows from

| Video | Video file | Transcript | Analysis |
|---|---|---|---|
| Nate Herk, "Opus 5.5 Just Changed Video Editing Forever (free skills)" | [videoplayback.mp4](../../Nate%20vid/videoplayback.mp4) | [transcript.md](../../Nate%20vid/transcript.md) | [nate-vid.md](../../hackathon-video/research/nate-vid.md) |
| GenHQ, "Claude as motion-graphics designer" | [videoplayback (1).mp4](../../Moption%20Vid/videoplayback%20(1).mp4) | [motionvid.txt](../../hackathon-video/transcripts/motionvid.txt) | [motion-vid.md](../../hackathon-video/research/motion-vid.md) |

Comparison of the two: [frameworks.md](../../hackathon-video/research/frameworks.md). What was taken from
each for this project: [systems-digest.md](../research/systems-digest.md). Their source URLs are not recorded in the workspace.
