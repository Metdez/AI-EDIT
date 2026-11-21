# phoebe-video

Ten variants of a 46.6 s vertical ad for Solid, cut from Phoebe's footage with the same generator as [../solid-video/](../solid-video/docs/README.md).
Made on 2026-11-21 with the [short-form-video skill](../.claude/skills/short-form-video/SKILL.md).

| What | Where |
|---|---|
| Raw footage (renamed, with a key) | [../Phoebe/](../Phoebe/README.md) |
| Finished videos | [../Phoebe final videos/](../Phoebe%20final%20videos/) and `out/` |
| The script and cut points | [SCRIPT.md](SCRIPT.md) |
| Steps taken, decisions, known flaws | [docs/PROCESS.md](docs/PROCESS.md) |
| The shot list (storyboard) | [docs/SHOTLIST.md](docs/SHOTLIST.md); per variant: `videos/NN-name/SPEC.md` |
| Research: takes, b-roll, generator digest | [research/](research/) (`aroll-catalogue.md`, `broll-catalogue.md`, `pipeline-digest.md`, `transcripts/`, `sheets/`, `frames/`) |
| The ten cuts as data | [variants.mjs](variants.mjs) |
| Generator | [build.mjs](build.mjs): `node build.mjs [NN]` rewrites `videos/NN-name/`. Never edit `videos/*` by hand. |
| Check, render and copy everything | `tools/render-all.sh [NN]` |
| Music bed | `tools/music.py` (needs numpy: `~/.local/share/whisper/venv/bin/python3.12`), then convert the wav to `assets/music-bright.m4a` |
| Standing edit preferences | [../solid-video/docs/PREFERENCES.md](../solid-video/docs/PREFERENCES.md) |

Assets: `main.mp4` is the voice take and always plays in sync with `voice.m4a`; `app`, `hero`, `phone`, `call`, `react` are the b-roll in use;
`screen.mp4` is the Solid screen recording from the first run.
